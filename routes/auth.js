import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEmail } from '../utils/validator.js';

const router = express.Router();

/// register user
router.post('/register', async (req, res) => {
    const {name, email, password} = req.body;   
    try {

       if (!name || !email || !password) {
       return res.status(400).json({ message: "Please enter all fields" });
       }        

       if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
       }

        let user = await User.findOne({email});
        if (user) {
            res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            name,
            email,
            password: hashedPassword,
            refreshToken: null
        });

        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        user.refreshToken = refreshToken;
        await user.save();
        res.status(201).json({ 
            status : "success",
            message: "User registered successfully",
            accessToken,
            refreshToken });  

    } catch(error) {
        res.status(500).json({ message: "Server error" });
    }
});

/// Login user
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try{
      
        if (!email || !password) {
          return  res.status(400).json({ message: "Please enter all fields" });
        }

        if (!validateEmail(email)) {
           return res.status(400).json({ message: "Invalid email format" });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({ 
                status : 'failure',
                message: "Email Not Found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Type Password: ${typeof password}`);
        console.log(`Type HashedPassword: ${typeof user.password}`);


        if (!isMatch) {
            return res.status(400).json({
                status : "failure",
                message: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`ENV TOKEN ${process.env.JWT_SECRET}`);

        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            status : "success",
            message: "Login successful", 
            accessToken,
            refreshToken });

    } catch(error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
});

/// forgot password
router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;
    try {
      const user = await User.findOne({email});
      if (!user) {
        res.status(404).json({ message: "Email not found" });
      }

      const resetToken = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: '15m' });

      res.status(200).json({
        status : "success",
        message: "Password reset token generated",
        token : resetToken,
        resetLink : `http://localhost:5000/api/auth/reset-password?token=${resetToken}`
    });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
});


/// reset password
router.post('/reset-password/:token', async (req, res) => {
    const {newPassword} = req.body;
    const {token} = req.params;
    try {
        
        /// verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /// find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }

        /// hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status : "success",
            message: "Password reset successful"
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
});

/// refresh token
router.post('/refresh-token', async (req, res) => {
  const {refreshToken} = req.body;
  console.log(`Refresh Token: ${refreshToken}`);

  try {

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
  }

  const user = await User.findOne({refreshToken});
  console.log(`User from refresh token: ${user}`);


  if (!user) {
    res.status(403).json({ message: "Invalid refresh token" });
  }

  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  user.refreshToken = newRefreshToken;
  await user.save();

  res.status(200).json({
    status : "success",
    accessToken,
    user : {
        id : user._id,
        name : user.name,
        email : user.email
      }
   });
 } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log(error);}
});


/// delete user 
router.delete('/:id', async (req, res) => {
   try {
    const user = await User.findByIdAndDelete(req.params.id);
    console.log(`Deleted User: ${user}`);

    if (!user) {
        return res.status(404).json(({message: "User not found"}));
    }   

    res.status(200).json({
        status : "success",
        message : "User deleted successfully"
    })

   } catch (error) {
     res.status(500).json({ message: "Server error" });
    console.log(error);
   }
});

export default router;