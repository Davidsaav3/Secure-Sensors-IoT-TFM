const express = require('express');
const app = express();
const rateLimit = require("express-rate-limit");
const { RateLimiterMemory } = require("rate-limiter-flexible");

    const limiter = new RateLimiterMemory({
        points: process.env.IP_BLOCK_TIME, // Intentos
        duration: process.env.IP_ACCES, // Segundos de bloqueo
    });
    
    // Bloquear la IP
    const rateLimiterMiddleware = (req, res, next) => {
        limiter.consume(req.ip)
            .then(() => {
                next(); 
            })
            .catch(() => {
                res.status(429).send('Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo más tarde.');
            });
    };

module.exports = rateLimiterMiddleware;
