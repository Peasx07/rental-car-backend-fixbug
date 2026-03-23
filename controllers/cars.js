const Car = require('../models/Car');
const Provider = require('../models/Provider');

// @desc    Get all cars
// @route   GET /api/v1/cars
// @route   GET /api/v1/providers/:providerId/cars
exports.getCars = async (req, res, next) => {
    try {
        let query;

        // ถ้ามีการส่ง providerId มาทาง URL ให้หาเฉพาะรถของ Provider นั้น
        if (req.params.providerId) {
            query = Car.find({ provider: req.params.providerId });
        } else {
            // ถ้าไม่ส่งมา ให้ดึงรถทั้งหมด พร้อมข้อมูล Provider
            query = Car.find().populate({
                path: 'provider',
                select: 'name address telephone'
            });
        }

        const cars = await query;
        res.status(200).json({ success: true, count: cars.length, data: cars });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single car
// @route   GET /api/v1/cars/:id
exports.getCar = async (req, res, next) => {
    try {
        const car = await Car.findById(req.params.id).populate({
            path: 'provider',
            select: 'name address telephone'
        });

        if (!car) {
            return res.status(404).json({ success: false, message: `No car with id ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: car });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add a car
// @route   POST /api/v1/providers/:providerId/cars
exports.createCar = async (req, res, next) => {
    try {
        req.body.provider = req.params.providerId;

        const provider = await Provider.findById(req.params.providerId);
        if (!provider) {
            return res.status(404).json({ success: false, message: `No provider with the id of ${req.params.providerId}` });
        }

        const car = await Car.create(req.body);
        res.status(201).json({ success: true, data: car });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};