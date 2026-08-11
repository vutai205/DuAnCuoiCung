const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [{ type: String, required: true }],
    combos: [
        {
            foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
            name: { type: String },
            count: { type: Number },
            price: { type: Number }
        }
    ],
    totalPrice: { type: Number, required: true },
    voucherCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    ticketCode: { type: String },
    paymentMethod: {
        type: String,
        enum: ['vnpay', 'cash'],
        default: 'vnpay'
    },
    expiresAt: { type: Date, default: null }, // Null for cash/direct payment at counter
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed'],
        default: 'unpaid'
    },
    isCheckedIn: {
        type: Boolean,
        default: false
    },
    isFoodDeducted: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date,
        default: null
    },
    checkInCancelReason: {
        type: String,
        default: null
    },
    checkInCancelledAt: {
        type: Date,
        default: null
    },
    checkInHistory: [
        {
            action: { type: String, enum: ['checkin', 'cancel_checkin'] },
            reason: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    isPrinted: {
        type: Boolean,
        default: false
    },
    printedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
