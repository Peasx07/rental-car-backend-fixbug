const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Security & Extra Packages
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


// Route files
const auth = require('./routes/auth');
const providers = require('./routes/providers');
const bookings = require('./routes/bookings');
const cars = require('./routes/cars');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: "Backend is awake!" });
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// === Security Middleware ===
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100
});
app.use(limiter);

app.use(hpp());

// Enable CORS (อนุญาตให้ Frontend ต่างโดเมนเรียกใช้ API ได้)
app.use(cors({
    // เปลี่ยนมาใช้ค่าจาก .env ถ้าไม่มีให้ใช้ localhost:3000
    origin: 'https://rental-car-frontend-final-eter.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // ยอมรับการส่ง Cookies / Token จาก Frontend
}));
// ==========================

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/providers', providers);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/cars', cars);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});