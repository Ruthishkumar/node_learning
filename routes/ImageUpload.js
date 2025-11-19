import express from 'express';
import upload from '../middleware/upload.js';
import { homeMiddleware } from '../middleware/home_middleware.js'; 
import UserImage from '../models/UserImage.js';
const router = express.Router();

router.post('/upload', homeMiddleware,  upload.single('image'), async (req, res) => {
    try {

       if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
       } 

       const base64Image = req.file.buffer.toString('base64');

       const savedImage = await UserImage.create({
          user : req.user,
          imageData : base64Image,
          contentType : req.file.mimetype
       });

       res.status(200).json({ 
          status : "success",
          message : "Image uploaded successfully",
          data : savedImage
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to upload image' });
    }
})

export default router;