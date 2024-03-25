const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.TOKEN;

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        // LOG - 400 //
        insertLog(req.user.id, req.user.username, '011-001-400-001', "400", "token", JSON.stringify(req.params),'Token no proporcionado', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        return res.status(400).json({ error: 'Token no proporcionado' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // LOG - 401 //
            insertLog(req.user.id, req.user.username, '011-001-401-001', "401", "token", JSON.stringify(req.params),'Token inválido', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.user = decoded;
        // LOG - 200 //
        insertLog(req.user.id, req.user.username, '011-001-200-001', "200", "token", JSON.stringify(req.params),'Token validado con exito', JSON.stringify(err), (err, insertedId) => { if (err) { console.error("Error al insertar el log:", err); } res.send(result); });
        next();
    });
}

function insertLog(user_id, username, log_code, log_message, log_trace, callback) {
    const log_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = "INSERT INTO log (user_id, username, log_date, log_code, log_message, log_trace) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(query, [user_id, username, log_date, log_code, log_message, log_trace], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.affectedRows === 1) {
        const insertedId = result.insertId;
        return callback(null, insertedId);
      }
      return callback('No se pudo insertar el registro', null);
    });
}

module.exports = verifyToken;
