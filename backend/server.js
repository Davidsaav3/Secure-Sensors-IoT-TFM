const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));

const deviceConfigurationsRouter = require('./controllers/deviceConfigurations');
const sensorsDevicesRouter = require('./controllers/sensorsDevices');
const sensorsTypesRouter = require('./controllers/sensorsTypes');
const dataStructureRouter = require('./controllers/dataStructure');
const variableDataStructureRouter = require('./controllers/variableDataStructure');

app.use("/api/device_configurations", deviceConfigurationsRouter);
app.use("/api/sensors_devices", sensorsDevicesRouter);
app.use("/api/sensors_types", sensorsTypesRouter);
app.use("/api/data_structure", dataStructureRouter);
app.use("/api/variable_data_structure",variableDataStructureRouter);

const port = 5172;
app.listen(port, () => {
  console.log(`Sirviendo: http://localhost:5172/api/`);
});
