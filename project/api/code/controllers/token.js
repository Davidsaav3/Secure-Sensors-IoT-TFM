const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.TOKEN;
const insertLog = require('./log');

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        // LOG - 400 //
        //insertLog(req.user.id, req.user.email, '011-001-400-001', "400", "token", JSON.stringify(req.params),'Token no proporcionado', "0");
        return res.status(400).json({ error: 'Token no proporcionado' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // LOG - 401 //
            //insertLog(req.user.id, req.user.email, '011-001-401-001', "401", "token", JSON.stringify(req.params),'Token inválido', JSON.stringify(err));
            return res.status(401).json({ error: 'Token inválido' });
        }
        // Agregar ID y correo electrónico al objeto req.user
        req.user = {
            id: decoded.id,
            email: decoded.email
        };
        if (isNaN(req.user.id)) {
            return res.status(400).json({ error: 'ID no válido' });
        }
        // LOG - 200 //
        //insertLog(req.user.id, req.user.email, '011-001-200-001', "200", "token", JSON.stringify(req.params),'Token validado con éxito', "0");
        next();
    });
}

module.exports = verifyToken;
