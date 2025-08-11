import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Helper function to handle text generation and avoid code repetition
const generateTextContent = async ({
  userId,
  plan,
  free_usage,
  prompt,
  max_tokens,
  type,
}) => {
  if (plan !== "premium" && free_usage >= 10) {
    const error = new Error(
      "Usage limit reached. Please upgrade to a premium plan."
    );
    error.statusCode = 402; // Payment Required
    throw error;
  }

  const response = await AI.chat.completions.create({
    model: "gemini-1.5-flash",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: max_tokens,
  });

  const content = response.choices[0].message.content;

  await sql`
        INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, ${type})
    `;

  if (plan !== "premium") {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        free_usage: free_usage + 1,
      },
    });
  }

  return content;
};

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const { plan, free_usage } = req;

    if (!prompt || !length) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt and length are required." });
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
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

export const blogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const { plan, free_usage } = req;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required." });
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
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res
        .status(403)
        .json({
          success: false,
          message: "This feature is only available for premium subscriptions",
        });
    }

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required." });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data: imageBuffer } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      imageBuffer
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
      publish ?? false
    })
        `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Error in generateImage:", error);
    res
      .status(500)
      .json({
        success: false,
        message: `An internal server error occurred: ${error.message}`,
      });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res
        .status(403)
        .json({
          success: false,
          message: "This feature is only available for premium subscriptions",
        });
    }

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required." });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal" }],
    });

    await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
        `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Error in removeImageBackground:", error);
    res
      .status(500)
      .json({
        success: false,
        message: `An internal server error occurred: ${error.message}`,
      });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res
        .status(403)
        .json({
          success: false,
          message: "This feature is only available for premium subscriptions",
        });
    }

    if (!image || !object) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Image file and object are required.",
        });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const image_url = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${`Removed ${object} from image`}, ${image_url}, 'image')
        `;

    res.json({ success: true, content: image_url });
  } catch (error) {
    console.error("Error in removeImageObject:", error);
    res
      .status(500)
      .json({
        success: false,
        message: `An internal server error occurred: ${error.message}`,
      });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res
        .status(403)
        .json({
          success: false,
          message: "This feature is only available for premium subscriptions",
        });
    }

    if (!resume) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required." });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: `Resume file size exceeds allowed size (5MB).`,
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume content: \n\n ${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId},'Review the uploaded resume', ${content}, 'resume-review')
        `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("Error in resumeReview:", error);
    res
      .status(500)
      .json({
        success: false,
        message: `An internal server error occurred: ${error.message}`,
      });
  }
};
