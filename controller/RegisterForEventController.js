const RegistrationForEventModel = require('../models/EventRegisterModel');
const RegistrationCounterModel = require('../models/RegistrationCounter');
const otpGenerator = require('otp-generator');
const otpStore = new Map();
const nodemailer = require('nodemailer');
const Events = require('../models/Event');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateRegistrationId = async (eventId) => {
    let counter = await RegistrationCounterModel.findOne();
    if (!counter) {
        counter = new RegistrationCounterModel({ lastRegistrationNum: 1 });
    } else {
        counter.lastRegistrationNum += 1;
    }
    await counter.save();
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `#EVT${eventId.slice(0, 3).toUpperCase()}${date}`;
    const registrationNum = String(counter.lastRegistrationNum).padStart(3, '0');
    return `${prefix}${registrationNum}`;
};

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

        otpStore.set(currentUserEmail, {
            otp,
            expiresAt: Date.now() + 60000,
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
        res.status(500).json({ msg: 'Server error' });
    }
};

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
        const newRegistration = new RegistrationForEventModel({
            eventId, userId, fullName, mobile, email, organization, registrationId
        });
        await newRegistration.save();

        otpStore.delete(currentUserEmail);

        const eventDetails = await Events.findById(eventId);
        if (!eventDetails) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        const emailBody = `
        <h2 style="color: #007BFF;">Event Interest Confirmation</h2>
        <p>Dear ${fullName},</p>
        <p>We are delighted to inform you that your interest for the following event has been successfully completed:</p>
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
            html: emailBody,
        });

        return res.status(201).json({
            success: true,
            message: 'Event interest successful and email sent',
            data: newRegistration,
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

const getRegisteredEvents = async (req, res) => {
    try {
        const { userId } = req.user;

        const registrations = await RegistrationForEventModel.find({ userId })
            .populate('eventId')
            .lean();

        if (!registrations.length) {
            return res.status(200).json([]);
        }

        const registeredEvents = registrations.map(({ _id, eventId, fullName, mobile, email, organization, registrationId, createdAt }) => ({
            _id,
            eventId: eventId,
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
        return res.status(500).json({ msg: 'Internal server error' });
    }
};

const getRegisteredEventsForAdmin = async (req, res) => {
    try {
        const registrations = await RegistrationForEventModel.aggregate([
            {
                $group: {
                    _id: '$eventId',
                    totalParticipants: { $sum: 1 },
                    participants: { $push: '$$ROOT' },
                },
            },
        ]);

        if (!registrations.length) {
            return res.status(200).json([]);
        }

        const eventIds = registrations.map((reg) => reg._id);
        const events = await Events.find({ _id: { $in: eventIds } }).lean();

        const registeredEvents = registrations.map((reg) => {
            const event = events.find((e) => e._id.toString() === reg._id.toString());
            return {
                eventId: reg._id,
                eventTitle: event?.eventTitle || 'Unknown Event',
                eventDate: event?.eventDate || 'N/A',
                totalParticipants: reg.totalParticipants,
                eventLocation: event?.eventLocation || 'N/A',
                targetAudience: event?.targetAudience || 'N/A',
                eventStatus: event?.eventStatus || 'N/A',
                participants: reg.participants.map((participant) => ({
                    userId: participant.userId,
                    fullName: participant.fullName,
                    mobile: participant.mobile,
                    email: participant.email,
                    organization: participant.organization,
                    registrationId: participant.registrationId,
                })),
            };
        });

        return res.status(200).json(registeredEvents);
    } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
    }
};

module.exports = { registerForEvent, verifyEventOtp, getRegisteredEvents, getRegisteredEventsForAdmin };