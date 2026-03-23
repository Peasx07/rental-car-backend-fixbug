const User = require('../models/User');
const jwt = require('jsonwebtoken'); // เพิ่มการนำเข้า jwt เพื่อใช้ตรวจสอบ Token

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const isProd = process.env.NODE_ENV === 'production';

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // prod: ต้อง secure + sameSite none เพื่อให้ข้ามโดเมนได้
        // dev: ถ้าเป็น http ให้ secure=false ไม่งั้น browser จะไม่เก็บ cookie
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'          // 🚨 เพิ่มอันนี้เข้าไปเพื่อให้คุกกี้ใช้ได้ทุกหน้า
    };

    res.status(statusCode)
       .cookie('token', token, options) 
       .json({ 
           success: true, 
           token // ส่ง token ไปใน body ด้วยเผื่อกรณีคุกกี้มีปัญหา
       });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    try {
        // ลบส่วนที่ดัก "You are already logged in" ออกไปเลยครับ
        const { name, telephone, email, password, role } = req.body;
        const user = await User.create({ name, telephone, email, password, role });
        
        res.status(201).json({
            success: true,
            message: "Registration successful. Please log in."
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
exports.login = async (req, res, next) => {
    try {
        // ลบส่วนที่ดัก "You are already logged in" ออกไปเช่นกันครับ
        // เพื่อให้ถ้าเขากรอกรหัสใหม่ เราจะทับคุกกี้เก่าให้ทันที
        
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // ฟังก์ชันนี้จะไปเซ็ตคุกกี้ใหม่ทับอันเดิมให้เองครับ
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
exports.logout = async (req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', 'none', { 
        expires: new Date(Date.now() + 10 * 1000), 
        httpOnly: true,
        // --- ต้องใส่เหมือนตอน login ไม่งั้นเบราว์เซอร์จะไม่ยอมให้ลบ ---
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'
    });
    res.status(200).json({ success: true, message: 'Logged out!' });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};