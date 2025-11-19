import express from 'express';
import User from '../models/User.js';
import {authMiddleware} from '../middleware/auth_middleware.js';
const router = express.Router();

/// get all users
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            status: "success",
            data : users,
            count: users.length,
           });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/// get user by id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const users = await User.findById(req.params.id).select('-password');

      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        status: "success",
        data : users,
      });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


export default router;