const cors = require('cors');

const corsOptions = {
  origin: [process.env.URL_1, process.env.URL_2],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);