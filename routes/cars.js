const express = require('express');
const { getCars, getCar, createCar } = require('../controllers/cars');
const { protect, authorize } = require('../middleware/auth');

const bookingRouter = require('./bookings');


const router = express.Router({ mergeParams: true });

router.use('/:carId/bookings', bookingRouter);

router.route('/')
    .get(protect,authorize('admin','user'),getCars) // ต้อง Login ก่อน
    .post(protect, authorize('admin'), createCar); // เฉพาะ Admin ที่เพิ่มรถเข้าไปในระบบได้

router.route('/:id')
    .get(protect, authorize('admin', 'user'), getCar);


module.exports = router;