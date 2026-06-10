-- ============================================================================
-- Scientific Calculator - MySQL Database Schema
-- For XAMPP (phpMyAdmin / MySQL / MariaDB)
-- ============================================================================
-- Import: phpMyAdmin → Import → Choose this file → Go
-- Or CLI: mysql -u root -p < database.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `scientific_calculator`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `scientific_calculator`;

-- ----------------------------------------------------------------------------
-- Users (optional — for multi-user / login later)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)  NOT NULL,
  `email`         VARCHAR(100) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Use password_hash() in PHP',
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- User / session settings (theme, sound, angle mode, memory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calculator_settings` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        INT UNSIGNED DEFAULT NULL COMMENT 'NULL = guest session',
  `session_id`     VARCHAR(64)  DEFAULT NULL COMMENT 'Browser session for guests',
  `theme`          ENUM('light', 'dark') NOT NULL DEFAULT 'light',
  `sound_enabled`  TINYINT(1)   NOT NULL DEFAULT 0,
  `angle_mode`     ENUM('DEG', 'RAD') NOT NULL DEFAULT 'DEG',
  `memory_value`   DOUBLE       NOT NULL DEFAULT 0,
  `memory_active`  TINYINT(1)   NOT NULL DEFAULT 0,
  `last_answer`    DOUBLE       NOT NULL DEFAULT 0,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  CONSTRAINT `fk_settings_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Calculation history
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calculation_history` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED    DEFAULT NULL,
  `session_id`  VARCHAR(64)     DEFAULT NULL,
  `expression`  TEXT            NOT NULL,
  `result`      VARCHAR(100)    NOT NULL,
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_history_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Stored procedures (optional helpers)
-- ----------------------------------------------------------------------------

DELIMITER //

-- Add a history entry
CREATE PROCEDURE IF NOT EXISTS `sp_add_history`(
  IN p_user_id    INT UNSIGNED,
  IN p_session_id VARCHAR(64),
  IN p_expression TEXT,
  IN p_result     VARCHAR(100)
)
BEGIN
  INSERT INTO `calculation_history` (`user_id`, `session_id`, `expression`, `result`)
  VALUES (p_user_id, p_session_id, p_expression, p_result);
END //

-- Get history for user or session (newest first)
CREATE PROCEDURE IF NOT EXISTS `sp_get_history`(
  IN p_user_id    INT UNSIGNED,
  IN p_session_id VARCHAR(64),
  IN p_limit      INT UNSIGNED
)
BEGIN
  SELECT `id`, `expression`, `result`, `created_at`
  FROM `calculation_history`
  WHERE (p_user_id IS NOT NULL AND `user_id` = p_user_id)
     OR (p_user_id IS NULL AND `session_id` = p_session_id)
  ORDER BY `created_at` DESC
  LIMIT p_limit;
END //

-- Clear all history for user or session
CREATE PROCEDURE IF NOT EXISTS `sp_clear_history`(
  IN p_user_id    INT UNSIGNED,
  IN p_session_id VARCHAR(64)
)
BEGIN
  DELETE FROM `calculation_history`
  WHERE (p_user_id IS NOT NULL AND `user_id` = p_user_id)
     OR (p_user_id IS NULL AND `session_id` = p_session_id);
END //

-- Upsert calculator settings
CREATE PROCEDURE IF NOT EXISTS `sp_save_settings`(
  IN p_user_id       INT UNSIGNED,
  IN p_session_id    VARCHAR(64),
  IN p_theme         ENUM('light', 'dark'),
  IN p_sound         TINYINT(1),
  IN p_angle_mode    ENUM('DEG', 'RAD'),
  IN p_memory_value  DOUBLE,
  IN p_memory_active TINYINT(1),
  IN p_last_answer   DOUBLE
)
BEGIN
  DECLARE v_id INT UNSIGNED;

  SELECT `id` INTO v_id
  FROM `calculator_settings`
  WHERE (p_user_id IS NOT NULL AND `user_id` = p_user_id)
     OR (p_user_id IS NULL AND `session_id` = p_session_id)
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO `calculator_settings` (
      `user_id`, `session_id`, `theme`, `sound_enabled`,
      `angle_mode`, `memory_value`, `memory_active`, `last_answer`
    ) VALUES (
      p_user_id, p_session_id, p_theme, p_sound,
      p_angle_mode, p_memory_value, p_memory_active, p_last_answer
    );
  ELSE
    UPDATE `calculator_settings`
    SET `theme`          = p_theme,
        `sound_enabled`  = p_sound,
        `angle_mode`     = p_angle_mode,
        `memory_value`   = p_memory_value,
        `memory_active`  = p_memory_active,
        `last_answer`    = p_last_answer
    WHERE `id` = v_id;
  END IF;
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- Sample data (optional — for testing)
-- ----------------------------------------------------------------------------

INSERT INTO `users` (`username`, `email`) VALUES
  ('demo', 'demo@calculator.local');

SET @demo_user_id = LAST_INSERT_ID();

INSERT INTO `calculator_settings` (
  `user_id`, `theme`, `sound_enabled`, `angle_mode`,
  `memory_value`, `memory_active`, `last_answer`
) VALUES (
  @demo_user_id, 'dark', 1, 'DEG', 0, 0, 42
);

INSERT INTO `calculation_history` (`user_id`, `expression`, `result`) VALUES
  (@demo_user_id, '2+3*4', '14'),
  (@demo_user_id, 'sin(30)', '0.5'),
  (@demo_user_id, 'sqrt(16)', '4'),
  (@demo_user_id, '5!', '120'),
  (@demo_user_id, '2^10', '1024');

-- ----------------------------------------------------------------------------
-- Useful views
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW `v_recent_calculations` AS
SELECT
  h.`id`,
  u.`username`,
  h.`session_id`,
  h.`expression`,
  h.`result`,
  h.`created_at`
FROM `calculation_history` h
LEFT JOIN `users` u ON u.`id` = h.`user_id`
ORDER BY h.`created_at` DESC;

-- ============================================================================
-- End of database.sql
-- ============================================================================
