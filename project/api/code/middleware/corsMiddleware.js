const cors = require('cors');

const corsOptions = {
  //origin: process.env.URL_LIST,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);