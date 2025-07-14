const express = require('express');
const path = require('path');

const app = express();

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, '../frontend/public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// Simple API endpoint for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date() });
});

// Sessions endpoint (simplified)
app.post('/api/sessions', (req, res) => {
    console.log('Session received:', req.body);
    res.json({ success: true, data: req.body });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
    console.log('Test the API: http://localhost:' + PORT + '/api/test');
});
