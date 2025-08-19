const { body } = require('express-validator');
const authJwt = require("../middleware/authJwt");
const authName = require("../middleware/authToName");
const controller = require("../controllers/election.controller");

module.exports = function(app, adminLimiter) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/election/getCandidate", [
        authJwt.verifyToken,
        authJwt.requireVoter,
    ], controller.getCandidate);

    app.post("/api/election/makeVoting", [
        authJwt.verifyToken,
        authJwt.requireVoter,
        body("candidate")
            .isUUID()
            .withMessage('Candidate ID harus berupa UUID yang valid')
            .trim()
            .escape(),
        body("tps")
            .isInt({ min: 1 })
            .withMessage('TPS harus berupa angka positif')
            .trim()
            .escape(),
    ], controller.makeVoting);

    app.post("/api/election/totalballots", [
        adminLimiter,
        body("password")
            .isLength({min: 1})
            .withMessage('Password tidak boleh kosong')
            .trim()
            .escape(),
    ], controller.totalBallots);

    app.post("/api/election/resetvotes",[
        authName.verifyToName,
        adminLimiter,
        body("ids")
            .isArray()
            .withMessage('IDs harus berupa array')
            .custom((value) => {
                if (!Array.isArray(value) || value.length === 0) {
                    throw new Error('IDs tidak boleh kosong');
                }
                return true;
            }),
    ], controller.resetVotes);
    
    app.post("/api/election/getballots", [
        authName.verifyToName,
        adminLimiter,
    ],controller.getBallots);
}     
