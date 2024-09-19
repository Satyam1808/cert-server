const express = require('express');
const cors = require('cors');
const connectDB = require('./config/Db');
const authRoutes = require('./routes/Userauth');
const adminRoutes = require('./routes/Adminauth');
const uploadBookletRoutes = require('./routes/Uploadbooklets');
const path = require('path');

const app = express();
connectDB();

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminRoutes);
app.use('/api/upload', uploadBookletRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
