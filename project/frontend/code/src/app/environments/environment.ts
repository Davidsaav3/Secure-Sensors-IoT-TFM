export const environment = {
    languageName: ["Español", "English"],
    languageLang: ["es", "en"],
    resultsPerPag: [10, 15, 50, 100],
    accessTokenMap: 'pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ',
    defaultMapsStyle: 'streets-v12',
    AppVersion: '2.0.0',   

    deviceConfigurations: '/device_configurations',
    sensorsTypes: '/sensors_types',
    dataStructure: '/data_structure',
    variableDataStructure: '/variable_data_structure',

    users: '/users',
    credentials: '/credentials',
    script: '/script',
    monitoring: '/monitoring',

    // PRODUCCIÓN //
    //baseUrl: "http://localhost/api",

    // DESARROLLO //
    baseUrl: "http://localhost:5172/api",
};
