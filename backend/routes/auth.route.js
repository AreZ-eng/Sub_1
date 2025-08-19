const { body } = require('express-validator');
const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/auth.controller");

module.exports = function(app, authLimiter) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/auth/signin", [
        authLimiter,
        body('nama')
            .isLength({min: 1})
            .withMessage('Nama tidak boleh kosong')
            .trim()
            .escape(),
        body('tiket')
            .isLength({min: 1})
            .withMessage('Tiket tidak boleh kosong')
            .trim()
            .escape(),
    ], controller.signin);

    app.post("/api/auth/beginvote",[
        authJwt.verifyToken,
        authJwt.requireVoter,
    ], controller.beginVote);
}     
