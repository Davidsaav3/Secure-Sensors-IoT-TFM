-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-05-2024 a las 16:08:30
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sensors`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conecction_read`
--

CREATE TABLE `conecction_read` (
  `description` text NOT NULL,
  `mqttQeue` text NOT NULL,
  `appID` text NOT NULL,
  `accessKey` text NOT NULL,
  `subscribe` text NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `conecction_read`
--

INSERT INTO `conecction_read` (`description`, `mqttQeue`, `appID`, `accessKey`, `subscribe`, `enabled`, `id`) VALUES
('Adquisición 2', 'mqtt://eu1.cloud.thethings.network:1883', 'ua-roomsensors@ttn ', 'U2FsdGVkX1/SBed9J5tRRr8N36utFdZuy9tySCt/A04=', 'v3/ua-roomsensors@ttn/devices/+/up', 1, 2),
('Adquisición 1', 'mqtt://eu1.cloud.thethings.network:1883', 'ua-roomsensors@ttn ', 'U2FsdGVkX18LNh7sxT7ScbCs0EgmwjoxVmxQ6DSIgyY=', 'v3/ua-roomsensors@ttn/devices/+/up', 1, 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conecction_write`
--

CREATE TABLE `conecction_write` (
  `description` text NOT NULL,
  `authorization` text NOT NULL,
  `urlIngest` text NOT NULL,
  `id` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `conecction_write`
--

INSERT INTO `conecction_write` (`description`, `authorization`, `urlIngest`, `id`, `enabled`) VALUES
('Ingesta 1', 'U2FsdGVkX18jIOOQvhFFMqOU/YmUPeNJU/srHfSJIlE=', 'https://ingest.smartua.es', 2, 1),
('Ingesta 2', 'U2FsdGVkX18vbOlPUdQeirgjqOpT2ZcuCmfjE6RD6lw=', 'https://ingest.smartua.es', 9, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `config`
--

CREATE TABLE `config` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `value_int` int(11) NOT NULL,
  `value_string` text NOT NULL,
  `value_bool` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `config`
--

INSERT INTO `config` (`id`, `name`, `value_int`, `value_string`, `value_bool`) VALUES
(1, 'log_erase', 10, '', 0),
(3, 'log_script_erase', 10, '', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `data_estructure`
--

CREATE TABLE `data_estructure` (
  `id_estructure` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `configuration` text DEFAULT NULL,
  `identifier_code` int(11) DEFAULT NULL,
  `id_variable_data_structure` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `data_estructure`
--

INSERT INTO `data_estructure` (`id_estructure`, `description`, `configuration`, `identifier_code`, `id_variable_data_structure`) VALUES
(2, 'Yokogawa XS770A Sushi Sensor Vibration (Z axis) Data_Type=0x10', 'UINT8,UINT16,FLOAT16,FLOAT16,FLOAT16', 16, 1),
(3, 'Sushi Sensor Vibration (X-axis)\r\nData_Type=0x12', 'UINT8,UINT16,FLOAT16,FLOAT16', 18, 1),
(4, 'Sonda CO2 Temp Hum - TTGO (3)dd', 'FLOAT32,FLOAT32,FLOAT32', NULL, 0),
(6, 'Sonda GPS (6)', 'FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32', NULL, 0),
(7, 'Sonda VOC GPS Correction (14)', 'FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32', NULL, 0),
(8, 'Sonda VOC (7)', 'FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32', NULL, 0),
(9, 'Sonda VOC GPS (13)', 'FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32', NULL, 0),
(10, 'Sonda Presencia (2)', 'FLOAT32,FLOAT32', NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `device_configurations`
--

CREATE TABLE `device_configurations` (
  `id` int(11) NOT NULL,
  `topic_name` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `organizationid` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `lat` double NOT NULL,
  `lon` double NOT NULL,
  `cota` double NOT NULL,
  `timezone` varchar(45) NOT NULL,
  `description_origin` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `origin` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `uid` varchar(45) NOT NULL,
  `application_id` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `id_data_estructure` int(11) DEFAULT NULL,
  `variable_configuration` tinyint(4) NOT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `updatedAt` varchar(100) DEFAULT NULL,
  `typemeter` varchar(45) NOT NULL,
  `alias` varchar(45) NOT NULL,
  `enable` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `device_configurations`
--

INSERT INTO `device_configurations` (`id`, `topic_name`, `organizationid`, `lat`, `lon`, `cota`, `timezone`, `description_origin`, `origin`, `uid`, `application_id`, `id_data_estructure`, `variable_configuration`, `createdAt`, `updatedAt`, `typemeter`, `alias`, `enable`) VALUES
(3, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 3 - TTGO', 'Sensor C02', 'ua-sensor-s3', 'ua-sensor', 5, 0, NULL, NULL, 'UASENSOR', 'Despacho 1234', 1),
(4, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 4 - TTGO', 'Sensor C02', 'ua-sensor-s4', 'ua-sensor', 5, 0, NULL, '2024-05-03 00:49:16', 'UASENSOR', 'Despacho 1247', 0),
(5, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 5 - TTGO', 'Sensor C02', 'ua-sensor-s5', 'ua-sensor', 5, 0, NULL, NULL, 'UASENSOR', '0015PB006', 1),
(6, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 6 - TTGO', 'Multisensor', 'ua-sensor-s6', 'ua-sensor', 4, 0, NULL, NULL, 'UASENSOR', 'Despacho 1246', 1),
(7, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 7 - TTGO', 'Sensor CO2', 'ua-sensor-s7', 'ua-sensor', 5, 0, NULL, NULL, 'UASENSOR', '0037P1036', 1),
(8, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 0, 0, 0, 'Europe/Madrid', 'Sensor 8 - TBEAM', 'Sensor GPS', 'ua-sensor-s8', 'ua-sensor', 6, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(9, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 9 - TTGO', 'Sensor CO2', 'ua-sensor-s9', 'ua-sensor', 5, 0, NULL, NULL, 'UASENSOR', 'Despacho 1247', 1),
(10, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 10 - TBEAM', 'Sensor CO2', 'ua-sensor-s10', 'ua-sensor', 5, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(12, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.382810317793336, -0.5148430958871572, 0, 'Europe/Madrid', 'Sensor 12 - TTGO', 'Sensor CO2', 'ua-sensor-s12', 'ua-sensor', 5, 0, NULL, NULL, 'UASENSOR', 'Instituto Investigación Informática', 1),
(13, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38482407481661, -0.5131080300266437, 0, 'Europe/Madrid', 'Sensor 13 - TBEAM', 'Multisensor GPS', 'ua-sensor-s13', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Torre de Control', 1),
(14, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 14 - TBEAM', 'Sensor GPS', 'ua-sensor-s14', 'ua-sensor', 6, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(15, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 15 - TBEAM', 'Sensor GPS', 'ua-sensor-s15', 'ua-sensor', 6, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(16, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 0, 0, 0, 'Europe/Madrid', 'Sensor 16 - TBEAM', 'Sensor GPS', 'ua-sensor-s16', 'ua-sensor', 6, 0, NULL, NULL, 'UASENSOR', 'Despacho 1247', 1),
(17, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38238360500826, -0.5122013383425177, 0, 'Europe/Madrid', 'Sensor 17 - TBEAM', 'Multisensor GPS VOC', 'ua-sensor-s17', 'ua-sensor', 7, 0, NULL, NULL, 'UASENSOR', 'Escuela de Negocios', 1),
(18, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.3816708264329, -0.5236659987259781, 0, 'Europe/Madrid', 'Sensor 18 - TBEAM', 'Multisensor GPS', 'ua-sensor-s18', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Parque Científico', 1),
(19, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38684557310198, -0.5112393016373945, 0, 'Europe/Madrid', 'Sensor 19 - TBEAM', 'Multisensor GPS VOC', 'ua-sensor-s19', 'ua-sensor', 9, 0, NULL, NULL, 'UASENSOR', 'Politécnica I', 1),
(20, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38738705943065, -0.5180613115713143, 0, 'Europe/Madrid', 'Sensor 20 - TBEAM', 'Multisensor GPS VOC', 'ua-sensor-s20', 'ua-sensor', 8, 0, NULL, NULL, 'UASENSOR', 'Ciencias VI', 1),
(21, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 21 - TBEAM', 'Multisensor GPS', 'ua-sensor-s21', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(22, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 22 - TBEAM', 'Multisensor GPS', 'ua-sensor-s22', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(23, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.388059614687144, -0.513247473685333, 0, 'Europe/Madrid', 'Sensor 23 - TBEAM', 'Multisensor GPS', 'ua-sensor-s23', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Servicio de Informática', 1),
(24, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38717684061646, -0.5133454071647628, 0, 'Europe/Madrid', 'Sensor 24 - TBEAM', 'Multisensor GPS', 'ua-sensor-s24', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Laboratorio de Aguas', 1),
(25, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38635266206297, -0.5161813111823153, 0, 'Europe/Madrid', 'Sensor 25 - TBEAM', 'Multisensor GPS', 'ua-sensor-s25', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Biblioteca Derecho', 1),
(26, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38279034375877, -0.5164420087270247, 0, 'Europe/Madrid', 'Sensor 26 - TBEAM', 'Multisensor GPS', 'ua-sensor-s26', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Aulario 1', 1),
(27, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38304448852155, -0.51394754264504, 0, 'Europe/Madrid', 'Sensor 27 - TBEAM', 'Multisensor GPS', 'ua-sensor-s27', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Facultad de Ciencias Económicas', 1),
(28, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38365892975121, -0.5106176800834143, 0, 'Europe/Madrid', 'Sensor 28 - TBEAM', 'Multisensor GPS', 'ua-sensor-s28', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Biblioteca Politécnica', 1),
(29, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.385271, -0.509498, 0, 'Europe/Madrid', 'Sensor 29 - TBEAM', 'Multisensor GPS', 'ua-sensor-s29', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Despacho 1215', 1),
(30, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38348652416068, -0.5121358104001964, 0, 'Europe/Madrid', 'Sensor 30 - TBEAM', 'Multisensor GPS', 'ua-sensor-s30', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Biblioteca General', 1),
(31, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38485076703961, -0.5106477746996321, 0, 'Europe/Madrid', 'Sensor 31 - TBEAM', 'Multisensor GPS', 'ua-sensor-s31', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Aulario 2', 1),
(32, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38453473969473, -0.5093876459789433, 0, 'Europe/Madrid', 'Sensor 32 - TBEAM', 'Multisensor GPS', 'ua-sensor-s32', 'ua-sensor', 1, 0, NULL, NULL, 'UASENSOR', 'Aulario 2', 1),
(33, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.97518313182293, -0.1409554481506348, 0, 'Europe/Madrid', 'Sensor 33 - TBEAM', 'Multisensor GPS VOC', 'ua-sensor-s33', 'ua-sensor', 9, 0, NULL, NULL, 'UASENSOR', 'Gandía', 1),
(34, 'ua.sensors.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38766904183048, -0.5126090599775734, 0, 'Europe/Madrid', 'Sensor 34 - TBEAM', 'Multisensor GPS PRESENCE', 'ua-sensor-s34', 'ua-sensor', 10, 0, NULL, NULL, 'UASENSOR', 'Politécnica II', 0),
(35, 'ua.bim.raw', 'UA UNIVERSIDAD DE ALICANTE', 38.38476380146816, -0.5114567766812126, 10, 'Europe/Madrid', 'Sensor 35 - YOKOGAWA', 'Yokogawa XS770A Vibration', 'yokogawa-xs770a-s1', 'ua-sensor', 2, 0, NULL, NULL, 'YOKOGAWA', 'Rectorado', 1),
(37, '11', '11', 0, 0, 0, 'Brussels, Copenhagen, Madrid, Paris', '', '', '1122', '', 1, 0, '2024-05-12 09:58:56', '2024-05-12 09:59:03', '', '11', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `log_date` varchar(100) DEFAULT NULL,
  `log_code` varchar(20) DEFAULT NULL,
  `log_message` varchar(250) DEFAULT NULL,
  `log_trace` varchar(150) NOT NULL,
  `log_status` varchar(3) NOT NULL,
  `log_method` varchar(100) NOT NULL,
  `log_parameters` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_script`
--

CREATE TABLE `log_script` (
  `id` int(11) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `log_trace` varchar(150) NOT NULL,
  `log_date` varchar(100) NOT NULL,
  `log_status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `script`
--

CREATE TABLE `script` (
  `date` varchar(100) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `script`
--

INSERT INTO `script` (`date`, `status`, `id`) VALUES
('2024-05-14 16:08:29', 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sensors_devices`
--

CREATE TABLE `sensors_devices` (
  `orden` int(11) NOT NULL,
  `enable` tinyint(4) NOT NULL,
  `id_device` int(11) NOT NULL,
  `id_type_sensor` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `datafield` varchar(45) DEFAULT NULL,
  `nodata` tinyint(4) NOT NULL DEFAULT 0,
  `correction_specific` text DEFAULT NULL,
  `correction_time_specific` text DEFAULT NULL,
  `topic_specific` text DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `updatedAt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sensors_devices`
--

INSERT INTO `sensors_devices` (`orden`, `enable`, `id_device`, `id_type_sensor`, `id`, `datafield`, `nodata`, `correction_specific`, `correction_time_specific`, `topic_specific`, `createdAt`, `updatedAt`) VALUES
(1, 1, 3, 1, 7, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 5, 1, 9, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 6, 1, 10, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 6, 2, 11, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 6, 3, 12, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 7, 1, 13, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 8, 4, 14, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 8, 5, 15, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 8, 6, 16, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 8, 7, 17, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 8, 8, 18, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 8, 9, 19, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 0, 9, 1, 21, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 12, 1, 23, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 13, 1, 24, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 14, 1, 25, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 15, 1, 26, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 16, 5, 27, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 16, 4, 28, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 16, 6, 29, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 16, 7, 30, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 16, 8, 31, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 16, 9, 32, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 17, 5, 33, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 17, 4, 34, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 17, 6, 35, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 17, 7, 36, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 17, 8, 37, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 17, 9, 38, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 18, 5, 39, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 19, 5, 40, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 14, 5, 41, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 14, 4, 42, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 14, 6, 43, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 14, 7, 44, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 14, 8, 45, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 14, 9, 46, '', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 19, 4, 47, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 19, 6, 48, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 19, 7, 49, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 19, 8, 50, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 19, 9, 51, '', 0, NULL, NULL, NULL, NULL, NULL),
(15, 0, 19, 1, 52, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 21, 5, 53, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 21, 4, 54, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 21, 6, 55, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 21, 7, 56, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 21, 8, 57, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 21, 9, 58, '', 0, NULL, NULL, NULL, NULL, NULL),
(15, 0, 21, 1, 59, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 22, 5, 60, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 22, 4, 61, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 22, 6, 62, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 22, 7, 63, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 22, 8, 64, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 22, 9, 65, '', 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 22, 1, 66, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 23, 1, 67, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 24, 1, 68, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 25, 1, 69, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 26, 1, 70, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 27, 1, 71, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 28, 1, 72, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 29, 1, 73, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 30, 1, 74, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 31, 1, 75, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 32, 1, 76, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 18, 4, 77, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 18, 6, 78, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 18, 7, 79, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 18, 8, 80, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 18, 9, 91, '', 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 18, 1, 92, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 24, 5, 93, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 24, 4, 94, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 24, 6, 95, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 24, 7, 96, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 24, 8, 97, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 24, 9, 98, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 32, 5, 99, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 32, 4, 100, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 32, 6, 101, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 32, 7, 102, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 32, 8, 103, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 32, 9, 104, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 27, 5, 105, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 27, 4, 106, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 27, 6, 107, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 27, 7, 108, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 27, 8, 109, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 27, 9, 110, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 30, 5, 111, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 30, 4, 112, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 30, 6, 113, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 30, 7, 114, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 30, 8, 115, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 30, 9, 116, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 15, 5, 117, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 15, 4, 118, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 15, 6, 119, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 15, 7, 120, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 15, 8, 121, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 15, 9, 122, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 25, 5, 123, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 25, 4, 124, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 25, 6, 125, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 25, 7, 126, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 25, 8, 127, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 25, 9, 128, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 23, 5, 129, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 23, 4, 130, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 23, 6, 131, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 23, 7, 132, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 23, 8, 133, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 23, 9, 134, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 28, 5, 135, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 28, 4, 136, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 28, 6, 137, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 28, 7, 138, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 28, 8, 139, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 28, 9, 140, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 31, 5, 141, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 31, 4, 142, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 31, 6, 143, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 31, 7, 144, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 31, 8, 145, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 31, 9, 146, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 29, 5, 147, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 29, 4, 148, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 29, 6, 149, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 29, 7, 150, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 29, 8, 151, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 29, 9, 152, '', 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 29, 1, 153, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 26, 5, 154, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 26, 4, 155, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 26, 6, 156, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 26, 7, 157, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 26, 8, 158, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 26, 9, 159, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 13, 5, 160, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 13, 4, 161, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 13, 6, 162, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 13, 7, 163, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 13, 8, 164, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 13, 9, 165, '', 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 21, 10, 172, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(8, 1, 21, 11, 173, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 1, 21, 12, 174, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 1, 21, 13, 175, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 1, 21, 14, 176, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 1, 21, 15, 177, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(13, 1, 21, 16, 178, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 0, 21, 17, 179, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 17, 10, 180, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(8, 1, 17, 11, 181, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 1, 17, 12, 182, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 1, 17, 13, 183, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 1, 17, 20, 184, NULL, 0, 'value - 6', NULL, NULL, NULL, NULL),
(12, 1, 17, 15, 185, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(13, 1, 17, 16, 186, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 0, 17, 17, 187, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 19, 10, 188, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(8, 1, 19, 11, 189, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 1, 19, 12, 190, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 1, 19, 13, 191, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 1, 19, 14, 192, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 1, 19, 15, 193, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(13, 1, 19, 16, 194, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 0, 19, 17, 195, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 20, 5, 196, 'lat', 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 20, 4, 197, 'lon', 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 20, 6, 198, 'cota', 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 20, 7, 199, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 20, 8, 200, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 20, 9, 201, '', 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 20, 10, 202, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(8, 1, 20, 11, 203, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 1, 20, 12, 204, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 1, 20, 13, 205, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 1, 20, 14, 206, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 1, 20, 15, 207, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(13, 1, 20, 16, 208, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 0, 20, 17, 209, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 33, 5, 210, 'lat', 1, NULL, NULL, NULL, NULL, NULL),
(2, 1, 33, 4, 211, 'lon', 1, NULL, NULL, NULL, NULL, NULL),
(3, 1, 33, 6, 212, 'cota', 1, NULL, NULL, NULL, NULL, NULL),
(4, 1, 33, 7, 213, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 33, 8, 214, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 1, 33, 9, 215, '', 0, NULL, NULL, NULL, NULL, NULL),
(7, 1, 33, 10, 216, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(8, 1, 33, 11, 217, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 1, 33, 12, 218, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 1, 33, 13, 219, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 1, 33, 14, 220, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 1, 33, 15, 221, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(13, 1, 33, 16, 222, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 0, 33, 17, 223, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 1, 17, 18, 224, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 1, 17, 14, 225, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 34, 19, 226, '', 0, NULL, 'time - 1', NULL, NULL, NULL),
(2, 1, 34, 19, 227, '', 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 35, 22, 228, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(2, 1, 35, 23, 229, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(3, 1, 35, 21, 230, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(4, 1, 35, 24, 231, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 1, 35, 25, 232, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(1, 1, 4, 1, 2066, NULL, 0, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sensors_types`
--

CREATE TABLE `sensors_types` (
  `id` int(11) NOT NULL,
  `type` varchar(45) NOT NULL,
  `metric` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `position` int(11) NOT NULL,
  `errorvalue` double DEFAULT NULL,
  `valuemax` double DEFAULT NULL,
  `valuemin` double DEFAULT NULL,
  `correction_general` text DEFAULT NULL,
  `correction_time_general` text DEFAULT NULL,
  `discard_value` text DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `updatedAt` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sensors_types`
--

INSERT INTO `sensors_types` (`id`, `type`, `metric`, `description`, `position`, `errorvalue`, `valuemax`, `valuemin`, `correction_general`, `correction_time_general`, `discard_value`, `createdAt`, `updatedAt`) VALUES
(3, 'Humedad', '% hr', 'Sensorización Humedad', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Latitud', 'grados', 'Medición Latitud', 1, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Longitud', 'grados', 'Medición Longitud', 2, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Altitud', 'metros', 'Medición Altitud', 3, 65535, 5000, -2500, NULL, NULL, NULL, NULL, NULL),
(7, 'Satélites', 'Nº de satélites', 'Cantidad de Satélites', 4, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Hdop', '100ths-i32', 'Dimensión Horizontal de la Precisión', 5, 65535, 9998, 0, NULL, NULL, NULL, NULL, NULL),
(9, 'Velocidad', 'm/s', 'Medición Velocidad', 6, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'MassConcentrationPm1p0', 'µg/m³', 'Precisión de concentración de masa para PM1', 7, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'MassConcentrationPm4p0', 'µg/m³', 'Precisión de concentración de masa para PM4 ', 9, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'MassConcentrationPm10p0', 'µg/m³', 'Precisión de concentración de masa para PM10', 10, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Humedad Ambiente', '%%RH', 'Medición de la Humedad Ambiente', 11, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Temperatura Ambiente', '°C', 'Medición de la Temperatura Ambiente', 12, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'VocIndex', 'ppb', 'Compuestos Orgánicos Volátiles', 13, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'NoxIndex', 'g/m³', 'Óxidos de Nitrógeno', 14, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Temperatura Fahrenheit ', '°F', 'Medición de la Temperatura Fahrenheit', 18, 65535, NULL, NULL, '(value * 9/5) + 32', NULL, NULL, NULL, NULL),
(19, 'Presencia', 'status', 'Control de presencia', 19, 65535, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Humedad Ambiente Corregida', '%%RH', 'Medición de la Humedad Ambiente Corregida', 20, 65535, NULL, NULL, 'value - 3', 'time - 1', NULL, NULL, NULL),
(21, 'PV_Acceleration', 'm/s²', 'X-axis acceleration peak value (Yokogawa)', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Data_Type', 'Code', 'Tipo de configuración', 1, NULL, NULL, NULL, NULL, NULL, '65,66,67', NULL, NULL),
(23, 'Data_Status', 'Code', 'Status of measured value. (Yokogawa)', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'PV_Velocity', 'mm/s', 'Z-axis velocity RMS value (Yokogawa)', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'PV_Temperature', '°C', 'Temperature measured value (Yokogawa)', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, '7', '7', '7', 7, 7, 7, 7, '7', '7', '7', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `change_password` tinyint(1) NOT NULL,
  `token` text NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `revoke_date` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `user`, `password`, `change_password`, `token`, `enabled`, `revoke_date`) VALUES
(15, 'david', '$2b$10$5EiVve7Ar4qTDT40EYnI3ePOV/KGywfmJrjerBKESbzKqm42fVZE6', 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGF2aWQiLCJpZCI6MTUsImlhdCI6MTcxNTUxMTU2NSwiZXhwIjoxNzE2MTE2MzY1fQ.zTWmx3pjzi6D9cnBcrpsXh7GCxlpxEuhitNaqwJG8ic', 1, '2024-05-19 10:59:25'),
(74, 'admin', '$2b$10$ef7OtEbhASC2dqycq5wniey6M9DlqkHK/0O06OCD.rhZE3LtDGGRO', 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpZCI6NzQsImlhdCI6MTcxNTUxMTM1MSwiZXhwIjoxNzE2MTE2MTUxfQ.bygz184x-DVyLsVDy_MDdTHUUmCiOdq7GgzMPxnrmeE', 1, '2024-05-19 10:55:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variable_data_structure`
--

CREATE TABLE `variable_data_structure` (
  `id` int(11) NOT NULL,
  `description` text NOT NULL,
  `structure` text NOT NULL,
  `initial_byte` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `variable_data_structure`
--

INSERT INTO `variable_data_structure` (`id`, `description`, `structure`, `initial_byte`) VALUES
(1, 'Estructura variable de Yokogawa', 'UINT8', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `conecction_read`
--
ALTER TABLE `conecction_read`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `conecction_write`
--
ALTER TABLE `conecction_write`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `data_estructure`
--
ALTER TABLE `data_estructure`
  ADD PRIMARY KEY (`id_estructure`);

--
-- Indices de la tabla `device_configurations`
--
ALTER TABLE `device_configurations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sensors_devices`
--
ALTER TABLE `sensors_devices`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sensors_types`
--
ALTER TABLE `sensors_types`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `conecction_read`
--
ALTER TABLE `conecction_read`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `conecction_write`
--
ALTER TABLE `conecction_write`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `config`
--
ALTER TABLE `config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `data_estructure`
--
ALTER TABLE `data_estructure`
  MODIFY `id_estructure` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `device_configurations`
--
ALTER TABLE `device_configurations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `sensors_devices`
--
ALTER TABLE `sensors_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2076;

--
-- AUTO_INCREMENT de la tabla `sensors_types`
--
ALTER TABLE `sensors_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `Borrar registros log` ON SCHEDULE EVERY 1 DAY STARTS '2024-04-27 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM log 
WHERE log_date > NOW() - INTERVAL 
    (SELECT value_int FROM config WHERE name='log_erase') DAY$$

CREATE DEFINER=`root`@`localhost` EVENT `Borrar registros log_script` ON SCHEDULE EVERY 1 DAY STARTS '2024-05-11 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM log_script 
WHERE log_date > NOW() - INTERVAL 
    (SELECT value_int FROM config WHERE name='log_script_erase') DAY$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
