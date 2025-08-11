import express from 'express'
import {auth} from '../middlewares/auth.js';
import { getUserCreations,getPublishedCreations,toggleLikeCreations } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/get-user-creation' , auth , getUserCreations);
userRouter.get('/get-published-creation' , auth , getPublishedCreations);
userRouter.post('/toggle-like-creation' , auth , toggleLikeCreations);

export default userRouter;