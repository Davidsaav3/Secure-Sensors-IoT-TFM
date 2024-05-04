export const environment = {
    languageName: ["Español", "English"],
    languageLang: ["es", "en"],
    resultsPerPag: [10, 15, 50, 100],
    accessTokenMap: 'pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ',
    defaultMapsStyle: 'streets-v12',
    AppVersion: '2.6.0',

    url: {
        deviceConfigurations: '/device_configurations',
        sensorsTypes: '/sensors_types',
        dataStructure: '/data_structure',
        variableDataStructure: '/variable_data_structure',
        users: '/users',
        conecctionRead: '/conecction_read',
        conecctionWrite: '/conecction_write',
        script: '/script',
        monitoring: '/monitoring',
    },

    rute: {
        deviceConfigurations: 'devices',
        sensorsTypes: 'sensors',
        dataStructure: 'structure',
        variableDataStructure: 'variable-structure',
        login: 'login',
        users: 'users',
        conecctionRead: 'conecction-read',
        conecctionWrite: 'conecction-write',
        script: 'script',
        monitoring: 'monitoring',
    },

    // PRODUCCIÓN //
    //baseUrl: "http://localhost/api",

    // DESARROLLO //
    baseUrl: "http://localhost:5172/api",

    password_pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/,
    title: 'Sensors IoT',

    acces_token_timeout: 5000, // Tiempa hasta lanzar otra vez la consulta
    script_status_timeout: 5000,

    acces_token_times: 1,
    script_status_times: 2,

    script_status_frontend: 11000,
    acces_token_frontend: 5000,
};
