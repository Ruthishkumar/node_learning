import jwt from 'jsonwebtoken';

export const homeMiddleware = (req, res, next) => {
    console.log('Home middleware accessed');
     const token = req.header('Authorization').split(" ")[1];
    console.log(`Token from header: ${token}`);

    if (!token) {
     return res.status(401).json({ token: "No token, authorization denied" });
    }
    
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        console.log(`Decoded user ID: ${req.user}`);
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }

}