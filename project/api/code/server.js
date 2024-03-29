const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true // Permitir solicitudes con credenciales
};

app.use(cors(corsOptions));

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
app.use("/api/variable_data_structure",variableDataStructureRouter);

app.use("/api/users",usersRouter);
app.use("/api/conecction_read",conecctionReadRouter);
app.use("/api/conecction_write",conecctionWriteRouter);
app.use("/api/script",scriptRouter);
app.use("/api/monitoring", monitoringRouter);

const port = process.env.PORT_SENSORS;
app.listen(port, () => {
  console.log(`Sirviendo por el puerto :`+process.env.PORT_SENSORS+`/api/`);
});
