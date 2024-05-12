// suscribe es un array de colas a las que se suscribe el usuario
//suscribe=['v3/'+appID+'/devices/+/up']


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.connection_config = void 0;
exports.ingest_config = void 0;

// Tenemos un array con configuraciones, esto debería estar en un archivo aparte
var connection_config = [

  /*  {
        mqttQeue: 'mqtt://eu1.cloud.thethings.network:1883',
        appID: 'ua-sensor@ttn',
        accessKey: 'NNSXS.VHCKXEROUIBVRURMLCECRVTHRF77EGFRV2G3RNI.GCFZXXJF4VZCBH5V7YHHNT3OWKLCTPDVLRU74XVWFAPQ7IMI2S2A',
        subscribe: 'v3/ua-sensor@ttn/devices/+/up'
    },*/
    {
        mqttQeue: 'mqtt://eu1.cloud.thethings.network:1883',
        appID: 'test-ua-sensor@ttn',
        accessKey: 'NNSXS.W354CNIPLWXSM3RCTWPSUC3XITNA2JZFBTXCZXQ.MLA7EOWEQX2GI7PJS4V34XUP2BZLDD3IL2BCA6KSNZVTU2JVHWBA',
        subscribe: 'v3/test-ua-sensor@ttn/devices/+/up'
    },
    {
        mqttQeue: 'mqtt://eu1.cloud.thethings.network:1883',
        appID: 'ua-bim@ttn',
        accessKey: 'NNSXS.5TNLKEZMIOLEGLUYYQ7UNXNFPJKCH5SRBTR5YVY.6IQK5GKVMAJ6WQBET4ZMXW7OXIKLAY4H4HCF4OFBQ26LMOMLTEXA',
        subscribe: 'v3/ua-bim@ttn/devices/+/up'
    },
    {
        mqttQeue: 'mqtt://eu1.cloud.thethings.network:1883',
        appID: 'ua-roomsensors@ttn',
        accessKey: 'NNSXS.W5PE3P7NBQN2HOMPMAPX6GQPOUURXIDEP7UWE4Q.2LYDYZKRJ25K6JVURCP3NPWPD7ZUHZ6TMQIAV6S75M356Q6QX7QA',
        subscribe: 'v3/ua-roomsensors@ttn/devices/+/up'
    },
];

var ingest_config = [
    {
        //lucia
        authorization: 'PiAeOdIxD9FKNdd70FqAwPu8FtP3J9;e0bgfV..RPRcs8B*mCmSOHDN__0%PqKg9U@yYXVmn5BOb+VG+ERiBsFnefGQ-Uip',
        urlIngest: 'https://ingest.smartua.es'
    },
        {
        //lucia
        authorization: 'FLauw2sNOpiGhNXeNz6m8fAC8Y9gw7;Oj7mNLzmGXiXnoHvI7VNDSjbkOhpvdk8P9Ah*yz9sArszaZl%uJiyLG.HhVECe25',
        urlIngest: 'https://ingest.kunna.es'
    }
    /*{
        //demosensors
        authorization: 'TqXfBIOqLpoiiKxR9pFVcKUq9q0xHk;+MXI+ryNaeXRUf2s_QXOEpN5iJhbkFW.BL7EHM.80k6Z9Vr%UjUotzgNGsYv-GF_',
        urlIngest: 'https://ingest.smartua.es'
    },
    {
        //jvberna
        authorization: 'lxNMgQyhkcxEfElVlCMknwAMfikabN;*rHw7ie5J1J8XOr*%Rj0J%uRkIGmzOV0YyIbWYFUZTS9+kp4HfBeyC2J@nV+ET__',
        urlIngest: 'https://ingest.smartua.es'
    }*/
];

module.exports = {
    connection_config, ingest_config
}
