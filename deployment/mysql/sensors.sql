-- MySQL dump 10.13  Distrib 8.0.34, for Linux (x86_64)
--
-- Host: 15.5.0.5    Database: sensors
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `sensors`
--

/*!40000 DROP DATABASE IF EXISTS `sensors`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sensors` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `sensors`;

--
-- Table structure for table `data_estructure`
--

DROP TABLE IF EXISTS `data_estructure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_estructure` (
  `id_estructure` int NOT NULL AUTO_INCREMENT,
  `description` text,
  `configuration` text,
  `identifier_code` int DEFAULT NULL,
  `id_variable_data_structure` int NOT NULL,
  PRIMARY KEY (`id_estructure`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_estructure`
--

LOCK TABLES `data_estructure` WRITE;
/*!40000 ALTER TABLE `data_estructure` DISABLE KEYS */;
INSERT INTO `data_estructure` VALUES (1,'Sonda CO2 con GPS (7)','FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32',NULL,0),(2,'Yokogawa XS770A Sushi Sensor Vibration (Z axis) Data_Type=0x10','UINT8,UINT16,FLOAT16,FLOAT16,FLOAT16',16,1),(3,'Sushi Sensor Vibration (X-axis)\r\nData_Type=0x12','UINT8,UINT16,FLOAT16,FLOAT16',18,1),(4,'Sonda CO2 Temp Hum - TTGO (3)','FLOAT32,FLOAT32,FLOAT32',NULL,0),(5,'Sonda CO2 (1)','FLOAT32',NULL,0),(6,'Sonda GPS (6)','FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32',NULL,0),(7,'Sonda VOC GPS Correction (14)','FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32',NULL,0),(8,'Sonda VOC (7)','FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32',NULL,0),(9,'Sonda VOC GPS (13)','FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32,FLOAT32',NULL,0),(10,'Sonda Presencia (2)','FLOAT32,FLOAT32',NULL,0),(12,'Dragino LSE01 Soil Moisture & EC Sensor','BATERY_DRAGINO,TEMPERATURE_DRAGINO,CONDUCTSOIL_DRAGINO,TEMPETURESOIL_DRAGINO,WATERSOIL_DRAGINO',NULL,0);
/*!40000 ALTER TABLE `data_estructure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_configurations`
--

DROP TABLE IF EXISTS `device_configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topic_name` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8_general_ci NOT NULL,
  `organizationid` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8_general_ci NOT NULL,
  `lat` double NOT NULL,
  `lon` double NOT NULL,
  `cota` double NOT NULL,
  `timezone` varchar(45) NOT NULL,
  `description_origin` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8_general_ci NOT NULL,
  `origin` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8_general_ci NOT NULL,
  `uid` varchar(45) NOT NULL,
  `application_id` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8_general_ci NOT NULL,
  `id_data_estructure` int DEFAULT NULL,
  `variable_configuration` tinyint NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `typemeter` varchar(45) NOT NULL,
  `alias` varchar(45) NOT NULL,
  `enable` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_configurations`
--

LOCK TABLES `device_configurations` WRITE;
/*!40000 ALTER TABLE `device_configurations` DISABLE KEYS */;
INSERT INTO `device_configurations` VALUES (1,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 1 - TTGO','Multisensor','ua-sensor-s1','ua-sensor',4,0,NULL,NULL,'UASENSOR','Despacho 1247',1),(2,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 2 - TTGO','Multisensor','ua-sensor-s2','ua-sensor',4,0,NULL,NULL,'UASENSOR','Despacho 1216',1),(3,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 3 - TTGO','Sensor C02','ua-sensor-s3','ua-sensor',5,0,NULL,NULL,'UASENSOR','Despacho 1234',1),(4,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 4 - TTGO','Sensor C02','ua-sensor-s4','ua-sensor',5,0,NULL,NULL,'UASENSOR','Despacho 1247',1),(5,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 5 - TTGO','Sensor C02','ua-sensor-s5','ua-sensor',5,0,NULL,NULL,'UASENSOR','0015PB006',1),(6,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 6 - TTGO','Multisensor','ua-sensor-s6','ua-sensor',4,0,NULL,NULL,'UASENSOR','Despacho 1246',1),(7,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 7 - TTGO','Sensor CO2','ua-sensor-s7','ua-sensor',5,0,NULL,NULL,'UASENSOR','0037P1036',1),(8,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',0,0,0,'Europe/Madrid','Sensor 8 - TBEAM','Sensor GPS','ua-sensor-s8','ua-sensor',6,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(9,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 9 - TTGO','Sensor CO2','ua-sensor-s9','ua-sensor',5,0,NULL,NULL,'UASENSOR','Despacho 1247',1),(10,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 10 - TBEAM','Sensor CO2','ua-sensor-s10','ua-sensor',5,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(11,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.3879143951802,-0.5205190257745766,0,'Europe/Madrid','Sensor 11 - TBEAM','Multisensor GPS','ua-sensor-s11','ua-sensor',1,0,NULL,NULL,'UASENSOR','Facultad de Educación',1),(12,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.382810317793336,-0.5148430958871572,0,'Europe/Madrid','Sensor 12 - TTGO','Sensor CO2','ua-sensor-s12','ua-sensor',5,0,NULL,NULL,'UASENSOR','Instituto Investigación Informática',1),(13,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38482407481661,-0.5131080300266437,0,'Europe/Madrid','Sensor 13 - TBEAM','Multisensor GPS','ua-sensor-s13','ua-sensor',1,0,NULL,NULL,'UASENSOR','Torre de Control',1),(14,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 14 - TBEAM','Sensor GPS','ua-sensor-s14','ua-sensor',6,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(15,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 15 - TBEAM','Sensor GPS','ua-sensor-s15','ua-sensor',6,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(16,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',0,0,0,'Europe/Madrid','Sensor 16 - TBEAM','Sensor GPS','ua-sensor-s16','ua-sensor',6,0,NULL,NULL,'UASENSOR','Despacho 1247',1),(17,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38238360500826,-0.5122013383425177,0,'Europe/Madrid','Sensor 17 - TBEAM','Multisensor GPS VOC','ua-sensor-s17','ua-sensor',7,0,NULL,NULL,'UASENSOR','Escuela de Negocios',1),(18,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.3816708264329,-0.5236659987259781,0,'Europe/Madrid','Sensor 18 - TBEAM','Multisensor GPS','ua-sensor-s18','ua-sensor',1,0,NULL,NULL,'UASENSOR','Parque Científico',1),(19,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38684557310198,-0.5112393016373945,0,'Europe/Madrid','Sensor 19 - TBEAM','Multisensor GPS VOC','ua-sensor-s19','ua-sensor',9,0,NULL,NULL,'UASENSOR','Politécnica I',1),(20,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38738705943065,-0.5180613115713143,0,'Europe/Madrid','Sensor 20 - TBEAM','Multisensor GPS VOC','ua-sensor-s20','ua-sensor',8,0,NULL,NULL,'UASENSOR','Ciencias VI',1),(21,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 21 - TBEAM','Multisensor GPS','ua-sensor-s21','ua-sensor',1,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(22,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 22 - TBEAM','Multisensor GPS','ua-sensor-s22','ua-sensor',1,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(23,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.388059614687144,-0.513247473685333,0,'Europe/Madrid','Sensor 23 - TBEAM','Multisensor GPS','ua-sensor-s23','ua-sensor',1,0,NULL,NULL,'UASENSOR','Servicio de Informática',1),(24,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38717684061646,-0.5133454071647628,0,'Europe/Madrid','Sensor 24 - TBEAM','Multisensor GPS','ua-sensor-s24','ua-sensor',1,0,NULL,NULL,'UASENSOR','Laboratorio de Aguas',1),(25,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38635266206297,-0.5161813111823153,0,'Europe/Madrid','Sensor 25 - TBEAM','Multisensor GPS','ua-sensor-s25','ua-sensor',1,0,NULL,NULL,'UASENSOR','Biblioteca Derecho',1),(26,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38279034375877,-0.5164420087270247,0,'Europe/Madrid','Sensor 26 - TBEAM','Multisensor GPS','ua-sensor-s26','ua-sensor',1,0,NULL,NULL,'UASENSOR','Aulario 1',1),(27,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38304448852155,-0.51394754264504,0,'Europe/Madrid','Sensor 27 - TBEAM','Multisensor GPS','ua-sensor-s27','ua-sensor',1,0,NULL,NULL,'UASENSOR','Facultad de Ciencias Económicas',1),(28,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38365892975121,-0.5106176800834143,0,'Europe/Madrid','Sensor 28 - TBEAM','Multisensor GPS','ua-sensor-s28','ua-sensor',1,0,NULL,NULL,'UASENSOR','Biblioteca Politécnica',1),(29,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 29 - TBEAM','Multisensor GPS','ua-sensor-s29','ua-sensor',1,0,NULL,NULL,'UASENSOR','Despacho 1215',1),(30,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38348652416068,-0.5121358104001964,0,'Europe/Madrid','Sensor 30 - TBEAM','Multisensor GPS','ua-sensor-s30','ua-sensor',1,0,NULL,NULL,'UASENSOR','Biblioteca General',1),(31,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38485076703961,-0.5106477746996321,0,'Europe/Madrid','Sensor 31 - TBEAM','Multisensor GPS','ua-sensor-s31','ua-sensor',1,0,NULL,NULL,'UASENSOR','Aulario 2',1),(32,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38453473969473,-0.5093876459789433,0,'Europe/Madrid','Sensor 32 - TBEAM','Multisensor GPS','ua-sensor-s32','ua-sensor',1,0,NULL,NULL,'UASENSOR','Aulario 2',1),(33,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.97518313182293,-0.1409554481506348,0,'Europe/Madrid','Sensor 33 - TBEAM','Multisensor GPS VOC','ua-sensor-s33','ua-sensor',9,0,NULL,NULL,'UASENSOR','Gandía',1),(34,'ua.sensors.raw','UA UNIVERSIDAD DE ALICANTE',38.38766904183048,-0.5126090599775734,0,'Europe/Madrid','Sensor 34 - TBEAM','Multisensor GPS PRESENCE','ua-sensor-s34','ua-sensor',10,0,NULL,NULL,'UASENSOR','Politécnica II',0),(35,'ua.bim.raw','UA UNIVERSIDAD DE ALICANTE',38.38476380146816,-0.5114567766812126,10,'Europe/Madrid','Sensor 35 - YOKOGAWA','Yokogawa XS770A Vibration','yokogawa-xs770a-s1','ua-sensor',2,0,NULL,NULL,'YOKOGAWA','Rectorado',1),(36,'ua.bim.raw','UA UNIVERSIDAD DE ALICANTE',38.385271,-0.509498,0,'Europe/Madrid','Sensor 36 - DRAGINO','Dragino LSE01-Soil Moisture & EC Sensor','dragino-lse01-s1','ua-sensor',12,0,NULL,NULL,'DRAGINO','Despacho 1215',1);
/*!40000 ALTER TABLE `device_configurations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensors_devices`
--

DROP TABLE IF EXISTS `sensors_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensors_devices` (
  `orden` int NOT NULL,
  `enable` tinyint NOT NULL,
  `id_device` int NOT NULL,
  `id_type_sensor` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `datafield` varchar(45) DEFAULT NULL,
  `nodata` tinyint NOT NULL DEFAULT '0',
  `correction_specific` text,
  `correction_time_specific` text,
  `topic_specific` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2031 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensors_devices`
--

LOCK TABLES `sensors_devices` WRITE;
/*!40000 ALTER TABLE `sensors_devices` DISABLE KEYS */;
INSERT INTO `sensors_devices` VALUES (1,1,1,1,1,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,1,2,2,NULL,0,NULL,NULL,NULL,NULL,NULL),(3,1,1,3,3,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,2,1,4,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,2,2,5,NULL,0,NULL,NULL,NULL,NULL,NULL),(3,1,2,3,6,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,3,1,7,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,4,1,8,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,5,1,9,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,6,1,10,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,6,2,11,NULL,0,NULL,NULL,NULL,NULL,NULL),(3,1,6,3,12,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,7,1,13,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,8,4,14,'lon',0,NULL,NULL,NULL,NULL,NULL),(1,1,8,5,15,'lat',0,NULL,NULL,NULL,NULL,NULL),(3,1,8,6,16,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,8,7,17,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,8,8,18,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,8,9,19,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,10,1,20,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,0,9,1,21,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,11,1,22,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,12,1,23,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,13,1,24,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,14,1,25,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,15,1,26,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,16,5,27,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,16,4,28,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,16,6,29,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,16,7,30,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,16,8,31,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,16,9,32,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,17,5,33,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,17,4,34,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,17,6,35,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,17,7,36,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,17,8,37,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,17,9,38,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,18,5,39,'lat',0,NULL,NULL,NULL,NULL,NULL),(1,1,19,5,40,'lat',0,NULL,NULL,NULL,NULL,NULL),(1,1,14,5,41,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,14,4,42,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,14,6,43,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,14,7,44,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,14,8,45,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,14,9,46,'',0,NULL,NULL,NULL,NULL,NULL),(2,1,19,4,47,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,19,6,48,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,19,7,49,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,19,8,50,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,19,9,51,'',0,NULL,NULL,NULL,NULL,NULL),(15,0,19,1,52,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,21,5,53,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,21,4,54,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,21,6,55,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,21,7,56,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,21,8,57,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,21,9,58,'',0,NULL,NULL,NULL,NULL,NULL),(15,0,21,1,59,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,22,5,60,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,22,4,61,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,22,6,62,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,22,7,63,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,22,8,64,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,22,9,65,'',0,NULL,NULL,NULL,NULL,NULL),(7,1,22,1,66,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,23,1,67,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,24,1,68,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,25,1,69,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,26,1,70,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,27,1,71,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,28,1,72,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,29,1,73,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,30,1,74,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,31,1,75,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,32,1,76,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,18,4,77,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,18,6,78,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,18,7,79,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,18,8,80,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,18,9,91,'',0,NULL,NULL,NULL,NULL,NULL),(7,1,18,1,92,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,24,5,93,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,24,4,94,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,24,6,95,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,24,7,96,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,24,8,97,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,24,9,98,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,32,5,99,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,32,4,100,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,32,6,101,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,32,7,102,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,32,8,103,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,32,9,104,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,27,5,105,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,27,4,106,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,27,6,107,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,27,7,108,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,27,8,109,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,27,9,110,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,30,5,111,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,30,4,112,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,30,6,113,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,30,7,114,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,30,8,115,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,30,9,116,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,15,5,117,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,15,4,118,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,15,6,119,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,15,7,120,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,15,8,121,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,15,9,122,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,25,5,123,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,25,4,124,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,25,6,125,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,25,7,126,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,25,8,127,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,25,9,128,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,23,5,129,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,23,4,130,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,23,6,131,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,23,7,132,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,23,8,133,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,23,9,134,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,28,5,135,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,28,4,136,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,28,6,137,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,28,7,138,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,28,8,139,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,28,9,140,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,31,5,141,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,31,4,142,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,31,6,143,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,31,7,144,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,31,8,145,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,31,9,146,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,29,5,147,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,29,4,148,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,29,6,149,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,29,7,150,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,29,8,151,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,29,9,152,'',0,NULL,NULL,NULL,NULL,NULL),(7,1,29,1,153,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,26,5,154,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,26,4,155,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,26,6,156,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,26,7,157,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,26,8,158,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,26,9,159,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,13,5,160,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,13,4,161,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,13,6,162,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,13,7,163,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,13,8,164,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,13,9,165,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,11,5,166,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,11,4,167,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,11,6,168,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,11,7,169,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,11,8,170,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,11,9,171,'',0,NULL,NULL,NULL,NULL,NULL),(7,1,21,10,172,NULL,0,NULL,NULL,NULL,NULL,NULL),(8,1,21,11,173,NULL,0,NULL,NULL,NULL,NULL,NULL),(9,1,21,12,174,NULL,0,NULL,NULL,NULL,NULL,NULL),(10,1,21,13,175,NULL,0,NULL,NULL,NULL,NULL,NULL),(11,1,21,14,176,NULL,0,NULL,NULL,NULL,NULL,NULL),(12,1,21,15,177,NULL,0,NULL,NULL,NULL,NULL,NULL),(13,1,21,16,178,NULL,0,NULL,NULL,NULL,NULL,NULL),(14,0,21,17,179,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,17,10,180,NULL,0,NULL,NULL,NULL,NULL,NULL),(8,1,17,11,181,NULL,0,NULL,NULL,NULL,NULL,NULL),(9,1,17,12,182,NULL,0,NULL,NULL,NULL,NULL,NULL),(10,1,17,13,183,NULL,0,NULL,NULL,NULL,NULL,NULL),(11,1,17,20,184,NULL,0,'value - 6',NULL,NULL,NULL,NULL),(12,1,17,15,185,NULL,0,NULL,NULL,NULL,NULL,NULL),(13,1,17,16,186,NULL,0,NULL,NULL,NULL,NULL,NULL),(14,0,17,17,187,NULL,0,NULL,NULL,NULL,NULL,NULL),(7,1,19,10,188,NULL,0,NULL,NULL,NULL,NULL,NULL),(8,1,19,11,189,NULL,0,NULL,NULL,NULL,NULL,NULL),(9,1,19,12,190,NULL,0,NULL,NULL,NULL,NULL,NULL),(10,1,19,13,191,NULL,0,NULL,NULL,NULL,NULL,NULL),(11,1,19,14,192,NULL,0,NULL,NULL,NULL,NULL,NULL),(12,1,19,15,193,NULL,0,NULL,NULL,NULL,NULL,NULL),(13,1,19,16,194,NULL,0,NULL,NULL,NULL,NULL,NULL),(14,0,19,17,195,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,20,5,196,'lat',0,NULL,NULL,NULL,NULL,NULL),(2,1,20,4,197,'lon',0,NULL,NULL,NULL,NULL,NULL),(3,1,20,6,198,'cota',0,NULL,NULL,NULL,NULL,NULL),(4,1,20,7,199,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,20,8,200,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,20,9,201,'',0,NULL,NULL,NULL,NULL,NULL),(7,1,20,10,202,NULL,0,NULL,NULL,NULL,NULL,NULL),(8,1,20,11,203,NULL,0,NULL,NULL,NULL,NULL,NULL),(9,1,20,12,204,NULL,0,NULL,NULL,NULL,NULL,NULL),(10,1,20,13,205,NULL,0,NULL,NULL,NULL,NULL,NULL),(11,1,20,14,206,NULL,0,NULL,NULL,NULL,NULL,NULL),(12,1,20,15,207,NULL,0,NULL,NULL,NULL,NULL,NULL),(13,1,20,16,208,NULL,0,NULL,NULL,NULL,NULL,NULL),(14,0,20,17,209,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,33,5,210,'lat',1,NULL,NULL,NULL,NULL,NULL),(2,1,33,4,211,'lon',1,NULL,NULL,NULL,NULL,NULL),(3,1,33,6,212,'cota',1,NULL,NULL,NULL,NULL,NULL),(4,1,33,7,213,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,33,8,214,NULL,0,NULL,NULL,NULL,NULL,NULL),(6,1,33,9,215,'',0,NULL,NULL,NULL,NULL,NULL),(7,1,33,10,216,NULL,0,NULL,NULL,NULL,NULL,NULL),(8,1,33,11,217,NULL,0,NULL,NULL,NULL,NULL,NULL),(9,1,33,12,218,NULL,0,NULL,NULL,NULL,NULL,NULL),(10,1,33,13,219,NULL,0,NULL,NULL,NULL,NULL,NULL),(11,1,33,14,220,NULL,0,NULL,NULL,NULL,NULL,NULL),(12,1,33,15,221,NULL,0,NULL,NULL,NULL,NULL,NULL),(13,1,33,16,222,NULL,0,NULL,NULL,NULL,NULL,NULL),(14,0,33,17,223,NULL,0,NULL,NULL,NULL,NULL,NULL),(12,1,17,18,224,NULL,0,NULL,NULL,NULL,NULL,NULL),(11,1,17,14,225,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,34,19,226,'',0,NULL,'time - 1',NULL,NULL,NULL),(2,1,34,19,227,'',0,NULL,NULL,NULL,NULL,NULL),(1,1,35,22,228,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,35,23,229,NULL,0,NULL,NULL,NULL,NULL,NULL),(3,1,35,21,230,NULL,0,NULL,NULL,NULL,NULL,NULL),(4,1,35,24,231,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,35,25,232,NULL,0,NULL,NULL,NULL,NULL,NULL),(1,1,36,26,233,NULL,0,NULL,NULL,NULL,NULL,NULL),(2,1,36,27,234,NULL,0,NULL,NULL,NULL,NULL,NULL),(3,1,36,28,235,NULL,0,NULL,NULL,NULL,NULL,NULL),(4,1,36,29,236,NULL,0,NULL,NULL,NULL,NULL,NULL),(5,1,36,30,237,NULL,0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sensors_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensors_types`
--

DROP TABLE IF EXISTS `sensors_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensors_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  `metric` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `position` int NOT NULL,
  `errorvalue` double DEFAULT NULL,
  `valuemax` double DEFAULT NULL,
  `valuemin` double DEFAULT NULL,
  `correction_general` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `correction_time_general` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `discard_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensors_types`
--

LOCK TABLES `sensors_types` WRITE;
/*!40000 ALTER TABLE `sensors_types` DISABLE KEYS */;
INSERT INTO `sensors_types` VALUES (1,'CO2','ppm','Sensorización CO2',7,65535,8000,1,NULL,NULL,NULL,NULL,NULL),(2,'Temperatura','ºC','Sensorización Temperatura',0,NULL,80,-40,NULL,NULL,NULL,NULL,NULL),(3,'Humedad','% hr','Sensorización Humedad',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Latitud','grados','Medición Latitud',1,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'Longitud','grados','Medición Longitud',2,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'Altitud','metros','Medición Altitud',3,65535,5000,-2500,NULL,NULL,NULL,NULL,NULL),(7,'Satélites','Nº de satélites','Cantidad de Satélites',4,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Hdop','100ths-i32','Dimensión Horizontal de la Precisión',5,65535,9998,0,NULL,NULL,NULL,NULL,NULL),(9,'Velocidad','m/s','Medición Velocidad',6,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'MassConcentrationPm1p0','µg/m³','Precisión de concentración de masa para PM1',7,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'MassConcentrationPm2p5','µg/m³','Precisión de concentración de masa para PM2.5',8,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'MassConcentrationPm4p0','µg/m³','Precisión de concentración de masa para PM4 ',9,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'MassConcentrationPm10p0','µg/m³','Precisión de concentración de masa para PM10',10,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Humedad Ambiente','%%RH','Medición de la Humedad Ambiente',11,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'Temperatura Ambiente','°C','Medición de la Temperatura Ambiente',12,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'VocIndex','ppb','Compuestos Orgánicos Volátiles',13,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'NoxIndex','g/m³','Óxidos de Nitrógeno',14,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'Temperatura Fahrenheit ','°F','Medición de la Temperatura Fahrenheit',18,65535,NULL,NULL,'(value * 9/5) + 32',NULL,NULL,NULL,NULL),(19,'Presencia','status','Control de presencia',19,65535,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'Humedad Ambiente Corregida','%%RH','Medición de la Humedad Ambiente Corregida',20,65535,NULL,NULL,'value - 3','time - 1',NULL,NULL,NULL),(21,'PV_Acceleration','m/s²','X-axis acceleration peak value (Yokogawa)',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'Data_Type','Code','Tipo de configuración',1,NULL,NULL,NULL,NULL,NULL,'64,65,66,67',NULL,NULL),(23,'Data_Status','Code','Status of measured value. (Yokogawa)',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,'PV_Velocity','mm/s','Z-axis velocity RMS value (Yokogawa)',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'PV_Temperature','°C','Temperature measured value (Yokogawa)',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'Batery','V','Nivel de batería - Dragino LSE01',1,NULL,NULL,NULL,'value / 1000',NULL,NULL,NULL,NULL),(27,'Temperature','°C','Temperatura - Dragino LSE01',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,'Conduct Soil','uS/cm','Conductividad del Suelo  - Dragino LSE01',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,'Tempeture Soil','°C','Temperatura del Suelo  - Dragino LSE01',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,'Water Soil','%','Humedad del Suelo  - Dragino LSE01',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sensors_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variable_data_structure`
--

DROP TABLE IF EXISTS `variable_data_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variable_data_structure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `structure` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `initial_byte` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variable_data_structure`
--

LOCK TABLES `variable_data_structure` WRITE;
/*!40000 ALTER TABLE `variable_data_structure` DISABLE KEYS */;
INSERT INTO `variable_data_structure` VALUES (1,'Estructura variable de Yokogawa','UINT8',0),(2,'Estructura variable caudalimetro marca la pava','FLOAT16',1);
/*!40000 ALTER TABLE `variable_data_structure` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-26 13:27:34
