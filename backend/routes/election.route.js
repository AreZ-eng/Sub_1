const { body } = require('express-validator');
const authJwt = require("../middleware/authJwt");
const authName = require("../middleware/authToName");
const controller = require("../controllers/election.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/election/getCandidate", [
        authJwt.verifyToken,
    ], controller.getCandidate);

    app.post("/api/election/makeVoting", [
        authJwt.verifyToken,
        body("candidate").isLength({min: 1}),
        body("tps").isLength({min: 1}),
    ], controller.makeVoting);

    app.post("/api/election/totalballots", [
        body("password").isLength({min: 1}),
    ], controller.totalBallots);

    app.post("/api/election/resetvotes",[
        authName.verifyToName,
        body("ids").isLength({min: 1}),
    ], controller.resetVotes);
    
    app.post("/api/election/getballots", [
        authName.verifyToName,  
    ],controller.getBallots);
}     
