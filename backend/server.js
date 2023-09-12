const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));

const deviceConfigurationsRouter = require('./controllers/deviceConfigurations');
const sensorsDevicesRouter = require('./controllers/sensorsDevices');
const sensorsTypesRouter = require('./controllers/sensorsTypes');
const dataEstructureRouter = require('./controllers/dataEstructure');
const variableDataEstructureRouter = require('./controllers/variableDataEstructure');

app.use("/api/device_configurations", deviceConfigurationsRouter);
app.use("/api/sensors_devices", sensorsDevicesRouter);
app.use("/api/sensors_types", sensorsTypesRouter);
app.use("/api/data_estructure", dataEstructureRouter);
app.use("/api/variable_data_estructure",variableDataEstructureRouter);

const port = 5172;
app.listen(port, () => {
  console.log(`Sirviendo: http://localhost:5172/api/`);
});
