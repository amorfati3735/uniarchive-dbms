-- ============================================================================
--  UniArchive — Relational Schema (Third Normal Form)
--  Target: MySQL 8 / MariaDB 10.4+
--  ---------------------------------------------------------------------------
--  Derived from the original MongoDB/Mongoose documents:
--    Resource{ topics[], comments[] }  ->  resources + resource_topics + comments
--    CourseStats{ topicCoverage[], activityGrid[] }
--                                      ->  course_stats + course_topic_coverage
--                                          + course_activity
--    Resource.author (free string)     ->  users  (FK)
--    Resource.professor/semester/year  ->  professors / semesters (FK)
--    Otp                               ->  otp_requests
--  ---------------------------------------------------------------------------
--  Every relation below is in 1NF, 2NF and 3NF.  The only intentional
--  redundancy is the maintained counters on `resources`
--  (upvotes/downloads/views), which are cached aggregates for read
--  performance — see docs/case-study.md § Normalization.
-- ============================================================================

DROP DATABASE IF EXISTS `test_uniarchive`;
CREATE DATABASE `test_uniarchive`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE `test_uniarchive`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `resource_topics`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `course_topic_coverage`;
DROP TABLE IF EXISTS `course_activity`;
DROP TABLE IF EXISTS `course_stats`;
DROP TABLE IF EXISTS `otp_requests`;
DROP TABLE IF EXISTS `professors`;
DROP TABLE IF EXISTS `semesters`;
DROP TABLE IF EXISTS `topics`;
DROP TABLE IF EXISTS `resource_types`;
DROP TABLE IF EXISTS `slots`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Lookup / dimension tables
-- ---------------------------------------------------------------------------

CREATE TABLE `users` (
    user_id     INT           NOT NULL AUTO_INCREMENT,
    username    VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL,
    role        ENUM('student','admin') NOT NULL DEFAULT 'student',
    is_verified TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT chk_users_email CHECK (email LIKE '%_@_%._%')
) ENGINE=InnoDB;

CREATE TABLE `courses` (
    course_id   INT           NOT NULL AUTO_INCREMENT,
    course_code VARCHAR(20)   NOT NULL,
    course_name VARCHAR(200)  NOT NULL,
    PRIMARY KEY (course_id),
    UNIQUE KEY uq_courses_code (course_code)
) ENGINE=InnoDB;

CREATE TABLE `slots` (
    slot_id   INT         NOT NULL AUTO_INCREMENT,
    slot_code VARCHAR(10) NOT NULL,
    PRIMARY KEY (slot_id),
    UNIQUE KEY uq_slots_code (slot_code)
) ENGINE=InnoDB;

CREATE TABLE `resource_types` (
    type_id   INT         NOT NULL AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (type_id),
    UNIQUE KEY uq_resource_types_name (type_name),
    CONSTRAINT chk_resource_types_name
        CHECK (type_name IN ('Notes','Question Bank','Cheatsheet','Lab Report','Solution'))
) ENGINE=InnoDB;

CREATE TABLE `topics` (
    topic_id   INT          NOT NULL AUTO_INCREMENT,
    topic_name VARCHAR(120) NOT NULL,
    PRIMARY KEY (topic_id),
    UNIQUE KEY uq_topics_name (topic_name)
) ENGINE=InnoDB;

CREATE TABLE `professors` (
    professor_id   INT          NOT NULL AUTO_INCREMENT,
    professor_name VARCHAR(120) NOT NULL,
    PRIMARY KEY (professor_id),
    UNIQUE KEY uq_professors_name (professor_name)
) ENGINE=InnoDB;

