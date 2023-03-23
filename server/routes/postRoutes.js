import express from 'express';
import * as dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import axios from 'axios';

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET ALL POSTS
router.route('/').get(async(req,res) => {
    try{
        const posts = await Post.find({});

        res.status(200).json({success: true, data: posts});
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, message: error});
    }
    
})

// CREATE A POST
router.route('/').post(async(req,res) => {
    try{
        const {name, prompt, photo, token} = req.body;
        const res = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`
          );
        if(res.data.success){
            console.log('Human');
            const photoUrl = await cloudinary.uploader.upload(photo, {format: 'webp'});
    
        const newPost = await Post.create({
            name,
            prompt,
            photo: photoUrl.url
        })
    
        res.status(200).json({success: true, data: newPost});
        }
        else{
            console.log('BOT!!!');
            res.status(500).json({success: false, message: 'Bot attack'});
        }
    }catch(e){
        res.status(500).json({success: false, message: e});
    }
});
export default router;
