var mysql = require('mysql2');

var con = mysql.createConnection({
  host: process.env.HOST_MYSQL,
  user: process.env.USER_MYSQL,
  password: process.env.PASSWORD_MYSQL,
  database: process.env.DB_MYSQL,
  port: process.env.PORT_MYSQL
});

module.exports = {
  con
}
