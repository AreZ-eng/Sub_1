require('dotenv').config()

module.exports = {
    secret: process.env.JWT_SECRET,
    totalPassword: process.env.TOTAL_PASSWORD,
};
