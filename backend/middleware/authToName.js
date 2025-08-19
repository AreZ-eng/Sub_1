const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config");

verifyToName = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(403).send({
            message: "No token provided!",
        });
    }

    token = token.split(" ")[1];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!",
            });
        }

        if (!decoded.id || !decoded.aud || !decoded.iss || !decoded.jti) {
            return res.status(401).send({
                message: "Invalid token claims!",
            });
        }

        if (decoded.aud !== 'e-voting-app' || decoded.iss !== 'main-api') {
            return res.status(401).send({
                message: "Invalid token audience or issuer!",
            });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).send({
                message: "Admin role required!",
            });
        }

        req.id = decoded.id;
        req.token = token;
        next();
    });
};

const authName = {
    verifyToName: verifyToName
};

module.exports = authName;