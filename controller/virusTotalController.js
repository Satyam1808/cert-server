const axios = require("axios");
require("dotenv").config();
const qs = require("qs");

exports.submitUrl = async (req, res) => {
    try {
        console.log("Received request body:", req.body); 

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const requestBody = qs.stringify({ url });

        const response = await axios.post(
            "https://www.virustotal.com/api/v3/urls",
            requestBody,
            {
                headers: {
                    "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("VirusTotal API error:", error.response?.data || error.message);
        res.status(500).json({ error: "VirusTotal API error" });
    }
};

exports.getReport = async (req, res) => {
    try {
        const { urlId } = req.params;

        if (!urlId) {
            return res.status(400).json({ error: "URL ID is required" });
        }

        const response = await axios.get(
            `https://www.virustotal.com/api/v3/analyses/${urlId}`,
            {
                headers: {
                    "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
                    Accept: "application/json",
                },
            }
        );

        const status = response.data.data.attributes.status;

        
        res.json({
            status,
            data: response.data.data
        });

    } catch (error) {
        console.error("Error fetching analysis report:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching analysis report from VirusTotal" });
    }
};