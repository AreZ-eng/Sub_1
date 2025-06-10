const { body } = require('express-validator');
const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/auth/signin", [
        body('nama').isLength({min: 1}),
        body('tiket').isLength({min: 1}),
    ], controller.signin);

    app.post("/api/auth/beginvote",[
        authJwt.verifyToken,
    ], controller.beginVote);
}     
