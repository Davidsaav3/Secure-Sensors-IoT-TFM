const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.TOKEN;
let { con }= require('./mysql');
const REFRESH_SECRET_KEY = process.env.TOKEN_REFRESH;
const insertLog = require('../middleware/log');

    function verifyToken(req, res, next) {
        const token = req.headers['authorization'];
        if (!token) {
            // LOG - 400 //
            insertLog("", "", '010-001-400-001', "400", "TOKEN", '', 'Token no proporcionado', "");
            return res.status(400).json({ error: 'Token no proporcionado' });
        }
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                // LOG - 400 //
                insertLog("", "", '010-001-400-002', "400", "TOKEN", '', 'Token inválido', JSON.stringify(err));
                return res.status(400).json({ error: 'Token inválido' });
            }

            const query = "SELECT * FROM users WHERE id = ? AND (SELECT enabled FROM users WHERE id = ?) = 1 AND revoke_date IS NOT NULL AND revoke_date != ''";
            con.query(query, [decoded.id, decoded.id], (err, results) => {
                if (err || results.length === 0) {
                    // LOG - 400 //
                    insertLog("", "", '010-001-400-003', "400", "TOKEN", '', 'Los datos del JWT no existen en la base de datos', "");
                    return res.status(400).json({ error: 'Los datos del JWT no existen en la base de datos' });
                }
                jwt.verify(results[0].token, REFRESH_SECRET_KEY, (verifyErr, decoded) => {
                    if (decoded) {
                        req.user = {
                            id: decoded.id,
                            user: decoded.user
                        };
                    }
                    else {
                        // LOG - 500 //
                        insertLog("", "", '010-001-500-001', "400", "TOKEN", '', 'Error al validar token', "");
                        return res.status(500).json({ error: 'Token de refresco expirado' });
                    }
                    if (isNaN(req.user.id)) {
                        return res.status(400).json({ error: 'ID no válido' });
                    }
                    // LOG - 200 //
                    //insertLog(req.user.id, req.user.user, '010-001-200-001', "200", "TOKEN", token, 'Token validado', "");
                    next();
                });
            });
        });
    }


module.exports = verifyToken;
