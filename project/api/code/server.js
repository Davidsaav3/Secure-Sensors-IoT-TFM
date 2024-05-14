const express = require('express');
const app = express();
require('dotenv').config();

const corsMiddleware = require('./middleware/corsMiddleware');
const securityMiddleware = require('./middleware/securityMiddleware ');
app.use(corsMiddleware);
app.use(securityMiddleware);

const deviceConfigurationsRouter = require('./controllers/deviceConfigurations');
const sensorsTypesRouter = require('./controllers/sensorsTypes');
const dataStructureRouter = require('./controllers/dataStructure');
const variableDataStructureRouter = require('./controllers/variableDataStructure');

const usersRouter = require('./controllers/Users');
const conecctionReadRouter = require('./controllers/conecctionRead');
const conecctionWriteRouter = require('./controllers/conecctionWrite');
const scriptRouter = require('./controllers/script');
const monitoringRouter = require('./controllers/monitoring');

app.use(process.env.BASE_URL + "/device_configurations", deviceConfigurationsRouter);
app.use(process.env.BASE_URL + "/sensors_types", sensorsTypesRouter);
app.use(process.env.BASE_URL + "/data_structure", dataStructureRouter);
app.use(process.env.BASE_URL + "/variable_data_structure", variableDataStructureRouter);

app.use(process.env.BASE_URL + "/users", usersRouter);
app.use(process.env.BASE_URL + "/conecction_read", conecctionReadRouter);
app.use(process.env.BASE_URL + "/conecction_write", conecctionWriteRouter);
app.use(process.env.BASE_URL + "/script", scriptRouter);
app.use(process.env.BASE_URL + "/monitoring", monitoringRouter);

const port = process.env.PORT_SENSORS;
app.listen(port, () => {
  if (process.env.verbose) console.log(`Sirviendo por el puerto: ` + process.env.PORT_SENSORS + `/api/`);
});
