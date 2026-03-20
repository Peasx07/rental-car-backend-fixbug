const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // 1. เช็ค Token จาก Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // 2. เช็ค Token จาก Cookie (*** เพิ่มส่วนนี้เข้าไปครับ ***)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // ถ้าไม่มี Token เลย ทั้งใน Header และ Cookie
    if (!token || token === 'none') {
        return res.status(401).json({ success: false, message: 'Not authorize to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ดึงข้อมูล User และเก็บไว้ใน req.user
        req.user = await User.findById(decoded.id);

        // เช็คเผื่อกรณีหา User ใน DB ไม่เจอ (เช่น โดนลบไปแล้วแต่ Token ยังไม่หมดอายุ)
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorize to access this route' });
    }
};

// ส่วน authorize ไว้เหมือนเดิมได้เลยครับ (แต่เพิ่มเช็ค req.user หน่อยเพื่อความปลอดภัย)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized` 
            });
        }
        next();
    };
};