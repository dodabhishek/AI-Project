import express from 'express';
import { generateArticle,generateImage,blogTitle } from '../controllers/aiController.js';
import {auth} from '../middlewares/auth.js';
const aiRoutes = express.Router();
console.log('AI Routes called');
aiRoutes.post('/generate-article' , auth , generateArticle);
aiRoutes.post('/generate-blog-titles' , auth , blogTitle);
aiRoutes.post('/generate-image' , auth , generateImage);
export default aiRoutes ;