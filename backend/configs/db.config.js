require('dotenv').config();

module.exports =  {
    host:process.env.POSTGRES_HOST,
    user:process.env.POSTGRES_USER,
    password:process.env.POSTGRES_PASSWORD,
    db:process.env.POSTGRES_DB,
    quoteIdentifiers: true,
    timezone: '+07:00'
};
