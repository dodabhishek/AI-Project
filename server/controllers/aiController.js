import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import FormData from 'form-data';
import axios from "axios";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/models/"
});

// Helper function to handle text generation and avoid code repetition
const generateTextContent = async ({ userId, plan, free_usage, prompt, max_tokens, type }) => {
    if (plan !== 'premium' && free_usage >= 10) {
        const error = new Error("Usage limit reached. Please upgrade to a premium plan.");
        error.statusCode = 402; // Payment Required
        throw error;
    }

    const response = await AI.chat.completions.create({
        model: "gemini-1.5-flash", // Use correct Google API model name
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: max_tokens,
    });

    const content = response.choices[0].message.content;

    await sql`
        INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, ${type})
    `;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
             // Clerk's privateMetadata must be an object
            privateMetadata: {
                'free_usage': free_usage + 1
            }
        });
    }

    return content;
};

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const { plan, free_usage } = req;

        const content = await generateTextContent({
            userId,
            plan,
            free_usage,
            prompt,
            max_tokens: length,
            type: 'article'
        });

        res.json({ success: true, content });

    } catch (error) {
        console.error("Error in generateArticle:", error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const blogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const { plan, free_usage } = req;

        const content = await generateTextContent({
            userId,
            plan,
            free_usage,
            prompt,
            max_tokens: 100,
            type: 'blog-title' // Use a more descriptive type
        });

        res.json({ success: true, content });

    } catch (error) {
        console.error("Error in blogTitle:", error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const generateImage = async (req, res) => {
    console.log('generateImage called');
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: "This feature is only available for premium subscriptions" });
        }

        const formData = new FormData();
        formData.append('prompt', prompt);

        const { data: imageBuffer } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            responseType: "arraybuffer"
        });

        const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            folder: `ai_creations/${userId}`
        });

        await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
        `;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.error("Error in generateImage:", error);
        res.status(500).json({ success: false, message: `An internal server error occurred: ${error.message}` });
    }
};