-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 04, 2025 at 05:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hulame`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `rental_title` varchar(255) NOT NULL,
  `owner_email` varchar(255) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2023_06_02_000000_create_rentals_table', 1),
(5, '2023_06_02_000001_add_role_and_verified_to_users_table', 1),
(6, '2025_06_02_152721_create_personal_access_tokens_table', 2),
(7, '2025_06_02_170931_add_profile_fields_to_users_table', 3),
(8, '2025_06_02_195129_add_status_to_rentals_table', 4),
(10, '2025_06_03_005559_add_verification_fields_to_users_table', 5),
(11, '2025_06_03_020300_create_contact_messages_table', 6),
(16, '2025_06_03_030629_create_transactions_table', 7),
(17, '2025_06_03_030746_update_notifications_table_for_rentals', 7),
(19, '2025_06_03_062256_create_notifications_table', 8);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('48538aa2-52da-4f9e-963e-9965c23aafb0', 'rental_request', 'App\\Models\\User', 15, '{\"title\":\"New Rental Request\",\"message\":\"Curry Stephen wants to rent your \'dedededed\' via checkout\",\"transaction_id\":18,\"rental_id\":16,\"renter_id\":14,\"total_amount\":677,\"contact_number\":\"12123212\",\"rent_duration\":\"10hours\",\"payment_method\":\"cash_on_delivery\"}', NULL, '2025-06-03 19:36:41', '2025-06-03 19:36:41'),
('f5408df7-ff5c-4a87-be36-f26a37f681a1', 'checkout_complete', 'App\\Models\\User', 14, '{\"title\":\"Checkout Complete\",\"message\":\"Your rental request for 1 item(s) has been submitted. Total: \\u20b1687.00\",\"total_amount\":687,\"platform_fee\":10,\"subtotal\":677,\"payment_method\":\"cash_on_delivery\",\"item_count\":1}', NULL, '2025-06-03 19:36:41', '2025-06-03 19:36:41');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 2, 'auth_token', '2649a6b26353c5b8d6a3f6bd6ab5cb8c57c8c70f84075705d728df0bc6fab340', '[\"*\"]', NULL, NULL, '2025-06-02 15:29:54', '2025-06-02 15:29:54'),
(2, 'App\\Models\\User', 1, 'auth_token', '2c80c36518eb45f6c5edd14752e35a91a134cf000a70933b51ad0ec5ebf04d64', '[\"*\"]', NULL, NULL, '2025-06-02 15:36:35', '2025-06-02 15:36:35'),
(3, 'App\\Models\\User', 2, 'auth_token', 'cd25138e6ecb12f5cf63441234fc99643e0b0e7385bad12e1c0dc62cd90a85a8', '[\"*\"]', NULL, NULL, '2025-06-02 15:41:07', '2025-06-02 15:41:07'),
(4, 'App\\Models\\User', 1, 'auth_token', '84b4577dd1411c5f7bd5c97fc6e46d473ce3a29275957c68f918ddca1c508c83', '[\"*\"]', NULL, NULL, '2025-06-02 15:43:28', '2025-06-02 15:43:28'),
(5, 'App\\Models\\User', 2, 'auth_token', 'c40dfb62c77f5d2be41ff2fd5b9e7adf0d355fc6798cc221eb2a8d51d89796eb', '[\"*\"]', NULL, NULL, '2025-06-02 16:02:03', '2025-06-02 16:02:03'),
(6, 'App\\Models\\User', 1, 'auth_token', '0831a0cf6498dfa550aa7b16ef67fdfdb854bcf2f14cecd8b7a6b833925e83a8', '[\"*\"]', NULL, NULL, '2025-06-02 16:04:31', '2025-06-02 16:04:31'),
(8, 'App\\Models\\User', 2, 'auth_token', '41cb9fc30cc5aa276b8e1e9a94722ca8797a1d61bb8960cfd804f6360a65351a', '[\"*\"]', NULL, NULL, '2025-06-02 17:41:43', '2025-06-02 17:41:43'),
(16, 'App\\Models\\User', 4, 'auth_token', '20c4d095f591978c608dbaab2d7139cea2e20141c7a17b3afba8412e21189781', '[\"*\"]', '2025-06-02 16:58:07', NULL, '2025-06-03 00:39:24', '2025-06-02 16:58:07'),
(17, 'App\\Models\\User', 4, 'auth_token', '7695c299025bd8061a540d6385ae7c0688c504b604cfbb63bfa39a7363f55634', '[\"*\"]', NULL, NULL, '2025-06-02 16:44:52', '2025-06-02 16:44:52'),
(18, 'App\\Models\\User', 4, 'auth_token', 'b25664cab3acf9ee71a91a3cb282a887f9707deb152833c06a2ba98f9940256f', '[\"*\"]', '2025-06-02 16:45:05', NULL, '2025-06-02 16:45:00', '2025-06-02 16:45:05'),
(19, 'App\\Models\\User', 1, 'auth_token', '2a134f51d206ccfa091ad577c80d99c6a8f57afb5cbe7ed1ff3ced4e138f3bef', '[\"*\"]', '2025-06-02 17:31:30', NULL, '2025-06-02 17:14:32', '2025-06-02 17:31:30'),
(20, 'App\\Models\\User', 9, 'auth_token', 'f3ca476887dfbaa250da55b310eabdf3e13b90e8ac1e416a534918940d1efc32', '[\"*\"]', '2025-06-02 17:44:50', NULL, '2025-06-02 17:32:41', '2025-06-02 17:44:50'),
(21, 'App\\Models\\User', 9, 'auth_token', '7b54c784d7e55d4001529a14b89d19e7e6cc66123009715423e84f5e27870ca8', '[\"*\"]', '2025-06-02 17:53:33', NULL, '2025-06-02 17:45:32', '2025-06-02 17:53:33'),
(22, 'App\\Models\\User', 2, 'auth_token', '890ee19c2044dd3a9fe05e74caf5c946c1eaa16b0dfff264e3e8f69382a9fd4c', '[\"*\"]', '2025-06-02 18:58:44', NULL, '2025-06-02 17:55:34', '2025-06-02 18:58:44'),
(23, 'App\\Models\\User', 2, 'auth_token', '4d053d5c39c75e88f5a4080de7e6bb08fa4897f60291a105c38e5bf8121ceba2', '[\"*\"]', '2025-06-02 18:59:42', NULL, '2025-06-02 18:59:30', '2025-06-02 18:59:42'),
(24, 'App\\Models\\User', 9, 'auth_token', 'a816f44a154a52e2aae1638d82ad14d85d4adfd50c42d2e590cfd4d0130190fb', '[\"*\"]', NULL, NULL, '2025-06-02 18:59:52', '2025-06-02 18:59:52'),
(25, 'App\\Models\\User', 4, 'auth_token', '566f2927cb22698a84d3b062a7db768701f79fefbe5fa720c9a864a718b451cc', '[\"*\"]', NULL, NULL, '2025-06-02 19:00:52', '2025-06-02 19:00:52'),
(26, 'App\\Models\\User', 9, 'auth_token', '7686fa806628a879a41f8dc825f4cc5ccccd62c47dc71e2a2e6228673501135d', '[\"*\"]', '2025-06-02 19:59:12', NULL, '2025-06-02 19:01:37', '2025-06-02 19:59:12'),
(27, 'App\\Models\\User', 9, 'auth_token', '589cea8f22198bd1c50591ddffe575b350ac9cf76125a075c4b945c234cc7ae7', '[\"*\"]', '2025-06-02 21:57:24', NULL, '2025-06-02 21:28:59', '2025-06-02 21:57:24'),
(28, 'App\\Models\\User', 9, 'auth_token', '9242ec094716538e26e76945165e5eac7e2a924a39e77f4fb5a6c19e00fa18da', '[\"*\"]', '2025-06-02 22:27:22', NULL, '2025-06-02 22:09:15', '2025-06-02 22:27:22'),
(29, 'App\\Models\\User', 2, 'auth_token', '74e11ec3295f66e72f0c1cee6282c10968d0008f3d98cda0790acb5eaaebf4db', '[\"*\"]', '2025-06-02 22:54:44', NULL, '2025-06-02 22:27:46', '2025-06-02 22:54:44'),
(30, 'App\\Models\\User', 9, 'auth_token', '5340cb39e2bd9db7420e7f4ac7253c2991b96adc2fb66e6df3e7ceddf74ae934', '[\"*\"]', '2025-06-03 01:46:40', NULL, '2025-06-03 01:45:01', '2025-06-03 01:46:40'),
(31, 'App\\Models\\User', 2, 'auth_token', '67af08af977b0686d83d03ad813927141e2ce43ca1770eb154732c0931ad88ff', '[\"*\"]', '2025-06-03 01:47:20', NULL, '2025-06-03 01:47:17', '2025-06-03 01:47:20'),
(32, 'App\\Models\\User', 9, 'auth_token', '27199e37bd3eec4672ac50e684e97c7602f0bd2c6459e778150d98159a22e1da', '[\"*\"]', '2025-06-03 02:15:08', NULL, '2025-06-03 02:14:59', '2025-06-03 02:15:08'),
(33, 'App\\Models\\User', 2, 'auth_token', 'babfacf86b29ad2a4d7ebbcb6ce1365c311ea084dd18b39ac143ba56a40b82ce', '[\"*\"]', '2025-06-03 02:18:03', NULL, '2025-06-03 02:16:11', '2025-06-03 02:18:03'),
(34, 'App\\Models\\User', 9, 'auth_token', '3b302d299422dea6f47fe914064475c0cd237a95ff4c83ed44e14d104810c10f', '[\"*\"]', '2025-06-03 03:22:41', NULL, '2025-06-03 03:06:18', '2025-06-03 03:22:41'),
(35, 'App\\Models\\User', 9, 'auth_token', 'aaf6df8d6dee2e6c440222038347d462e0ab6013b51d158791846cf4ee4656f3', '[\"*\"]', '2025-06-03 03:27:38', NULL, '2025-06-03 03:25:56', '2025-06-03 03:27:38'),
(36, 'App\\Models\\User', 9, 'auth_token', '3af26e0dfea8b00d8e23ea05e5ae4ae22a14e6b834c0d9e5d788d8689e7bdeed', '[\"*\"]', '2025-06-03 03:37:19', NULL, '2025-06-03 03:34:41', '2025-06-03 03:37:19'),
(37, 'App\\Models\\User', 9, 'auth_token', '700cb2b2c5a8cfdf29065cbe24c93dc7a9061accbaeabfdee226c47c66584fba', '[\"*\"]', '2025-06-03 04:00:11', NULL, '2025-06-03 03:59:18', '2025-06-03 04:00:11'),
(38, 'App\\Models\\User', 9, 'auth_token', '491761410c04498c731c1ee05fb33d5cc7878a4c4a928aede69745156bcbfb38', '[\"*\"]', '2025-06-03 04:38:39', NULL, '2025-06-03 04:08:59', '2025-06-03 04:38:39'),
(39, 'App\\Models\\User', 12, 'auth_token', '856ea08426e0b6530402e1444799a7dca660aee35acb2a9dcc692c2248dbd558', '[\"*\"]', '2025-06-03 04:39:45', NULL, '2025-06-03 04:39:38', '2025-06-03 04:39:45'),
(40, 'App\\Models\\User', 9, 'auth_token', 'a3b7fcc06c2b09b5890acb07463a3181ba80cd1084ee605d92a5a458cf11da2b', '[\"*\"]', '2025-06-03 04:40:04', NULL, '2025-06-03 04:40:00', '2025-06-03 04:40:04'),
(41, 'App\\Models\\User', 4, 'auth_token', 'd89765c80740ffeb03da3d75ec80c021c72b469673ca7619ace9f66e777a8da3', '[\"*\"]', '2025-06-03 04:40:18', NULL, '2025-06-03 04:40:16', '2025-06-03 04:40:18'),
(42, 'App\\Models\\User', 12, 'auth_token', '3ee186fa2bcd5694756b0ae501254c0b721c0cad09ff1e86f6a7fc4a2680beb2', '[\"*\"]', '2025-06-03 04:48:48', NULL, '2025-06-03 04:47:39', '2025-06-03 04:48:48'),
(43, 'App\\Models\\User', 2, 'auth_token', 'ec7e2ffa4179f2f1416c2f2395b82163bb6057d67fca7f0041428c4b59fdf45d', '[\"*\"]', '2025-06-03 04:49:11', NULL, '2025-06-03 04:49:08', '2025-06-03 04:49:11'),
(44, 'App\\Models\\User', 12, 'auth_token', '40b22330bcf0c54cf65a34ab790e287ca360f4f46a72cb84b509bce862a4d8d1', '[\"*\"]', '2025-06-03 04:50:18', NULL, '2025-06-03 04:49:40', '2025-06-03 04:50:18'),
(45, 'App\\Models\\User', 13, 'auth_token', 'e3393a1d218f62e68094f1025ee0258247cac846c82cb0d4714fbf3b776fcc1b', '[\"*\"]', '2025-06-03 13:54:33', NULL, '2025-06-03 13:12:53', '2025-06-03 13:54:33'),
(46, 'App\\Models\\User', 14, 'auth_token', '2e03550b3a000b5326759c9badd03230435ab83d8e9958b6afca121c51a8e932', '[\"*\"]', '2025-06-03 15:05:53', NULL, '2025-06-03 13:56:20', '2025-06-03 15:05:53'),
(47, 'App\\Models\\User', 14, 'auth_token', 'd2c8bd142022022f8379c6d7c0fa54c2364812f768200bfa254f058de804ec43', '[\"*\"]', '2025-06-03 14:29:23', NULL, '2025-06-03 14:18:46', '2025-06-03 14:29:23'),
(48, 'App\\Models\\User', 14, 'auth_token', '08da1517634477860e3fa673a9c7c3f981e4267b4b75e34ea099f5109f6c6bea', '[\"*\"]', '2025-06-03 14:35:14', NULL, '2025-06-03 14:31:53', '2025-06-03 14:35:14'),
(49, 'App\\Models\\User', 14, 'auth_token', '2eec4ff8fbe75db8860ba068f53f72de049d5463d513ed51356dea60ee10de47', '[\"*\"]', '2025-06-03 14:36:04', NULL, '2025-06-03 14:35:20', '2025-06-03 14:36:04'),
(50, 'App\\Models\\User', 15, 'auth_token', 'e5fb4b746edc141f49a9fe8b034ede0ed6f5b30b2adf4ec78e9cb72fc63e2b02', '[\"*\"]', '2025-06-03 14:37:58', NULL, '2025-06-03 14:36:47', '2025-06-03 14:37:58'),
(51, 'App\\Models\\User', 13, 'auth_token', '06f5bc54a93c6df6b65aab5fc0f3f7dcaa45bf5960abb938fcefb6ef42216316', '[\"*\"]', '2025-06-03 14:40:36', NULL, '2025-06-03 14:40:18', '2025-06-03 14:40:36'),
(52, 'App\\Models\\User', 14, 'auth_token', '9e352a93bc37446e28b6880adfdb4fa0ea10a9a5ae7cac88dc9521d3acb81ea2', '[\"*\"]', '2025-06-03 14:46:51', NULL, '2025-06-03 14:46:05', '2025-06-03 14:46:51'),
(53, 'App\\Models\\User', 15, 'auth_token', 'dd84e572196cc3d9a7f52b4efe7853a72b5f653dbee8df5f57043529c7d9e05e', '[\"*\"]', '2025-06-03 16:01:24', NULL, '2025-06-03 14:47:03', '2025-06-03 16:01:24'),
(54, 'App\\Models\\User', 4, 'auth_token', '4d8493be14c9d3c64f490824cb9525d1363d5383abb5798fa366078cb516833b', '[\"*\"]', NULL, NULL, '2025-06-03 15:08:45', '2025-06-03 15:08:45'),
(55, 'App\\Models\\User', 4, 'auth_token', '5bce1a0a9c8d6baee5d07a2aa2054c695e1510d4746888452e55eafb7b440669', '[\"*\"]', NULL, NULL, '2025-06-03 15:09:15', '2025-06-03 15:09:15'),
(56, 'App\\Models\\User', 4, 'auth_token', '5c6e3d754c5e6fea2adbbffc8aee94e7263db9e1eb55cb3a459e6b8f2f7ec9e9', '[\"*\"]', NULL, NULL, '2025-06-03 15:09:31', '2025-06-03 15:09:31'),
(57, 'App\\Models\\User', 14, 'auth_token', '74bb1582ae2b09dab9439bbaa1eabe8f021dfab1dbcb69b9063942543fb5cf50', '[\"*\"]', NULL, NULL, '2025-06-03 15:59:27', '2025-06-03 15:59:27'),
(58, 'App\\Models\\User', 14, 'auth_token', '36c5fb96c49ffe59c0285721545818faea20e192265d2feaa62da5c0d8e1b095', '[\"*\"]', NULL, NULL, '2025-06-03 16:01:35', '2025-06-03 16:01:35'),
(59, 'App\\Models\\User', 4, 'auth_token', 'b033c0212c48990492807da9960e5f339db7a9773b54176cafcb05d0119085c7', '[\"*\"]', '2025-06-03 19:24:03', NULL, '2025-06-03 16:06:02', '2025-06-03 19:24:03'),
(60, 'App\\Models\\User', 4, 'auth_token', '33e4937311d8ce0a88c12605758231703c7bc18cdda13945966525ee5d97981b', '[\"*\"]', NULL, NULL, '2025-06-03 16:06:23', '2025-06-03 16:06:23'),
(61, 'App\\Models\\User', 4, 'auth_token', '88efc68bda3d9b39585dbfa637cd9114ab0f2ec0c6ee07f966689a4a5f8466ad', '[\"*\"]', NULL, NULL, '2025-06-03 19:25:43', '2025-06-03 19:25:43'),
(62, 'App\\Models\\User', 14, 'auth_token', '49bc7f2a1acb4b1bdba76bb3e4a96282ae3a2420e8815f903d5e1f6a315783f8', '[\"*\"]', NULL, NULL, '2025-06-03 19:27:19', '2025-06-03 19:27:19'),
(63, 'App\\Models\\User', 4, 'auth_token', 'bfa6a30d38cd377ace213683fc03622a772547af59f7784c1453e583575cbb5f', '[\"*\"]', '2025-06-03 19:27:53', NULL, '2025-06-03 19:27:46', '2025-06-03 19:27:53'),
(64, 'App\\Models\\User', 4, 'auth_token', '442a9b230297eb72030f9b7a360e17af60f66bc3f816d4466f0e371590f2e29d', '[\"*\"]', '2025-06-03 19:34:25', NULL, '2025-06-03 19:28:10', '2025-06-03 19:34:25'),
(65, 'App\\Models\\User', 15, 'auth_token', 'e3085f60be38acf529aff49c6c34fa561f9c8d68ccc061947f0796a183200e8f', '[\"*\"]', '2025-06-03 19:35:01', NULL, '2025-06-03 19:34:54', '2025-06-03 19:35:01'),
(66, 'App\\Models\\User', 4, 'auth_token', 'bc3ca7f3bfd89ba3a16d1a02a5ac078c60471926d0203365b112d082fccaa236', '[\"*\"]', NULL, NULL, '2025-06-03 19:35:19', '2025-06-03 19:35:19'),
(67, 'App\\Models\\User', 15, 'auth_token', 'deb1e6c315eef986234c4f1fd3ff6d6f0299a10ca58086697fc56a27b679ed07', '[\"*\"]', '2025-06-03 19:36:17', NULL, '2025-06-03 19:35:57', '2025-06-03 19:36:17'),
(68, 'App\\Models\\User', 14, 'auth_token', 'aadbdbc4036a82155b71702f5410cdac73e3cf268670c7ffdbc6a4b7372eca68', '[\"*\"]', '2025-06-03 19:36:57', NULL, '2025-06-03 19:36:31', '2025-06-03 19:36:57');

-- --------------------------------------------------------

--
-- Table structure for table `rentals`
--

CREATE TABLE `rentals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `location` varchar(255) NOT NULL,
  `image` text DEFAULT NULL,
  `status` enum('available','rented','unavailable') NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rental_messages`
--

CREATE TABLE `rental_messages` (
  `id` int(11) NOT NULL,
  `rental_id` int(11) NOT NULL,
  `renter_email` varchar(255) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `rental_title` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `renter_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `renter_message` text DEFAULT NULL,
  `owner_response` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `course_year` varchar(100) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `social_link` varchar(500) DEFAULT NULL,
  `profile_picture` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `education` text DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_ratings` int(11) DEFAULT 0,
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` timestamp NULL DEFAULT NULL,
  `show_email` tinyint(1) DEFAULT 0,
  `show_contact` tinyint(1) DEFAULT 1,
  `show_social_link` tinyint(1) DEFAULT 1,
  `profile_completion` int(11) DEFAULT 0,
  `verification_document` text DEFAULT NULL,
  `verification_document_type` varchar(50) DEFAULT NULL,
  `verification_submitted_at` timestamp NULL DEFAULT NULL,
  `verification_reviewed_at` timestamp NULL DEFAULT NULL,
  `verification_status` varchar(20) NOT NULL DEFAULT 'pending',
  `verification_notes` text DEFAULT NULL,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `verified`, `remember_token`, `created_at`, `updated_at`, `bio`, `contact_number`, `course_year`, `birthday`, `gender`, `social_link`, `profile_picture`, `location`, `website`, `skills`, `education`, `rating`, `total_ratings`, `is_online`, `last_seen`, `show_email`, `show_contact`, `show_social_link`, `profile_completion`, `verification_document`, `verification_document_type`, `verification_submitted_at`, `verification_reviewed_at`, `verification_status`, `verification_notes`, `verified_by`) VALUES
