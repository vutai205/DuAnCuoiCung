const Food = require('../models/Food');

exports.getFoods = async (req, res) => {
    try {
        const foods = await Food.find({}).sort({ createdAt: -1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFood = async (req, res) => {
    try {
        const { name, image, price, quantity, category } = req.body;
        const food = new Food({ name, image, price, quantity, category });
        const created = await food.save();
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (food) {
            Object.assign(food, req.body);
            const updated = await food.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Food not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (food) {
            await food.deleteOne();
            res.json({ message: 'Food deleted' });
        } else {
            res.status(404).json({ message: 'Food not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
