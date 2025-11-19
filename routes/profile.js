import express from 'express';
import Profile from  '../models/Profile.js';
import {homeMiddleware} from '../middleware/home_middleware.js';
const router = express.Router();

/// create user profile
router.post('/create', homeMiddleware,  async (req, res) => {
    try {
        let profile = await Profile.findOne({user: req.user});

        
        console.log(`Gender Body ${req.body.gender}`);
        const validGenders = ["Male", "Female", "Other"];
              if (!validGenders.includes(req.body.gender)) {
                 return res.status(400).json({
                  status: "failure",
                  message: "Please provide a valid gender"
           });
         }
        if (profile) {
           profile = await Profile.findOne({user: req.user}).populate('user', ['name', 'email']);

           return res.status(200).json({
                status : "success",
                message: "Profile already exists",
                data : profile
            });
        }

        const  newProfile = await Profile.create({
            user: req.user,
            ...req.body
        })

        const savedProfile = await Profile.findOne({user: req.user}).populate('user', ['name', 'email']);

        res.status(200).json({
            status : "success",
            message: "Profile created successfully",
            data : savedProfile
        });

    } catch(error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
})

/// update user profile 
router.put('/update/:id', homeMiddleware,  async (req, res) => {
    try {
        let profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ 
                status : "failure",
                message: "Profile not found" });
        }

        const validGenders = ["Male", "Female", "Other"];
              if (!validGenders.includes(req.body.gender)) {
                 return res.status(400).json({
                  status: "failure",
                  message: "Please provide a valid gender"
           });
         }

        profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {new: true}).populate('user', ['name', 'email']);

        res.status(200).json({
            status : "success",
            message: "Profile updated successfully",
            data : profile
        });

    } catch(error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
});

router.post('/get', homeMiddleware,  async (req, res) => {});

export default router;