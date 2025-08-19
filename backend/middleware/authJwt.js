const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config");

verifyToken = (req, res, next) => {
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

        // Validasi claims JWT
        if (!decoded.id || !decoded.aud || !decoded.iss || !decoded.jti) {
            return res.status(401).send({
                message: "Invalid token claims!",
            });
        }

        // Validasi audience dan issuer
        if (decoded.aud !== 'e-voting-app' || decoded.iss !== 'sub-api') {
            return res.status(401).send({
                message: "Invalid token audience or issuer!",
            });
        }

        req.id = decoded.id;
        req.token = token;
        req.userRole = decoded.role || 'voter';
        req.userName = decoded.nama;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).send({
            message: "Admin role required!",
        });
    }
    next();
};

const requireVoter = (req, res, next) => {
    if (req.userRole !== 'voter') {
        return res.status(403).send({
            message: "Voter role required!",
        });
    }
    next();
};

const authJwt = {
    verifyToken: verifyToken,
    requireAdmin: requireAdmin,
    requireVoter: requireVoter
};

module.exports = authJwt;