const bcrypt = require('bcrypt');
const password = "kirisaki890";
bcrypt.hash(password, 8).then(console.log);
