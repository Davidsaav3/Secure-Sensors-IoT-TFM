const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors({ origin: process.env.URL_BASE }));

const deviceConfigurationsRouter = require('./controllers/deviceConfigurations');
const sensorsTypesRouter = require('./controllers/sensorsTypes');
const dataStructureRouter = require('./controllers/dataStructure');
const variableDataStructureRouter = require('./controllers/variableDataStructure');

app.use("/api/device_configurations", deviceConfigurationsRouter);
app.use("/api/sensors_types", sensorsTypesRouter);
app.use("/api/data_structure", dataStructureRouter);
app.use("/api/variable_data_structure",variableDataStructureRouter);

const port = process.env.PORT_SENSORS;
app.listen(port, () => {
  console.log(`Sirviendo por el puerto :`+process.env.PORT_SENSORS+`/api/`);
});
