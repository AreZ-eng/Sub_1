const db = require("../models");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const config = require("../configs/auth.config");
const https = require("https");
const axios = require("axios");
const { mainApiBaseUrl } = require("../configs/service.config");

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; 

const isRateLimited = (identifier) => {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now };
    
    if (now - attempts.firstAttempt > LOCKOUT_TIME) {
        loginAttempts.delete(identifier);
        return false;
    }
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        return true;
    }
    
    return false;
};

const recordLoginAttempt = (identifier, success) => {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now };
    
    if (success) {
        loginAttempts.delete(identifier);
    } else {
        attempts.count++;
        loginAttempts.set(identifier, attempts);
    }
};

exports.signin = async (req, res) => {
    console.log(`[AUTH] signin - User: ${req.body.nama || 'unknown'}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(`[AUTH] signin - Error: Validation errors for username: ${req.body.username}`, errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const identifier = req.body.nama;
    
    // Cek rate limiting
    if (isRateLimited(identifier)) {
        console.error(`[AUTH] signin - Error: Rate limited for identifier: ${identifier}`);
        return res.status(429).json({ 
            message: "Too many login attempts. Please try again later.",
            retryAfter: Math.ceil(LOCKOUT_TIME / 1000)
        });
    }
 
    try {
        const user = await User.findOne({ where: { nama: req.body.nama } });
        if (!user) {
            recordLoginAttempt(identifier, false);
            console.error(`[AUTH] signin - Error: User not found for nama: ${req.body.nama}`);
            return res.status(404).send({ message: "User not found." });
        }
 
        const tiket = bcrypt.compareSync(req.body.tiket, user.tiket);
        if (!tiket) {
            recordLoginAttempt(identifier, false);
            console.error(`[AUTH] signin - Error: Invalid ticket for user: ${req.body.nama}`);
            return res.status(401).send({ accessToken: null, message: "Invalid ticket!" });
        }
  
        const token = jwt.sign(
            { 
                id: user.id,
                nama: user.nama,
                role: user.role || 'voter',
                aud: 'e-voting-app',
                iss: 'sub-api',
                jti: require('crypto').randomBytes(16).toString('hex')
            }, 
            config.secret, 
            { 
                expiresIn: 300,
                // notBefore: Math.floor(Date.now() / 1000)
            }
        );
  
        console.log(`[AUTH] signin - Success: ${user.nama}`);
        return res.status(200).send({
            id: user.id,
            nama: user.nama,
            role: user.role || 'voter',
            accessToken: token,
        });
    } catch (error) {
        recordLoginAttempt(identifier, false);
        console.error(`[AUTH] signin() - Error:`, error);
        return res.status(500).send({ message: "An error occurred during signin." });
    }
};

exports.beginVote = async (req, res) => {
    console.log(`[AUTH] beginVote for ${req.id}`);
    
    try {
        const token = req.token;
        const agent = new https.Agent({ rejectUnauthorized: false });

        const response = await axios.post(
            `${mainApiBaseUrl}/api/election/startvoting`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                httpsAgent: agent,
            }
        );

        console.log(`[AUTH] beginVote - Success (${req.id})`);
        res.status(200).send(response.data);
    } catch (error) {
        console.error(`[AUTH] beginVote - Error:`, error.message);
        res.status(500).send({
            message: "Error communicating with main API",
            error: error.response?.data || error.message,
        });
    }
};
