const express = require("express");
const helmet = require("helmet");
const fs = require("fs");
const https = require("https");
const db = require("./models");
require("dotenv").config();
const cors = require("cors");

const app = express();

// Middleware keamanan
app.use(helmet());
app.use(express.json());

// Tambahkan middleware CORS sebelum route apa pun
app.use(cors({
  origin: 'http://localhost:13173', // sesuaikan dengan alamat frontend Anda
  credentials: true
}));

// Autentikasi database
db.sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    return db.sequelize.sync({ force: false });
  })
  .then(() => {
    console.log("All models are synchronized with the database.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err.message);
  });


// Route sederhana
app.get('/', (req, res) => {
  res.send('Hello World!SUB_API');
});

// Import route lainnya
require('./routes/auth.route')(app)
require('./routes/election.route')(app);

// Port
const PORT = process.env.PORT || 7000;

// Konfigurasi SSL jika SSL=ON
if (process.env.SSL === "ON") {
  const sslOptions = {
    key: fs.readFileSync("./certs/server.key"),
    cert: fs.readFileSync("./certs/server.crt")
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server is running securely on https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
