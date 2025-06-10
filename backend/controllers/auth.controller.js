const db = require("../models");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const config = require("../configs/auth.config");
const https = require("https");
const axios = require("axios");

exports.signin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
 
    try {
        const user = await User.findOne({ where: { nama: req.body.nama } });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
 
        const tiket = bcrypt.compareSync(req.body.tiket, user.tiket);
        if (!tiket) {
            return res.status(401).send({ accessToken: null, message: "Invalid ticket!" });
        }
 
        const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 600 });
 
        return res.status(200).send({
            id: user.id,
            nama: user.nama,
            accessToken: token,
        });
    } catch (error) {
        console.error("Error during signin:", error);
        return res.status(500).send({ message: "An error occurred during signin." });
    }
};

exports.beginVote = async (req, res) => {
    try {
        const token = req.token;

        const agent = new https.Agent({ rejectUnauthorized: false });

        const response = await axios.post(
            "http://app_main_api:5000/api/election/startvoting",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                httpsAgent: agent,
            }
        );

        res.status(200).send(response.data);
    } catch (error) {
        console.error("Error calling main API:", error.message);
        res.status(500).send({
            message: "Error communicating with main API",
            error: error.response?.data || error.message,
        });
    }
};
