import express from 'express';
import { generateArticle,generateImage,blogTitle, removeImageBackground, removeImageObject, resumeReview } from '../controllers/aiController.js';
import {auth} from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';

const aiRoutes = express.Router();

console.log('AI Routes called');
aiRoutes.post('/generate-article' , auth , generateArticle);
aiRoutes.post('/generate-blog-titles' , auth , blogTitle);
aiRoutes.post('/generate-image' , auth , generateImage);
aiRoutes.post('/remove-image-background' ,upload.single('image'), auth , removeImageBackground);
aiRoutes.post('/remove-image-Object' ,upload.single('image'), auth , removeImageObject);
aiRoutes.post('/resume-review' ,upload.single('resume'), auth , resumeReview);

export default aiRoutes ;