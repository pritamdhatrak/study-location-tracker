const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected successfully');
        } else {
            console.log('No MongoDB URI provided, using in-memory storage');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

// Study Session Schema
const studySessionSchema = new mongoose.Schema({
    duration: { type: Number, required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        accuracy: { type: Number, required: true }
    },
    timestamp: { type: Date, default: Date.now }
});

const StudySession = mongoose.model('StudySession', studySessionSchema);

// In-memory storage fallback
let sessionsMemory = [];

// API Routes
app.post('/api/sessions', async (req, res) => {
    try {
        console.log('Session received:', req.body);
        
        if (mongoose.connection.readyState === 1) {
            // MongoDB is connected
            const session = new StudySession(req.body);
            const savedSession = await session.save();
            res.json({ success: true, data: savedSession });
        } else {
            // Fallback to memory storage
            const session = { ...req.body, _id: Date.now() };
            sessionsMemory.unshift(session);
            sessionsMemory = sessionsMemory.slice(0, 50); // Keep only last 50
            res.json({ success: true, data: session });
        }
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/sessions', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            // MongoDB is connected
            const sessions = await StudySession.find().sort({ timestamp: -1 }).limit(10);
            res.json(sessions);
        } else {
            // Fallback to memory storage
            res.json(sessionsMemory.slice(0, 10));
        }
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(Server running on port );
    console.log(Health check: http://localhost:/health);
});
