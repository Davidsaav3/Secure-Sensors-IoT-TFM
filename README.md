# TFG - Diseño y desarrollo de un servicio de gestión IoT
Este repositorio contiene el proyecto de Trabajo Fin de Grado (TFG) de Ingeniería Multimedia titulado "Diseño y desarrollo de un servicio de gestión IoT". El proyecto es desarrollado por el equipo de Smart University de la Universidad de Alicante.

## Descripción del proyecto
El objetivo principal de este proyecto es diseñar y desarrollar un servicio de gestión basado en IoT (Internet de las total_pages) y redes LORA para un sistema de sensorización inteligente. Actualmente, la gestión y configuración de este sistema se realiza a través de PHPMyAdmin utilizando una base de datos. Sin embargo, se plantea la creación de una aplicación web propia que facilite la gestión de la información relacionada con el sistema de sensorización.

## Datos a gestionar
El proyecto maneja una base de datos que consta de las siguientes 3 tablas:
- sensor_devices: Esta tabla contiene los tipos de sensores que pueden ser utilizados por el sistema.
- devices: En esta tabla se encuentra la lista de dispositivos IoT que forman parte de la red de sensorización.
- devices_sensor: Aquí se almacena la lista de sensores del tipo "sensor_devices" que están asociados a cada dispositivo.

## Requerimientos
La aplicación estará alojada en un servidor propio y solo tendrá acceso el personal autorizado. Por lo tanto, no es necesario implementar un sistema de autenticación con usuario y contraseña ni gestión de usuarios y login en esta etapa inicial del proyecto.
Cada dispositivo puede activarse o desactivarse.
Cada sensor en un dispositivo puede activarse o desactivarse.


## Mockups de interfaces
A continuación se presentan los mockups de las interfaces que se desarrollarán en el proyecto:

### Interfaz inicial
Al acceder a la aplicación, el usuario encontrará una interfaz inicial que proporcionará acceso al resto de las interfaces. Esta interfaz contará con un menú superior o lateral que contendrá las siguientes opciones:

### Gestión Tipos de Sensores 
Permite gestionar los tipos de sensores que el sistema puede utilizar para configurar los dispositivos.

### Gestionar Dispositivos 
Permite gestionar los dispositivos IoT de la red de sensorización.
El repositorio contiene el código y los recursos necesarios para el desarrollo de este proyecto de TFG.
