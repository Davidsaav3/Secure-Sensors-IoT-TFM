const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.TOKEN;
let { con }= require('../middleware/mysql');
const REFRESH_SECRET_KEY = process.env.TOKEN_REFRESH;

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        // LOG - 400 //
        //insertLog(req.user.id, req.user.email, '011-001-400-001', "400", "token", token,'Token no proporcionado', "Sin datos");
        return res.status(400).json({ error: 'Token no proporcionado' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // LOG - 401 //
            //insertLog(req.user.id, req.user.email, '011-001-401-001', "401", "token", token,'Token inválido', JSON.stringify(err));
            return res.status(401).json({ error: 'Token inválido' });
        }

        //console.log(decoded.email)
        const query = "SELECT * FROM users WHERE id = ? AND (SELECT enabled FROM users WHERE id = ?) = 1 AND revoke_date IS NOT NULL AND revoke_date != ''";
        con.query(query, [decoded.id, decoded.id], (err, results) => {
            if (err || results.length === 0) {
                // LOG - 401 //
                //insertLog("Sin datos", "Sin datos", '011-001-400-002', "400", "token", refreshToken,'Los datos del JWT no existen en la base de datos', "Sin datos");
                return res.status(401).json({ error: 'Los datos del JWT no existen en la base de datos' });
            }
            //console.log(results[0].token);
            jwt.verify(results[0].token, REFRESH_SECRET_KEY, (verifyErr, decoded) => {
                if (decoded) {
                    // Agregar ID y correo electrónico al objeto req.user
                    req.user = {
                        id: decoded.id,
                        email: decoded.email
                    };
                }
                else{
                    // LOG - 500 //
                    //insertLog("Sin datos", "Sin datos", '011-001-500-002', "400", "token", refreshToken,'Los datos del JWT no existen en la base de datos', "Sin datos");
                    return res.status(500).json({ error: 'Token de refresco expirado' });
                }
                if (isNaN(req.user.id)) {
                    return res.status(400).json({ error: 'ID no válido' });
                }
            });
            // LOG - 200 //
            //insertLog(req.user.id, req.user.email, '011-001-200-001', "200", "token", token,'Token validado', "Sin datos");
            next();
        });
    });
}

module.exports = verifyToken;
