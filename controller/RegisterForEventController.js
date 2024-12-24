const RegistrationForEventModel = require('../models/EventRegisterModel');
const RegistrationCounterModel = require('../models/RegistrationCounter');
const otpGenerator = require('otp-generator');
const otpStore = new Map(); // Or use Redis for persistent storage
const nodemailer = require('nodemailer');
const Events = require('../models/Event');

// Setup Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate a unique registration ID based on a global counter
const generateRegistrationId = async (eventId) => {
    let counter = await RegistrationCounterModel.findOne(); // Find the global counter

    if (!counter) {
        // If no counter exists, create a new one with the initial value
        counter = new RegistrationCounterModel({ lastRegistrationNum: 1 });
    } else {
        // Increment the last used registration number
        counter.lastRegistrationNum += 1;
    }

    // Save the updated counter value
    await counter.save();

    // Format the registration ID
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format date as YYYYMMDD
    const prefix = `#EVT${eventId.slice(0, 3).toUpperCase()}${date}`;; // e.g., #EVT20241018

    // Use the counter's `lastRegistrationNum` for the numeric part, padded with leading zeros
    const registrationNum = String(counter.lastRegistrationNum).padStart(3, '0'); // 5-digit padding

    // Return the formatted registration ID
    return `${prefix}${registrationNum}`; // e.g., #EVT20241018001
};


// Register for an event and send OTP
const registerForEvent = async (req, res) => {
    const { eventId, fullName, mobile, email, organization } = req.body;
    const userId = req.user.userId;
    const currentUserEmail = req.user.emailId;

    if (!eventId || !fullName || !mobile || !email || !organization) {
        return res.status(400).json({ msg: 'Missing required fields' });
    }

    if (!currentUserEmail) {
        return res.status(400).json({ msg: 'No email defined for current user' });
    }

    try {

         // Check if the user is already registered for the event
         const existingRegistration = await RegistrationForEventModel.findOne({ eventId, userId });
         if (existingRegistration) {
             return res.status(400).json({ msg: 'Already registered for this event' });
         }

        const registrationId = await generateRegistrationId(eventId);
        const otp = otpGenerator.generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        // Store OTP with timestamp for validity check
        otpStore.set(currentUserEmail, {
            otp,
            expiresAt: Date.now() + 60000, // 1 minute validity
            userData: { eventId, userId, fullName, mobile, email, organization, registrationId }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: currentUserEmail,
            subject: 'Your OTP Code for Cert-In Event',
            html: `
                <p>Dear ${fullName},</p>
        
                <p>Thank you for expressing your interest in our event. To verify your request, please use the following One-Time Password (OTP):</p>

                    <p><strong>Your OTP Code:</strong> <span style="font-size: 18px; color: #007BFF;">${otp}</span></p>
                            
                    <p>Kindly enter this OTP to confirm your interest. If you did not make this request, you can safely ignore this email.</p>
                            
                    <p>We appreciate your enthusiasm and are excited to share more about the event with you. If you have any questions or require assistance, please contact us at <a href="mailto:support@company.com">support@company.com</a>.</p>
        
                <p>Best regards,</p>
                <p><strong>The Event Team</strong></p>
                <p>Cert-in</p>
                <br/>
                <p style="font-size: 12px; color: #888;">Please do not reply to this email. This is an automated message sent from an unmonitored account.</p>
            `,
        });
        res.status(200).json({ msg: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Verify OTP and complete the registration
const verifyEventOtp = async (req, res) => {
    const { currentUserEmail, otp } = req.body;
    const storedOtpData = otpStore.get(currentUserEmail);

    if (!storedOtpData) {
        return res.status(400).json({ msg: 'Invalid OTP or expired' });
    }

    const { otp: storedOtp, expiresAt, userData, attempts = 0 } = storedOtpData;

    if (Date.now() > expiresAt) {
        otpStore.delete(currentUserEmail);
        return res.status(400).json({ msg: 'OTP has expired' });
    }

    if (storedOtp !== otp) {
        const newAttempts = attempts + 1;

        if (newAttempts >= 3) {
            otpStore.delete(currentUserEmail);
            return res.status(400).json({ msg: 'Too many failed attempts. OTP invalidated' });
        }

        otpStore.set(currentUserEmail, { ...storedOtpData, attempts: newAttempts });
        return res.status(400).json({ msg: 'Invalid OTP. Please try again' });
    }

    const { eventId, userId, fullName, mobile, email, organization, registrationId } = userData;

    try {
        // Create the new registration entry with the final registration ID
        const newRegistration = new RegistrationForEventModel({
            eventId, userId, fullName, mobile, email, organization, registrationId
        });
        await newRegistration.save();

        otpStore.delete(currentUserEmail); // Clean up OTP after success

        // Fetch event details from the event model
        const eventDetails = await Events.findById(eventId);
        if (!eventDetails) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        const emailBody = `
        <h2 style="color: #007BFF;">Event Intrest Confirmation</h2>
        <p>Dear ${fullName},</p>
    
        <p>We are delighted to inform you that your intrest for the following event has been successfully completed:</p>
    
        <ul>
            <li><strong>Event Title:</strong> ${eventDetails.eventTitle}</li>
            <li><strong>Event Date:</strong> ${eventDetails.eventDate}</li>
            <li><strong>Event Location:</strong> ${eventDetails.eventLocation}</li>
            <li><strong>Target Audience:</strong> ${eventDetails.targetAudience}</li>
        </ul>
    
        <p><strong>Your Unique ID:</strong> <span style="font-size: 18px; color: #007BFF;">${registrationId}</span></p>
    
        <p>We sincerely appreciate your interest in our event and are excited to have you join us. This event promises to be an enriching experience, and we are confident that you will gain valuable insights.</p>
        
        <p>We look forward to your participation and seeing you at the event!</p>
    
        <p>Best regards,</p>
        <p><strong>The Event Team</strong></p>
        <p>Cert-in</p>
        <br/>
        <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply directly to this email. For any inquiries, contact our support team.</p>
    `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: currentUserEmail,
            subject: `Event Interest Confirmation - ${eventDetails.eventTitle}`,
            html: emailBody, // Send HTML-formatted email
           
        });

        return res.status(201).json({
            success: true,
            message: 'Event interest successful and email sent',
            data: newRegistration,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

// Function to get registered events for the authenticated user
const getRegisteredEvents = async (req, res) => {
    try {
        const { userId } = req.user;  // Assuming JWT authentication middleware sets req.user

        // Fetch user registrations and populate event details
        const registrations = await RegistrationForEventModel.find({ userId })
            .populate('eventId')
            .lean();  // Use lean for better performance when no additional mongoose features are needed

        if (!registrations.length) {
            return res.status(200).json([]); // No registrations found
        }

        // Map through registrations and extract necessary details
        const registeredEvents = registrations.map(({ _id, eventId, fullName, mobile, email, organization, registrationId, createdAt }) => ({
            _id,
            eventId: eventId,  // Ensure eventId exists
            userId,
            fullName,
            mobile,
            email,
            organization,
            registrationId,
            createdAt
        }));

        return res.status(200).json(registeredEvents);
    } catch (err) {
        console.error('Error fetching registered events:', err);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};



module.exports = { registerForEvent, verifyEventOtp , getRegisteredEvents};
