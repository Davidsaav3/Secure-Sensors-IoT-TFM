#/bin/bash

echo "Para indicar la direccion url de la api para el frontend, usar el argumento 'direccion_api:puerto'. Ejemplo: http://localhost:5172"
echo "Sino se indica nada, por defecto, la url de la api sera: http://localhost:5172/api"
echo
echo "Compilando y generando imagenes..."
echo

sleep 2;

if [ $# -eq 1 ]
then
    URL_SERVE_API="'"$1/api"'"
else
    URL_SERVE_API="'http://localhost:5172/api'"
fi

ENVIRONMENT_TS="export const environment = {
    languageName: ['Español', 'English'],
    languageLang: ['es', 'en'],
    resultsPerPag: [10, 15, 50, 100],
    baseUrl: $URL_SERVE_API,
    accessTokenMap: 'pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ',
    deviceConfigurations: '/device_configurations',
    sensorsTypes: '/sensors_types',
    dataStructure: '/data_structure',
    variableDataStructure: '/variable_data_structure',
    defaultMapsStyle: 'streets-v12',
};"

echo $ENVIRONMENT_TS > project/frontend/files_deploy/environment.ts

docker build project/api/ -t jvberna/project-iot-api:v1
docker build project/frontend -t jvberna/project-iot-frontend:v1

docker push jvberna/project-iot-api:v1
docker push jvberna/project-iot-frontend:v1

docker rmi -f jvberna/project-iot-api:v1
docker rmi -f jvberna/project-iot-frontend:v1