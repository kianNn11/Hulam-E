-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2025 at 05:03 PM
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
(12, '2025_06_03_030629_create_transactions_table', 7),
(13, '2025_06_03_030746_update_notifications_table_for_rentals', 8),
(14, '2025_06_03_062256_create_notifications_table', 9),
(15, '2025_06_04_080335_fix_transaction_amount_field', 10),
(16, '2025_06_04_161809_update_existing_verification_status_to_unverified', 10),
(17, '2025_06_05_000000_fix_verification_status_default', 10),
(18, '2025_06_05_000001_fix_verification_status_mysql', 10),
(19, '2025_06_06_000000_create_rental_images_table', 10);

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
('02f70983-844f-4041-a90e-27f9a922ad04', 'rental_approved', 'App\\Models\\User', 6, '{\"title\":\"Rental Request Approved!\",\"message\":\"Your rental request for \'Laravel\' has been approved by Customer\",\"transaction_id\":2,\"rental_id\":8}', NULL, '2025-07-23 06:49:20', '2025-07-23 06:49:20'),
('14803965-1b49-4074-97a1-d34fbded3788', 'rental_request', 'App\\Models\\User', 5, '{\"title\":\"New Rental Request\",\"message\":\"CustomerOne wants to rent your \'Laravel\' via checkout\",\"transaction_id\":2,\"rental_id\":8,\"renter_id\":6,\"total_amount\":100,\"contact_number\":\"09123123123\",\"rent_duration\":\"asdasdasd\",\"payment_method\":\"cash_on_delivery\"}', NULL, '2025-07-23 06:48:53', '2025-07-23 06:48:53'),
('194333d2-656e-466b-a8ed-dca4d75f44ba', 'checkout_complete', 'App\\Models\\User', 6, '{\"title\":\"Checkout Complete\",\"message\":\"Your rental request for 1 item(s) has been submitted. Total: \\u20b1110.00\",\"total_amount\":110,\"platform_fee\":10,\"subtotal\":100,\"payment_method\":\"cash_on_delivery\",\"item_count\":1,\"status\":\"pending\"}', NULL, '2025-07-23 06:48:53', '2025-07-23 06:48:53'),
('2fd7e398-0649-4fad-9e6c-66c91bbb2458', 'rental_completed', 'App\\Models\\User', 2, '{\"title\":\"Rental Completed\",\"message\":\"The rental for \'asdasdas\' has been marked as completed\",\"transaction_id\":1,\"rental_id\":5}', NULL, '2025-07-22 23:49:12', '2025-07-22 23:49:12'),
('a4cf3057-f97d-4c83-9eca-8c6fc086c683', 'checkout_complete', 'App\\Models\\User', 4, '{\"title\":\"Checkout Complete\",\"message\":\"Your rental request for 1 item(s) has been submitted. Total: \\u20b1232.00\",\"total_amount\":232,\"platform_fee\":10,\"subtotal\":222,\"payment_method\":\"cash_on_delivery\",\"item_count\":1,\"status\":\"pending\"}', NULL, '2025-07-22 23:46:54', '2025-07-22 23:46:54'),
('a9a88719-f921-44e9-9b42-0a3bfe9bf7ba', 'rental_completed', 'App\\Models\\User', 5, '{\"title\":\"Rental Completed\",\"message\":\"The rental for \'Laravel\' has been marked as completed\",\"transaction_id\":2,\"rental_id\":8}', NULL, '2025-07-23 06:49:27', '2025-07-23 06:49:27'),
('b40b7965-406f-43f8-86f0-80b3dce27bfd', 'rental_request', 'App\\Models\\User', 2, '{\"title\":\"New Rental Request\",\"message\":\"Customer wants to rent your \'asdasdas\' via checkout\",\"transaction_id\":1,\"rental_id\":5,\"renter_id\":4,\"total_amount\":222,\"contact_number\":\"09123123123\",\"rent_duration\":\"123123\",\"payment_method\":\"cash_on_delivery\"}', NULL, '2025-07-22 23:46:54', '2025-07-22 23:46:54'),
('ba1ec9d7-305d-4e2e-8d57-31d61dd5a056', 'rental_approved', 'App\\Models\\User', 4, '{\"title\":\"Rental Request Approved!\",\"message\":\"Your rental request for \'asdasdas\' has been approved by CustomerOne\",\"transaction_id\":1,\"rental_id\":5}', NULL, '2025-07-22 23:47:28', '2025-07-22 23:47:28');

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
(1, 'App\\Models\\User', 1, 'auth_token', 'f0bd8a9c9f62c23005a8f720d03ebb7d942be06e0e0527743150f0e7364d0479', '[\"*\"]', '2025-07-21 07:58:06', NULL, '2025-07-21 07:40:32', '2025-07-21 07:58:06'),
(2, 'App\\Models\\User', 1, 'auth_token', '156b4bb37c355656064487f109122d3950653a5b319b6fd2eb56aff39d983b4d', '[\"*\"]', NULL, NULL, '2025-07-21 07:58:56', '2025-07-21 07:58:56'),
(3, 'App\\Models\\User', 1, 'auth_token', '86557f19f864171c070c22ffc4ab2e9513e81335292ed3b0ceded0f3093c1158', '[\"*\"]', '2025-07-22 05:56:52', NULL, '2025-07-21 08:06:27', '2025-07-22 05:56:52'),
(4, 'App\\Models\\User', 2, 'auth_token', 'a36d6f56aaad624e3331e961dd083d4d22aa07631c481bf4cdb183f03d2ebd95', '[\"*\"]', '2025-07-22 07:30:07', NULL, '2025-07-21 08:07:15', '2025-07-22 07:30:07'),
(5, 'App\\Models\\User', 1, 'auth_token', 'd7dee5fa361732fce33083914ad2831d2cae9214e7eb3ab8c77338dc1fed7095', '[\"*\"]', '2025-07-22 22:56:59', NULL, '2025-07-22 19:24:22', '2025-07-22 22:56:59'),
(6, 'App\\Models\\User', 2, 'auth_token', 'a29de300da5f0af2c3ce50dbac4df52fcf984bcaa6cf1cd6d46ab71c9c275085', '[\"*\"]', '2025-07-22 22:55:26', NULL, '2025-07-22 20:28:44', '2025-07-22 22:55:26'),
(7, 'App\\Models\\User', 3, 'auth_token', '442f46fd5aaae2a5a10eac918d9da3a4c25c0d8f5e430b045e8c02d0f6a8b6b3', '[\"*\"]', NULL, NULL, '2025-07-22 23:14:03', '2025-07-22 23:14:03'),
(8, 'App\\Models\\User', 3, 'auth_token', '794f4bb847715acb0ed9d140fde1d9e69f085e5567b452e101ddc53be3a0ce46', '[\"*\"]', '2025-07-22 23:14:38', NULL, '2025-07-22 23:14:26', '2025-07-22 23:14:38'),
(9, 'App\\Models\\User', 3, 'auth_token', '11293a1507823668e1d54a320250b843f98ab2695718f1c738f33928add7f5e7', '[\"*\"]', '2025-07-22 23:16:18', NULL, '2025-07-22 23:14:45', '2025-07-22 23:16:18'),
(10, 'App\\Models\\User', 3, 'auth_token', '9aa2c876fc0751dce4e2d92ff800d4fdfa541173b9f52198890c6c0fdc2d281a', '[\"*\"]', '2025-07-22 23:36:53', NULL, '2025-07-22 23:16:29', '2025-07-22 23:36:53'),
(11, 'App\\Models\\User', 2, 'auth_token', '95416e8cd448ace1eba435477193c0ed86558145333429fbd51128b2afb609c4', '[\"*\"]', '2025-07-22 23:27:08', NULL, '2025-07-22 23:17:53', '2025-07-22 23:27:08'),
(12, 'App\\Models\\User', 2, 'auth_token', '6231b8544d008e38b4b469dc8bc7fe9ab10206cee09e85a099949553df0d2864', '[\"*\"]', '2025-07-23 05:51:02', NULL, '2025-07-22 23:38:23', '2025-07-23 05:51:02'),
(13, 'App\\Models\\User', 3, 'auth_token', '1247537533d2aec231de4efcc438430acfbdafb1fdf392080e9227bfa0bffc3c', '[\"*\"]', '2025-07-22 23:45:05', NULL, '2025-07-22 23:45:01', '2025-07-22 23:45:05'),
(14, 'App\\Models\\User', 3, 'auth_token', '1d27f916d582c51f4db73ebe82bf0cab3a3424715ebf9a59aae12da2a81b5702', '[\"*\"]', '2025-07-22 23:46:18', NULL, '2025-07-22 23:45:27', '2025-07-22 23:46:18'),
(15, 'App\\Models\\User', 4, 'auth_token', '6402b94d472f8f9ef1cf6923954a1e0bc6c1baf431ab498c325b8132055bcf61', '[\"*\"]', '2025-07-23 00:06:57', NULL, '2025-07-22 23:46:32', '2025-07-23 00:06:57'),
(16, 'App\\Models\\User', 2, 'auth_token', 'b0e8c2730b15f93d8846375df47ed12f5b2f7f4df3e8c6100a62a0f52054ecca', '[\"*\"]', '2025-07-23 06:06:01', NULL, '2025-07-23 05:51:23', '2025-07-23 06:06:01'),
(17, 'App\\Models\\User', 5, 'auth_token', '5dd945bec011c82a47e92cfaabf3165f86362b31109188e455a8b136a64d096a', '[\"*\"]', '2025-07-23 07:01:24', NULL, '2025-07-23 06:06:41', '2025-07-23 07:01:24'),
(18, 'App\\Models\\User', 6, 'auth_token', 'f9e078ef9982cf0ad52594710da06cb235a189c43602ae0cfc6e072091140ba1', '[\"*\"]', '2025-07-23 06:49:31', NULL, '2025-07-23 06:42:59', '2025-07-23 06:49:31'),
(19, 'App\\Models\\User', 3, 'auth_token', '49db73a11fd6e6d5ee8d5d983d3d5f37f397191620967b433f77cee3eb3f6d07', '[\"*\"]', '2025-07-23 06:54:58', NULL, '2025-07-23 06:50:46', '2025-07-23 06:54:58');

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
-- Table structure for table `rental_images`
--

