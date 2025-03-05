const express = require('express');
const cors = require('cors');
const connectDB = require('./config/Db');
const authRoutes = require('./routes/Userauth');
const adminRoutes = require('./routes/Adminauth');
const uploadBookletRoutes = require('./routes/Uploadbooklets');
const addEventsRoutes = require('./routes/AddEvents');
const uploadQuizRoutes = require('./routes/AddQuizRoutes');
const uploadVisualImagesRoutes = require('./routes/AddVisualGalleryRoutes');
const registerForEventRoutes = require('./routes/RegisterForEventRoutes');
const posterLikeRoutes = require('./routes/PosterLikeRoutes');
const quizResult = require('./routes/QuizResultRoutes');
const path = require('path');
const spamRoutes = require('./routes/spamRoutes');
const bodyParser = require('body-parser');
const userHelpRoutes = require('./routes/UserHelpAndSupportRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const passwordGeneratorRoutes = require('./routes/passwordGeneratorRoutes');
const certificateRoutes = require('./routes/QuizCertificateRoute');
const { Server } = require('socket.io');
const chatbotRoutes = require('./routes/botRoute');
const ChatbotMessage = require('./models/botModel');
const http = require('http');
const virusTotalRoutes = require("./routes/virusTotalRoutes");

const app = express();
connectDB();

// Middleware to enable CORS
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();

// Middleware to parse JSON bodies
app.use(express.json());


// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/generated_certificates', express.static(path.join(__dirname, 'generated_certificates')));

app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminRoutes);
app.use('/api/upload', uploadBookletRoutes);
app.use('/api/upload',addEventsRoutes);
app.use('/api/upload',uploadQuizRoutes);
app.use('/api/upload',uploadVisualImagesRoutes);
app.use('/api/register',registerForEventRoutes);
app.use('/api/posters',posterLikeRoutes);
app.use('/api/quiz-result',quizResult);
app.use('/api/spam', spamRoutes);
app.use('/api/userhelp', userHelpRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/password-generator', passwordGeneratorRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/bot',chatbotRoutes);
app.use("/api/virus-total", virusTotalRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
