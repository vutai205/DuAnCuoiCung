const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 100 },
    category: { type: String, default: 'Bỏng nước' }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
