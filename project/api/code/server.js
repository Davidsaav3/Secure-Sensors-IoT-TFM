const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

  const corsOptions = {
    origin: ['http://localhost:4200', 'https://sensors.com:5500'],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));

  app.use((req, res, next) => {
    // Evita que el navegador realice "sniffing" del tipo MIME
    res.setHeader('X-Content-Type-Options', 'nosniff'); 
    // Obliga al uso de HTTPS durante un período de tiempo
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); 
    // Especifica de dónde se pueden cargar los recursos
    res.setHeader('Content-Security-Policy', "default-src 'self'; geolocation 'self'");
    // Activa el filtro XSS en los navegadores
    res.setHeader('X-XSS-Protection', '1; mode=block'); 
    // Controla cómo se envía el referente en las solicitudes HTTP
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Controla qué recursos pueden ser compartidos entre diferentes orígenes
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin'); 
    // Indica al navegador que espere y reporte certificados de transparencia
    res.setHeader('Expect-CT', 'max-age=0, report-uri="https://sensors.com:5500/report"'); 
    // Controla qué funciones o características pueden ser usadas en la página
    res.setHeader('Feature-Policy', "geolocation 'self'");
    // Permite solicitudes CORS desde el dominio del frontend
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //res.setHeader('Access-Control-Allow-Origin', 'https://sensors.com:5500');
    // Permitir el uso de credenciales en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Indica los métodos permitidos en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Indica los encabezados permitidos en las solicitudes CORS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const deviceConfigurationsRouter = require('./controllers/deviceConfigurations');
const sensorsTypesRouter = require('./controllers/sensorsTypes');
const dataStructureRouter = require('./controllers/dataStructure');
const variableDataStructureRouter = require('./controllers/variableDataStructure');

const usersRouter = require('./controllers/Users');
const conecctionReadRouter = require('./controllers/conecctionRead');
const conecctionWriteRouter = require('./controllers/conecctionWrite');
const scriptRouter = require('./controllers/script');
const monitoringRouter = require('./controllers/monitoring');

app.use("/api/device_configurations", deviceConfigurationsRouter);
app.use("/api/sensors_types", sensorsTypesRouter);
app.use("/api/data_structure", dataStructureRouter);
app.use("/api/variable_data_structure", variableDataStructureRouter);

app.use("/api/users", usersRouter);
app.use("/api/conecction_read", conecctionReadRouter);
app.use("/api/conecction_write", conecctionWriteRouter);
app.use("/api/script", scriptRouter);
app.use("/api/monitoring", monitoringRouter);

const port = process.env.PORT_SENSORS;
app.listen(port, () => {
  console.log(`Sirviendo por el puerto: ` + process.env.PORT_SENSORS + `/api/`);
});
