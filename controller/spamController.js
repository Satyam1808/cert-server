const axios = require('axios');

exports.predictMessage = async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post('http://localhost:3001/predict', { message });
        return res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error predicting message' });
    }
};

exports.submitFeedback = async (req, res) => {
    const { message, feedback } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (feedback !== 'yes' && feedback !== 'no') {
        return res.status(400).json({ error: 'Feedback must be "yes" or "no"' });
    }

    try {
        const response = await axios.post('http://localhost:3001/feedback', 
            { message, feedback },
            { headers: { 'Content-Type': 'application/json' } }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
};