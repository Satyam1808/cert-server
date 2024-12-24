const axios = require('axios');

exports.predictMessage = async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post('http://localhost:3001/predict', { message });
        return res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error predicting message' });
    }
};

exports.submitFeedback = async (req, res) => {
    console.log('Request body:', req.body); // Debug incoming request

    const { message, feedback } = req.body;

    // Validate request
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (feedback !== 'yes' && feedback !== 'no') {
        return res.status(400).json({ error: 'Feedback must be "yes" or "no"' });
    }

    try {
        // Debug payload being sent to Flask API
        console.log('Sending to Flask API:', { message, feedback });

        // Send the request to Flask
        const response = await axios.post('http://localhost:3001/feedback', 
            { message, feedback },
            { headers: { 'Content-Type': 'application/json' } } // Ensure correct Content-Type
        );

        // Respond back with the Flask API's response
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error submitting feedback:', error.message);

        // Handle errors from Flask
        if (error.response) {
            console.log('Flask API response error:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
};