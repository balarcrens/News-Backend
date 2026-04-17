const Subscription = require('../models/Subscription');
const { sendSubscriptionEmail } = require('../services/emailService');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide an email' });
        }

        let subscription = await Subscription.findOne({ email });

        if (subscription) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        subscription = await Subscription.create({ email });

        try {
            await sendSubscriptionEmail(email);
        } catch (err) {
            console.error('Email could not be sent', err);
        }

        res.status(201).json({
            success: true,
            message: 'Subscribed successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
