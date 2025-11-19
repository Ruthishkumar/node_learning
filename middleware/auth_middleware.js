import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').split(" ")[1];
    console.log(`Token from header: ${token}`);

    if (!token) {
     return res.status(401).json({ token: "No token, authorization denied" });
    }
    

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
