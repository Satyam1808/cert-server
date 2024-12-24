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
const helmet = require('helmet');
const passwordGeneratorRoutes = require('./routes/passwordGeneratorRoutes');
const certificateRoutes = require('./routes/QuizCertificateRoute');
const { Server } = require('socket.io');
const chatbotRoutes = require('./routes/botRoute');
const ChatbotMessage = require('./models/botModel');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
connectDB();

// Middleware to enable CORS
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();

// Middleware to parse JSON bodies
app.use(express.json());

// Realtime Communication with Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', async (data) => {
    try {
      const message = await ChatbotMessage.findById(data.messageId).populate('options.nextMessageId');
      socket.emit('botResponse', message);
    } catch (err) {
      socket.emit('error', { message: 'Error fetching message' });
    }
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});


// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
