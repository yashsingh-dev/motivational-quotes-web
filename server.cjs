const http = require('http');
const path = require('path');
const express = require('express');
const app = require('./backend/app');

const PORT = process.env.PORT || 5000;
console.log('NODE_ENV', process.env.NODE_ENV);
// Serve static files from the Vite build directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));

    // Handle SPA routing: serve index.html for all non-API routes
    app.get('/{*splat}', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        }
    });
}

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
