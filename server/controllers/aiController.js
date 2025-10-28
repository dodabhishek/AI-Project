import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";
// Lazy import pdf-parse inside the handler to avoid startup crashes in certain environments

// OpenAI-compatible Gemini endpoint config
const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


// ---------------- Helper Function ----------------
const generateTextContent = async ({ userId, plan, free_usage, prompt, max_tokens, type }) => {
  if (plan !== "premium" && free_usage >= 10) {
    const error = new Error("Usage limit reached. Please upgrade to a premium plan.");
    error.statusCode = 402;
    throw error;
  }

 const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: prompt,
        },
    ],
});

  const content = response.choices[0].message.content;

  await sql`
    INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, ${type})
  `;

  if (plan !== "premium") {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { free_usage: free_usage + 1 },
    });
  }

  return content;
};

// ---------------- Text Endpoints ----------------
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prompt, length } = req.body;
    const { plan, free_usage } = req;

    if (!prompt || !length) {
      return res.status(400).json({ success: false, message: "Prompt and length are required." });
    }

    const content = await generateTextContent({
      userId,
      plan,
      free_usage,
      prompt,
      max_tokens: length,
      type: "article",
    });

    res.json({ success: true, content });
  } catch (error) {
    console.error("Error in generateArticle:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const blogTitle = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prompt } = req.body;
    const { plan, free_usage } = req;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }

    const content = await generateTextContent({
      userId,
      plan,
      free_usage,
      prompt,
      max_tokens: 100,
      type: "blog-title",
    });

    res.json({ success: true, content });
  } catch (error) {
    console.error("Error in blogTitle:", error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ---------------- Image Endpoints ----------------
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({ success: false, message: "Premium subscription required." });
    }
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data: imageBuffer } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      { headers: { "x-api-key": process.env.CLIPDROP_API_KEY }, responseType: "arraybuffer" }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Error in generateImage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove background
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({ success: false, message: "Premium subscription required." });
    }
    if (!image) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, { transformation: [{ effect: "background_removal" }] });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Removed background', ${secure_url}, 'image')
    `;

    fs.unlinkSync(image.path); // cleanup
    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("removeImageBackground Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resume Review
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth;
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({ success: false, message: "Premium subscription required." });
    }
    if (!resume) {
      return res.status(400).json({ success: false, message: "Resume file is required." });
    }
    if (resume.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "Resume exceeds 5MB." });
    }

    const { default: pdf } = await import('pdf-parse');
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback:\n\n${pdfData.text}`;

    const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: prompt,
        },
    ],
});

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Resume review', ${content}, 'resume-review')
    `;

    fs.unlinkSync(resume.path); // cleanup
    res.json({ success: true, content });
  } catch (error) {
    console.error("resumeReview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};