(4, 'Admin User', 'admin@hulame.com', '2025-06-02 15:58:22', '$2y$12$wXu3BF9Re9zvkEprPDbmd.ONK//ctgjivRj3cAxTAOw1AFLYgfbqe', 'admin', 1, NULL, '2025-06-02 15:58:22', '2025-06-03 16:06:10', 'System Administrator', '09123456789', 'N/A', NULL, 'Other', NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, NULL, NULL, NULL, 'approved', NULL, NULL),
(16, 'John Doe', 'john@example.com', NULL, '$2y$12$AgjuT18o5nzsuiMF2PcyJ.jNlv.6g2HlDrgDddQ8cQXzFvcy6nwOC', 'user', 1, NULL, '2025-06-03 15:20:08', '2025-06-03 16:06:10', 'Computer Science student interested in technology rentals', '09171234567', 'BSCS 3rd Year', NULL, 'Male', NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, NULL, NULL, NULL, 'approved', NULL, NULL),
(17, 'Jane Smith', 'jane@example.com', NULL, '$2y$12$vB7Yaj.jOWXwFc/QCgNtrOHN7quTnSnA1sCOjhoqkXVvZVmLBb6d2', 'user', 1, NULL, '2025-06-03 15:20:08', '2025-06-03 16:06:10', 'Business Administration student', '09987654321', 'BSBA 2nd Year', NULL, 'Female', NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, NULL, NULL, NULL, 'approved', NULL, NULL),
(18, 'Mike Johnson', 'mike@example.com', NULL, '$2y$12$bCqZh6hTiqDBvWQs.pu1A.agaG1f8taAAd3xEA2uE4KPVEKFrWTBy', 'user', 0, NULL, '2025-06-03 15:20:08', '2025-06-03 19:33:02', 'Engineering student seeking rental opportunities', '09456789123', 'BSCE 1st Year', NULL, 'Male', NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, 'Certificate of Registration', NULL, NULL, 'not_submitted', NULL, NULL),
(19, 'Sarah Williams', 'sarah@example.com', NULL, '$2y$12$hkI1hv7Gp4vRRG0t/MvX.OAClMnPKRFPe6tiMDCtQA.7KgpohVZHG', 'user', 0, NULL, '2025-06-03 15:20:08', '2025-06-03 19:33:02', 'Arts student with creative needs', '09789123456', 'BFA 4th Year', NULL, 'Female', NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, 'Certificate of Registration', NULL, NULL, 'not_submitted', NULL, NULL),
(20, 'David Brown', 'david@example.com', NULL, '$2y$12$T5ptKhcq9UFW1uANNOPjWuOgR4rphbx2zIat5juav0XdMHw7cpeDC', 'user', 0, NULL, '2025-06-03 15:21:07', '2025-06-03 16:06:11', 'New student just getting started', '09321654987', 'BSIT 1st Year', NULL, 'Male', NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, NULL, NULL, NULL, 'not-verified', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_messages_rental_id_sent_at_index` (`rental_id`,`sent_at`),
  ADD KEY `contact_messages_owner_email_index` (`owner_email`),
  ADD KEY `contact_messages_sender_email_index` (`sender_email`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `rentals`
--
ALTER TABLE `rentals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rentals_user_id_foreign` (`user_id`);

--
-- Indexes for table `rental_messages`
--
ALTER TABLE `rental_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rental_id` (`rental_id`),
  ADD KEY `idx_renter_email` (`renter_email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_rental_id_foreign` (`rental_id`),
  ADD KEY `transactions_renter_id_status_index` (`renter_id`,`status`),
  ADD KEY `transactions_owner_id_status_index` (`owner_id`,`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `idx_verified_role` (`verified`,`role`),
  ADD KEY `idx_last_seen` (`last_seen`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `users_verification_status_index` (`verification_status`),
  ADD KEY `users_verification_submitted_at_index` (`verification_submitted_at`),
  ADD KEY `users_verified_by_foreign` (`verified_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `rentals`
--
ALTER TABLE `rentals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `rental_messages`
--
ALTER TABLE `rental_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_rental_id_foreign` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rentals`
--
ALTER TABLE `rentals`
  ADD CONSTRAINT `rentals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_rental_id_foreign` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_renter_id_foreign` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
