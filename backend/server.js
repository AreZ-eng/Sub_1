const express = require("express");
const helmet = require("helmet");
const fs = require("fs");
const https = require("https");
const db = require("./models");
require("dotenv").config();
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: "Too many requests from this IP, please try again later.",
        retryAfter: Math.ceil(15 * 60)
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: {
        message: "Too many admin requests from this IP, please try again later.",
        retryAfter: Math.ceil(15 * 60)
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cors({
    origin: ['http://localhost:13173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    exposedHeaders: ['x-access-token'],
    maxAge: 86400
}));

db.sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    return db.sequelize.sync({ force: false });
  })
  .then(() => {
    console.log("All models are synchronized with the database.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err.message);
  });

// Route sederhana
app.get('/', (req, res) => {
  res.send('Hello World!SUB_API');
});

// Import route lainnya dengan rate limiting
require('./routes/auth.route')(app, authLimiter)
require('./routes/election.route')(app, adminLimiter);

// Port
const PORT = process.env.PORT || 7000;

// Konfigurasi SSL jika SSL=ON
if (process.env.SSL === "ON") {
  const sslOptions = {
    key: fs.readFileSync("/etc/ssl/private/server.key"),
    cert: fs.readFileSync("/etc/ssl/private/server.crt")
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server is running securely on https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
  });
}