CREATE TABLE `rental_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
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

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('sCq8myLQAH6V84YTKKE5afjolkH6t7u9LT47RYat', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFl1ZFBFeTNXdW5taU9VRjVIZEhsVFdHMUtOcUw1RW1oRlFzbUlCUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9kZWJ1Zy1maXJzdC1yZW50YWwiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1753281992);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED DEFAULT NULL,
  `renter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
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
  `verification_status` varchar(20) NOT NULL DEFAULT 'unverified',
  `verification_notes` text DEFAULT NULL,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `verified`, `remember_token`, `created_at`, `updated_at`, `bio`, `contact_number`, `course_year`, `birthday`, `gender`, `social_link`, `profile_picture`, `location`, `website`, `skills`, `education`, `rating`, `total_ratings`, `is_online`, `last_seen`, `show_email`, `show_contact`, `show_social_link`, `profile_completion`, `verification_document`, `verification_document_type`, `verification_submitted_at`, `verification_reviewed_at`, `verification_status`, `verification_notes`, `verified_by`) VALUES
(3, 'Admin', 'admin@hulame.com', NULL, '$2y$12$XsWQtAs3ebKdQZhcq0kLE.nkY0frhcb0CEU5AL8Q5NGPxLlExcUIC', 'admin', 0, NULL, '2025-07-22 23:14:03', '2025-07-22 23:16:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0, 0, 0, NULL, 0, 1, 1, 0, NULL, NULL, NULL, NULL, 'unverified', NULL, NULL);

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
-- Indexes for table `rental_images`
--
ALTER TABLE `rental_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rental_images_rental_id_index` (`rental_id`);

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
  ADD KEY `transactions_renter_id_status_index` (`renter_id`,`status`),
  ADD KEY `transactions_owner_id_status_index` (`owner_id`,`status`),
  ADD KEY `transactions_rental_id_foreign` (`rental_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `idx_verified_role` (`verified`,`role`),
  ADD KEY `idx_last_seen` (`last_seen`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `users_verification_submitted_at_index` (`verification_submitted_at`),
  ADD KEY `users_verified_by_foreign` (`verified_by`),
  ADD KEY `users_verification_status_index` (`verification_status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `rentals`
--
ALTER TABLE `rentals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `rental_images`
--
ALTER TABLE `rental_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rental_messages`
--
ALTER TABLE `rental_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Constraints for table `rental_images`
--
ALTER TABLE `rental_images`
  ADD CONSTRAINT `rental_images_rental_id_foreign` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE;

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
