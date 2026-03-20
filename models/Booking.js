const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    pickUpDate: { 
        type: Date, 
        required: [true, 'Please add a pick-up date'] 
    },
    dropOffDate: { 
        type: Date, 
        required: [true, 'Please add a drop-off date'] 
    },
    user: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'User', 
        required: true 
    },
    car: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Car', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: true
  }
});

module.exports = mongoose.model('Booking', BookingSchema);