-- A semester is an (offering term, calendar year) pair — not two free strings.
CREATE TABLE `semesters` (
    semester_id   INT         NOT NULL AUTO_INCREMENT,
    semester_name VARCHAR(20) NOT NULL,
    year          CHAR(4)     NOT NULL,
    PRIMARY KEY (semester_id),
    UNIQUE KEY uq_semester_term (semester_name, year),
    CONSTRAINT chk_semester_name CHECK (semester_name IN ('Fall','Winter','Summer'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Core entity: resource (a shared study file)
-- ---------------------------------------------------------------------------

CREATE TABLE `resources` (
    resource_id   INT            NOT NULL AUTO_INCREMENT,
    title         VARCHAR(255)   NOT NULL,
    course_id     INT            NOT NULL,
    slot_id       INT            NOT NULL,
    type_id       INT            NOT NULL,
    author_id     INT            NOT NULL,
    professor_id  INT            NULL,
    semester_id   INT            NULL,
    quality_score DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    completeness  TINYINT UNSIGNED NOT NULL DEFAULT 50,
    upvotes       INT            NOT NULL DEFAULT 0,
    downloads     INT            NOT NULL DEFAULT 0,
    views         INT            NOT NULL DEFAULT 0,
    description   TEXT           NULL,
    pdf_url       VARCHAR(512)   NOT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id),
    KEY idx_resources_course (course_id),
    KEY idx_resources_slot (slot_id),
    KEY idx_resources_type (type_id),
    KEY idx_resources_author (author_id),
    KEY idx_resources_title (title),
    CONSTRAINT fk_resources_course     FOREIGN KEY (course_id)    REFERENCES courses(course_id),
    CONSTRAINT fk_resources_slot       FOREIGN KEY (slot_id)      REFERENCES slots(slot_id),
    CONSTRAINT fk_resources_type       FOREIGN KEY (type_id)      REFERENCES resource_types(type_id),
    CONSTRAINT fk_resources_author     FOREIGN KEY (author_id)    REFERENCES users(user_id),
    CONSTRAINT fk_resources_professor  FOREIGN KEY (professor_id) REFERENCES professors(professor_id),
    CONSTRAINT fk_resources_semester   FOREIGN KEY (semester_id)  REFERENCES semesters(semester_id),
    CONSTRAINT chk_resources_completeness CHECK (completeness BETWEEN 0 AND 100),
    CONSTRAINT chk_resources_quality      CHECK (quality_score BETWEEN 0 AND 100),
    CONSTRAINT chk_resources_counters     CHECK (upvotes >= 0 AND downloads >= 0 AND views >= 0)
) ENGINE=InnoDB;

-- Repeating group `Resource.topics[]` resolved to 1NF.
CREATE TABLE `resource_topics` (
    resource_id INT NOT NULL,
    topic_id    INT NOT NULL,
    PRIMARY KEY (resource_id, topic_id),
    KEY idx_resource_topics_topic (topic_id),
    CONSTRAINT fk_rt_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    CONSTRAINT fk_rt_topic    FOREIGN KEY (topic_id)    REFERENCES topics(topic_id)
) ENGINE=InnoDB;

-- Embedded `Resource.comments[]` promoted to its own weak entity.
CREATE TABLE `comments` (
    comment_id   INT          NOT NULL AUTO_INCREMENT,
    resource_id  INT          NOT NULL,
    author_id    INT          NOT NULL,
    comment_text TEXT         NOT NULL,
    upvotes      INT          NOT NULL DEFAULT 0,
    is_op        TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id),
    KEY idx_comments_resource (resource_id),
    KEY idx_comments_author (author_id),
    CONSTRAINT fk_comments_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author   FOREIGN KEY (author_id)   REFERENCES users(user_id),
    CONSTRAINT chk_comments_upvotes CHECK (upvotes >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Analytics: maintained per-course aggregates (derived data)
-- ---------------------------------------------------------------------------

CREATE TABLE `course_stats` (
    course_id       INT            NOT NULL,
    completeness    TINYINT UNSIGNED NOT NULL DEFAULT 0,
    quality_avg     DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    total_resources INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (course_id),
    CONSTRAINT fk_course_stats_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_course_stats_completeness CHECK (completeness BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- `CourseStats.topicCoverage[]` resolved to 1NF.
CREATE TABLE `course_topic_coverage` (
    course_id INT            NOT NULL,
    topic_id  INT            NOT NULL,
    coverage  TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (course_id, topic_id),
    KEY idx_ctc_topic (topic_id),
    CONSTRAINT fk_ctc_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT fk_ctc_topic  FOREIGN KEY (topic_id)  REFERENCES topics(topic_id),
    CONSTRAINT chk_ctc_coverage CHECK (coverage BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- `CourseStats.activityGrid[]` (364 daily intensities) resolved to 1NF.
CREATE TABLE `course_activity` (
    course_id     INT              NOT NULL,
    activity_date DATE             NOT NULL,
    intensity     TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (course_id, activity_date),
    CONSTRAINT fk_activity_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    CONSTRAINT chk_activity_intensity CHECK (intensity BETWEEN 0 AND 4)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Auth: one live OTP per email address
-- ---------------------------------------------------------------------------

CREATE TABLE `otp_requests` (
    email      VARCHAR(255) NOT NULL,
    otp_code   CHAR(6)      NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP    NOT NULL,
    PRIMARY KEY (email),
    CONSTRAINT chk_otp_code CHECK (otp_code REGEXP '^[0-9]{6}$')
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Convenience view used by the Analytics dashboard (demonstrates a VIEW)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW `v_course_overview` AS
SELECT
    c.course_id,
    c.course_code,
    c.course_name,
    COUNT(r.resource_id)        AS resource_count,
    ROUND(AVG(r.quality_score), 2) AS quality_avg,
    ROUND(AVG(r.completeness), 0)  AS completeness_avg
FROM courses c
LEFT JOIN resources r ON r.course_id = c.course_id
GROUP BY c.course_id, c.course_code, c.course_name;
