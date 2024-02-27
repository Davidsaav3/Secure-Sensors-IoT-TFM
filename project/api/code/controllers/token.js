const jwt = require('jsonwebtoken');

const SECRET_KEY = 'mi_clave_secreta'; // Clave secreta para firmar JWT

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    console.log('hola'+token)

    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
    });
}

module.exports = verifyToken;
