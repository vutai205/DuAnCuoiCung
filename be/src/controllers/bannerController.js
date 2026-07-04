const Banner = require('../models/Banner');

// @desc    Get active banners (for frontend display)
// @route   GET /api/banners
// @access  Public
exports.getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all banners (for Admin management)
// @route   GET /api/banners/admin
// @access  Private/Admin
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({}).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Private/Admin
exports.getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            res.json(banner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
    try {
        const { title, imageUrl, linkUrl, isActive } = req.body;
        
        const banner = new Banner({
            title,
            imageUrl,
            linkUrl,
            isActive: isActive !== undefined ? isActive : true
        });

        const createdBanner = await banner.save();
        res.status(201).json(createdBanner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            banner.title = req.body.title || banner.title;
            banner.imageUrl = req.body.imageUrl || banner.imageUrl;
            banner.linkUrl = req.body.linkUrl || banner.linkUrl;
            
            if (req.body.isActive !== undefined) {
                banner.isActive = req.body.isActive;
            }

            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            await banner.deleteOne();
            res.json({ message: 'Banner removed' });
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
