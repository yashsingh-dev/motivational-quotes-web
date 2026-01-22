const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const dbConnection = require('./db/connection');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

dbConnection();
app.use(helmet({ contentSecurityPolicy: false, }));
app.use(cors({
    origin: "*",
    credentials: true,
    exposedHeaders: ['x-access-token', 'x-refresh-token']
}));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    next();
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(routes);
app.use(errorHandler);


module.exports = app;