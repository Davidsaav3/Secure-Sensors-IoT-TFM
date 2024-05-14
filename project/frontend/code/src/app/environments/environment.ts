export const environment = {
    languageName: ["Español", "English"],
    languageLang: ["es", "en"],
    resultsPerPag: [10, 15, 50, 100],
    accessTokenMap: 'pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ',
    defaultMapsStyle: 'streets-v12',
    AppVersion: '2.7.1',

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
    domain: "http://localhost:5172",
    baseUrl: "/sensors/api",

    password_pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/,
    title: 'Sensors IoT',

    acces_token_timeout: 300000, // Milisegundos hasta que se cduque el token de acceso //300000 //10000
    script_status_timeout: 5000, // Milisegundos hasta lanzar el obtener script

    acces_token_times: 3, // Veces que intenta obtener el tokend e acceso
    script_status_times: 3, // Veces que intenta obtener ele stado del script

    script_status_frontend: 10000, // Tiempo de espera para desbloquear boton de obtener estado

    acces_token_dif: 5000, // acces_token_timeout-acces_token_dif= Tiempo que espera para lanzarlo

    verbose: false,
    verbose_error: false,
};
