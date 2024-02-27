const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.TOKEN;

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
    });
}

module.exports = verifyToken;
