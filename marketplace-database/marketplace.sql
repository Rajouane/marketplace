-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: marketplace
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ville` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_postal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Maroc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_client_id_foreign` (`client_id`),
  CONSTRAINT `addresses_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,3,'RES DIAR ANOUARE IMM 1 ETG 2 APPT A 7 GH 4 BENI YAKHLEF MOHAMMEDIA','MOHAMMEDIA','28810','Maroc','2026-09-14 09:18:46','2026-09-16 07:26:58');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantite` int unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_cart_id_product_id_unique` (`cart_id`,`product_id`),
  KEY `cart_items_product_id_foreign` (`product_id`),
  CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (5,1,3,3,'2026-09-14 09:39:32','2026-09-16 07:32:13'),(6,1,1,1,'2026-09-14 11:53:53','2026-09-14 11:53:53');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_client_id_unique` (`client_id`),
  CONSTRAINT `carts_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,3,'2026-09-14 07:40:23','2026-09-14 07:40:23'),(2,5,'2026-09-14 09:04:45','2026-09-14 09:04:45');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_parent_id_foreign` (`parent_id`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Électronique',1,'2026-09-11 11:30:53','2026-09-11 11:30:53');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commissions`
--

DROP TABLE IF EXISTS `commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `vendeur_id` bigint unsigned NOT NULL,
  `taux` decimal(5,2) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `commissions_order_id_foreign` (`order_id`),
  KEY `commissions_vendeur_id_foreign` (`vendeur_id`),
  CONSTRAINT `commissions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_vendeur_id_foreign` FOREIGN KEY (`vendeur_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commissions`
--

LOCK TABLES `commissions` WRITE;
/*!40000 ALTER TABLE `commissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('montant','pourcentage') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` decimal(10,2) NOT NULL,
  `montant_minimum` decimal(10,2) NOT NULL DEFAULT '0.00',
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `nombre_max_utilisations` int unsigned DEFAULT NULL,
  `nombre_utilisations` int unsigned NOT NULL DEFAULT '0',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `livreur_id` bigint unsigned DEFAULT NULL,
  `statut` enum('en_attente','recuperee','en_cours','livree','echec') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `date_affectation` timestamp NULL DEFAULT NULL,
  `date_livraison` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deliveries_order_id_foreign` (`order_id`),
  KEY `deliveries_livreur_id_foreign` (`livreur_id`),
  CONSTRAINT `deliveries_livreur_id_foreign` FOREIGN KEY (`livreur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `deliveries_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_client_id_product_id_unique` (`client_id`,`product_id`),
  KEY `favorites_product_id_foreign` (`product_id`),
  CONSTRAINT `favorites_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2026_09_11_111405_create_personal_access_tokens_table',1),(4,'2026_09_11_111418_create_roles_table',1),(5,'2026_09_11_111418_create_users_table',1),(6,'2026_09_11_111420_create_shops_table',1),(7,'2026_09_11_111421_create_categories_table',1),(8,'2026_09_11_111422_create_products_table',1),(9,'2026_09_11_111423_create_carts_table',1),(10,'2026_09_11_111423_create_product_images_table',1),(11,'2026_09_11_111424_create_addresses_table',1),(12,'2026_09_11_111424_create_cart_items_table',1),(13,'2026_09_11_111425_create_orders_table',1),(14,'2026_09_11_111426_create_order_items_table',1),(15,'2026_09_11_111427_create_payments_table',1),(16,'2026_09_11_111428_create_deliveries_table',1),(17,'2026_09_11_111429_create_coupons_table',1),(18,'2026_09_11_111430_create_reviews_table',1),(19,'2026_09_11_111431_create_favorites_table',1),(20,'2026_09_11_111432_create_notifications_table',1),(21,'2026_09_11_111433_create_commissions_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lu` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `shop_id` bigint unsigned NOT NULL,
  `quantite` int unsigned NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  KEY `order_items_shop_id_foreign` (`shop_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,3,1,2,2500.00,5000.00,'2026-09-14 09:19:20','2026-09-14 09:19:20'),(2,2,1,1,1,70.00,70.00,'2026-09-14 09:39:19','2026-09-14 09:39:19'),(3,2,2,1,1,180.00,180.00,'2026-09-14 09:39:19','2026-09-14 09:39:19'),(4,2,3,1,1,2000.00,2000.00,'2026-09-14 09:39:19','2026-09-14 09:39:19');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` bigint unsigned NOT NULL,
  `address_id` bigint unsigned NOT NULL,
  `sous_total` decimal(10,2) NOT NULL,
  `frais_livraison` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reduction` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `statut` enum('en_attente','confirmee','preparee','expediee','livree','annulee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_numero_unique` (`numero`),
  KEY `orders_client_id_foreign` (`client_id`),
  KEY `orders_address_id_foreign` (`address_id`),
  CONSTRAINT `orders_address_id_foreign` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `orders_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'CMD-PXN3LN6W',3,1,5000.00,30.00,0.00,5030.00,'livree','2026-09-14 09:19:20','2026-09-14 09:31:24'),(2,'CMD-VFTKG3YK',3,1,2250.00,30.00,0.00,2280.00,'expediee','2026-09-14 09:39:19','2026-09-16 07:33:50');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `mode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paiement_a_la_livraison',
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_reference_unique` (`reference`),
  KEY `payments_order_id_foreign` (`order_id`),
  CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'paiement_a_la_livraison','en_attente',NULL,'2026-09-14 09:19:20','2026-09-14 09:19:20'),(2,2,'paiement_a_la_livraison','en_attente',NULL,'2026-09-14 09:39:19','2026-09-14 09:39:19');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'marketplace-token','e193481a991a495205e4140fb72d959c331a85472fb82e2a766b1e59e0b5eb4d','[\"*\"]','2026-09-11 11:30:53',NULL,'2026-09-11 11:17:59','2026-09-11 11:30:53'),(2,'App\\Models\\User',1,'marketplace-token','f772a1146f97aeae8da1a8a620a61ed51b7d426befe61f5306c32095d64988f4','[\"*\"]',NULL,NULL,'2026-09-11 12:27:05','2026-09-11 12:27:05'),(3,'App\\Models\\User',1,'marketplace-token','f025cac392d1384b27d66bce543985f0c72fe62e71dfac8c4d4d105faa3bfe41','[\"*\"]','2026-09-11 12:47:32',NULL,'2026-09-11 12:43:03','2026-09-11 12:47:32'),(4,'App\\Models\\User',2,'marketplace-token','6fb92a0d6f1c8336d986829ee4a9974ac159984a224c1d35462f5a3a13a7425c','[\"*\"]',NULL,NULL,'2026-09-11 12:48:19','2026-09-11 12:48:19'),(5,'App\\Models\\User',2,'marketplace-token','c54cb5e16cfe1a89af8c752b4bfab83e3eed81e271a7fac50cca157e3aa5e714','[\"*\"]',NULL,NULL,'2026-09-11 12:48:28','2026-09-11 12:48:28'),(6,'App\\Models\\User',2,'marketplace-token','d374839957c540b136753edc1030b1c1d4ba00ac516f9df3c9cc527d52b42d95','[\"*\"]',NULL,NULL,'2026-09-11 12:48:33','2026-09-11 12:48:33'),(7,'App\\Models\\User',2,'marketplace-token','d1e0e89ea6d1954db7f59efc585f76e69b0a970d467f089fc4dc9c71f7a47024','[\"*\"]',NULL,NULL,'2026-09-11 12:48:41','2026-09-11 12:48:41'),(8,'App\\Models\\User',2,'marketplace-token','176537c29f3292513b9002d267be282e505cd87499bac09abc4d8857db5a9d0a','[\"*\"]',NULL,NULL,'2026-09-11 12:48:55','2026-09-11 12:48:55'),(9,'App\\Models\\User',2,'marketplace-token','c3d04407b7c95c6532c3fe7f8ecd93ac0df805a5d64a4940b0ebf0cd722caa36','[\"*\"]',NULL,NULL,'2026-09-14 06:58:17','2026-09-14 06:58:17'),(10,'App\\Models\\User',3,'marketplace-token','8fcf9441575e2f6218afa22ff9a41582df1e593c933dd984f3e1faf186896d26','[\"*\"]',NULL,NULL,'2026-09-14 06:58:59','2026-09-14 06:58:59'),(11,'App\\Models\\User',1,'marketplace-token','20691e5d34b7c1b9b0adf6a1f4df683e89eeb6059ba74dd204ac60d3b1b7e548','[\"*\"]','2026-09-14 07:30:27',NULL,'2026-09-14 06:59:42','2026-09-14 07:30:27'),(12,'App\\Models\\User',2,'marketplace-token','7630070c8f0dd99fe21b769930012beb841f011fff0257a639ec2140aca9ecbd','[\"*\"]','2026-09-14 07:34:05',NULL,'2026-09-14 07:34:04','2026-09-14 07:34:05'),(13,'App\\Models\\User',2,'marketplace-token','40f6cf576e4ef145ccd759eb96737c4e9dc46859d523217094061923fae462a6','[\"*\"]','2026-09-14 07:35:56',NULL,'2026-09-14 07:35:49','2026-09-14 07:35:56'),(14,'App\\Models\\User',2,'marketplace-token','9ae6b25c0acc5ac877ce99d7c3e014fe3cad459d2f55cd0aa8ab4cf09f7606b6','[\"*\"]','2026-09-14 07:38:32',NULL,'2026-09-14 07:38:06','2026-09-14 07:38:32'),(15,'App\\Models\\User',3,'marketplace-token','799bbfcf61f0f8eed46e2044718f5c56e99ce8fe9063d1b130710b33f6727f1f','[\"*\"]','2026-09-14 07:40:31',NULL,'2026-09-14 07:40:10','2026-09-14 07:40:31'),(16,'App\\Models\\User',4,'marketplace-token','b5db79eb2ff69caffbc7e5b4347d19ba797a731c181427662c8796c0e7e88243','[\"*\"]','2026-09-14 07:45:59',NULL,'2026-09-14 07:40:49','2026-09-14 07:45:59'),(17,'App\\Models\\User',1,'marketplace-token','d0ccdad63a0baeffa71408d59cfe70b5d77a7828e03540d6e3e18c3164a18de5','[\"*\"]','2026-09-14 08:05:40',NULL,'2026-09-14 07:46:05','2026-09-14 08:05:40'),(18,'App\\Models\\User',3,'marketplace-token','2b30a8211c69eb29ad844cd0b0aafc3c41755bcf345fb723fcef68bd0d73dde8','[\"*\"]','2026-09-14 08:09:58',NULL,'2026-09-14 08:09:37','2026-09-14 08:09:58'),(19,'App\\Models\\User',2,'marketplace-token','09aacf9480c1a04367e80a572be9831fc0e74f3f00f2f9f6bb7de9d2270854d4','[\"*\"]','2026-09-14 08:40:43',NULL,'2026-09-14 08:13:52','2026-09-14 08:40:43'),(20,'App\\Models\\User',1,'marketplace-token','6872587cb314ba30b878523722fab9d7f019b4f23429661d06ff8a0a1be90d0e','[\"*\"]','2026-09-14 08:41:08',NULL,'2026-09-14 08:40:53','2026-09-14 08:41:08'),(21,'App\\Models\\User',2,'marketplace-token','2531bf05084b73934a6f13e72c0b48470694f767809c1ce76cc414595e18d48c','[\"*\"]','2026-09-14 08:48:33',NULL,'2026-09-14 08:46:00','2026-09-14 08:48:33'),(22,'App\\Models\\User',1,'marketplace-token','1d58040f845eb8b09495a2273a8b1c8e68e072c80ab59aa56eaabd4c28a78bbb','[\"*\"]','2026-09-14 08:48:56',NULL,'2026-09-14 08:48:42','2026-09-14 08:48:56'),(23,'App\\Models\\User',4,'marketplace-token','fa16c14d039f0209e1bad6cc8a86a267f64e92e22092ef6f11aa8dea411a28d4','[\"*\"]','2026-09-14 08:50:07',NULL,'2026-09-14 08:50:02','2026-09-14 08:50:07'),(24,'App\\Models\\User',3,'marketplace-token','17d9b3f440e303dbee47ff5e63d3b56ca35a188a40b6f083b341beaab3679858','[\"*\"]','2026-09-14 08:51:34',NULL,'2026-09-14 08:50:18','2026-09-14 08:51:34'),(25,'App\\Models\\User',1,'marketplace-token','8107328c9338470ff387ea8280eef06168d79c2b90e7cfb55965e54d5eb085f0','[\"*\"]','2026-09-14 08:51:50',NULL,'2026-09-14 08:51:40','2026-09-14 08:51:50'),(26,'App\\Models\\User',3,'marketplace-token','43ced0fa72472cb131d212e60289e1bac8bd09794a08d11944ba984395f96c5f','[\"*\"]','2026-09-14 08:56:15',NULL,'2026-09-14 08:56:08','2026-09-14 08:56:15'),(27,'App\\Models\\User',2,'marketplace-token','d6469b540b8f13a3deb67ea99e4935dd83f5da5ab9b05fb1504fbd1ade181822','[\"*\"]','2026-09-14 09:02:22',NULL,'2026-09-14 09:02:00','2026-09-14 09:02:22'),(28,'App\\Models\\User',3,'marketplace-token','cc1e242b11ba832891464f2b2921c9358f5b8d6a4dd5676d76f937ce910b73c9','[\"*\"]','2026-09-14 09:03:49',NULL,'2026-09-14 09:02:33','2026-09-14 09:03:49'),(29,'App\\Models\\User',4,'marketplace-token','256deff931c8abf0262d1b0608654c3a72ec9e301e52232382a5dde146e11457','[\"*\"]','2026-09-14 09:04:04',NULL,'2026-09-14 09:04:03','2026-09-14 09:04:04'),(30,'App\\Models\\User',5,'marketplace-token','28d1a5a34de3d400b5c37deee40947c841917a9e093293490285a5bfdbd1a45c','[\"*\"]','2026-09-14 09:05:05',NULL,'2026-09-14 09:04:43','2026-09-14 09:05:05'),(31,'App\\Models\\User',2,'marketplace-token','3b6891f41af1575e4b303ae1515a97c8ca1d5073242288514804b346ce69af9f','[\"*\"]','2026-09-14 09:05:47',NULL,'2026-09-14 09:05:15','2026-09-14 09:05:47'),(32,'App\\Models\\User',3,'marketplace-token','664b5ffc1b7aa29ebc100b84292ae3f26c313c3cd01fe6c82eb1bd42904bd997','[\"*\"]','2026-09-14 09:19:44',NULL,'2026-09-14 09:09:11','2026-09-14 09:19:44'),(33,'App\\Models\\User',3,'marketplace-token','a78ea11429e9adb37b418d6e2458e32d6dd5e43674ab91872250983a908ed91f','[\"*\"]','2026-09-14 09:19:55',NULL,'2026-09-14 09:19:51','2026-09-14 09:19:55'),(34,'App\\Models\\User',2,'marketplace-token','ad3d12b781095fc4fc213d0f9fc790d615039b70e8d813aa39275066dce673dd','[\"*\"]','2026-09-14 09:31:24',NULL,'2026-09-14 09:20:03','2026-09-14 09:31:24'),(35,'App\\Models\\User',4,'marketplace-token','a35536b134cdd53577987b26e5491197383e7a03dd95062afe2cdb1a3da1a61a','[\"*\"]','2026-09-14 09:31:39',NULL,'2026-09-14 09:31:34','2026-09-14 09:31:39'),(36,'App\\Models\\User',3,'marketplace-token','90a533b02aa833f807b448c06970dfe8fb6b3ea22b98fd571aab7aec438b94ef','[\"*\"]','2026-09-14 09:32:27',NULL,'2026-09-14 09:31:47','2026-09-14 09:32:27'),(37,'App\\Models\\User',1,'marketplace-token','703b3e9752edf99cd361ed705513b95b183eae622b51b2330ec2c77150453f63','[\"*\"]','2026-09-14 09:32:59',NULL,'2026-09-14 09:32:41','2026-09-14 09:32:59'),(38,'App\\Models\\User',2,'marketplace-token','a89c4864208f70674e1cee9a5da52602e5a17ade1dd8b3252c745bd3043c0849','[\"*\"]','2026-09-14 09:34:03',NULL,'2026-09-14 09:33:09','2026-09-14 09:34:03'),(39,'App\\Models\\User',5,'marketplace-token','0f5864e39690b16e0c66dcfb4da9d8e3b8f613a9cddb0ab04ab5d09d2e9c1508','[\"*\"]','2026-09-14 09:34:21',NULL,'2026-09-14 09:34:10','2026-09-14 09:34:21'),(40,'App\\Models\\User',3,'marketplace-token','6d0496d737b0b719b21af4a4da1fb2a0664f49cebdb75493c9c1bab39f2664c2','[\"*\"]','2026-09-14 09:37:45',NULL,'2026-09-14 09:34:28','2026-09-14 09:37:45'),(41,'App\\Models\\User',2,'marketplace-token','f1e290476261835c1e170e833fe88997048167a082c670010799b4c9ac872a33','[\"*\"]','2026-09-14 09:38:39',NULL,'2026-09-14 09:38:07','2026-09-14 09:38:39'),(42,'App\\Models\\User',3,'marketplace-token','4e1e5e03322bf28760b790bcb18845a2d0cdd02013bd44899fd87998750deddd','[\"*\"]','2026-09-14 10:35:33',NULL,'2026-09-14 09:38:53','2026-09-14 10:35:33'),(43,'App\\Models\\User',3,'marketplace-token','124e737c2db69a9a6ddba2300d67ea395a12068ccc2930e8fe00878aa7d2aa81','[\"*\"]','2026-09-16 07:32:56',NULL,'2026-09-14 10:35:43','2026-09-16 07:32:56'),(44,'App\\Models\\User',2,'marketplace-token','8b1dc65d522b5aa31efda7ddb1625d59b9cd0ba31adcc0a4c6606b5577990d78','[\"*\"]','2026-09-16 07:34:10',NULL,'2026-09-16 07:33:02','2026-09-16 07:34:10'),(45,'App\\Models\\User',3,'marketplace-token','8570c2860a46ae0d92ff68705ae4aef3771e8e55f67d9d15b08cfbee9b85ae0c','[\"*\"]','2026-09-16 07:36:17',NULL,'2026-09-16 07:34:52','2026-09-16 07:36:17'),(46,'App\\Models\\User',2,'marketplace-token','7a8f365239db71e460c4e3e78f89de68d26074ceed0ec6dc455e370af106cbd3','[\"*\"]','2026-09-16 07:47:03',NULL,'2026-09-16 07:43:05','2026-09-16 07:47:03'),(47,'App\\Models\\User',3,'marketplace-token','197f2e6c31b02ddc682ec5420d1ba1fa8680afcc45f2d8d8f48276a020e9881c','[\"*\"]','2026-09-16 07:47:37',NULL,'2026-09-16 07:47:23','2026-09-16 07:47:37');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `chemin` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_foreign` (`product_id`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,3,'products/Qd3bGpbygy8eta6k5PWaEVtMOIKFmsMUlTumfgZV.jpg','2026-09-14 08:30:04','2026-09-14 08:30:04');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `prix` decimal(10,2) NOT NULL,
  `prix_promotionnel` decimal(10,2) DEFAULT NULL,
  `stock` int unsigned NOT NULL DEFAULT '0',
  `seuil_alerte` int unsigned NOT NULL DEFAULT '5',
  `marque` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('brouillon','en_attente','publie','rejete') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brouillon',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_shop_id_foreign` (`shop_id`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `products_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,1,'pc',NULL,777.00,70.00,84,5,'lenovo','publie','2026-09-14 08:17:17','2026-09-14 09:39:19'),(2,1,1,'telefon','telefon',180.00,199.82,985,5,'Samsoung','publie','2026-09-14 08:24:36','2026-09-14 09:39:19'),(3,1,1,'redmi','redmi',2000.00,2500.00,7,5,'xiomi','publie','2026-09-14 08:30:00','2026-09-14 09:39:19'),(4,1,1,'pc',NULL,5000.00,6000.00,2,5,'lenovo','publie','2026-09-16 07:44:23','2026-09-16 07:47:01'),(5,1,1,'pc',NULL,5000.00,6000.00,2,5,'lenovo','publie','2026-09-16 07:44:34','2026-09-16 07:46:46'),(6,1,1,'iphone 17',NULL,22000.00,25000.00,5,5,NULL,'publie','2026-09-16 07:45:58','2026-09-16 07:46:32');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `note` tinyint unsigned NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `statut` enum('en_attente','publie','rejete') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_client_id_product_id_unique` (`client_id`,`product_id`),
  KEY `reviews_product_id_foreign` (`product_id`),
  CONSTRAINT `reviews_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nom_unique` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrateur',NULL,NULL),(2,'Vendeur',NULL,NULL),(3,'Client',NULL,NULL),(4,'Livreur',NULL,NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shops` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vendeur_id` bigint unsigned NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `statut` enum('en_attente','active','suspendue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shops_vendeur_id_foreign` (`vendeur_id`),
  CONSTRAINT `shops_vendeur_id_foreign` FOREIGN KEY (`vendeur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
INSERT INTO `shops` VALUES (1,2,'TechStore Maroc','Boutique spécialisée dans la vente de produits électroniques,\naccessoires informatiques et smartphones au Maroc.','en_attente','2026-09-14 08:16:16','2026-09-14 08:16:16');
/*!40000 ALTER TABLE `shops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('actif','suspendu') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'actif',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_foreign` (`role_id`),
  CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Administrateur','admin@marketplace.test','0600000001','$2y$12$bqEYDE/AM6kJSdoDjtVSOOG6CNobp3PO5rz7ycejH07ecGz6T1rAO','actif',NULL,'2026-09-11 09:49:49','2026-09-11 09:49:49'),(2,2,'Vendeur Test','vendeur@marketplace.test','0600000002','$2y$12$qcBBQDZWWMkOJO8NMN9Yz.2pQAtAFQ9cbc5rEa/LRltGbnILYkni2','actif',NULL,'2026-09-11 09:49:49','2026-09-11 09:49:49'),(3,3,'Client Test','client@marketplace.test','0600000003','$2y$12$lI3IJdLZBHNfrpNHufOn6O1w2UuvFV/rp./nJ.7hv2JxyrGGgXW7.','actif',NULL,'2026-09-11 09:49:50','2026-09-11 09:49:50'),(4,4,'Livreur Test','livreur@marketplace.test','0600000004','$2y$12$elmHAGDHCLQPnHFk73wx4.4iLrPnRQY0iNJAHAsm7P7yADCwiQCnC','actif',NULL,'2026-09-11 09:49:50','2026-09-11 09:49:50'),(5,3,'َRAJOUANE','rajouane@marketplace.test','0611212246','$2y$12$geXS3KGpv8d.rYCPu9GUzu6SgYw1KS6ejQL/OJAxGgPjUnBiNmYQW','actif',NULL,'2026-09-14 09:04:43','2026-09-14 09:04:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-16 12:05:25
