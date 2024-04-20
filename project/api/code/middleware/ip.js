const express = require('express');
const app = express();
const rateLimit = require("express-rate-limit");
const { RateLimiterMemory } = require("rate-limiter-flexible");

// Configuración del rate limiter
const limiter = new RateLimiterMemory({
    points: 1, // 5 intentos permitidos
    duration: 60, // en segundos
});

// Middleware para bloquear la IP si se excede el límite
const rateLimiterMiddleware = (req, res, next) => {
    limiter.consume(req.ip)
        .then(() => {
            next(); // continuar si el límite no se ha superado
        })
        .catch(() => {
            res.status(429).send('Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo más tarde.');
        });
};

module.exports = rateLimiterMiddleware;
