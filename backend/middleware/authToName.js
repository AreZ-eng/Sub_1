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

        if(decoded.id === '22d3e3dc-4043-4b66-a957-63152d7726d5'){
            next();
        } else {
            return res.status(403).send({
                message: "Not Allowed!",
            });
        }
    });
};

const authName = {
    verifyToName: verifyToName
};

module.exports = authName;