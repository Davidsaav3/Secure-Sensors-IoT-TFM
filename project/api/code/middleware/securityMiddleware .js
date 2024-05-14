const securityMiddleware = (req, res, next) => {
  // Establece los encabezados de seguridad aquí
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', `max-age=${process.env.TRANSPORT_SECURITY_AGE}; includeSubDomains`);
  res.setHeader('Content-Security-Policy', "default-src 'self'; geolocation 'self'");
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Expect-CT', `max-age=${process.env.REPORT_AGE}, report-uri="${process.env.REPORT_URL}"`);
  res.setHeader('Feature-Policy', "geolocation 'self'");
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
};

module.exports = securityMiddleware;
