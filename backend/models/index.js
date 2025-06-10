const config = require("../configs/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(config.db, config.user, config.password, {
    host: config.host || "localhost",
    dialect: 'postgres',
    timezone: config.timezone,
    logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.vote = require("./vote.model.js")(sequelize, Sequelize);
db.candidate = require("./candidate.model.js")(sequelize, Sequelize);

db.user.hasOne(db.vote);
db.vote.belongsTo(db.user);

module.exports = db;
