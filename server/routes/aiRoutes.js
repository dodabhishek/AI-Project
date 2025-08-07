import express from 'express';
import { generateArticle } from '../controllers/aiController.js';
import {auth} from '../middlewares/auth.js';
const aiRoutes = express.Router();
console.log('AI Routes called');
aiRoutes.post('/generate-article' , auth , generateArticle);
export default aiRoutes ;