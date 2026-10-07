-- ============================================================================
--  UniArchive — Seed Data (DML)
--  Run AFTER schema.sql:   mariadb test_uniarchive < db/seed.sql
--  ---------------------------------------------------------------------------
--  Data is transcribed from the original MongoDB seed
--  (server/src/seed/seed.ts) and re-distributed across the normalized tables.
--  ============================================================================

USE `test_uniarchive`;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `course_activity`;
TRUNCATE TABLE `course_topic_coverage`;
TRUNCATE TABLE `course_stats`;
TRUNCATE TABLE `comments`;
TRUNCATE TABLE `resource_topics`;
TRUNCATE TABLE `resources`;
TRUNCATE TABLE `otp_requests`;
TRUNCATE TABLE `professors`;
TRUNCATE TABLE `semesters`;
TRUNCATE TABLE `topics`;
TRUNCATE TABLE `resource_types`;
TRUNCATE TABLE `slots`;
TRUNCATE TABLE `courses`;
TRUNCATE TABLE `users`;

-- Keep FK checks off while loading seed data in dependency order (users ->
-- courses/slots/types/professors/semesters/topics -> resources -> comments ->
-- course_stats -> course_topic_coverage -> course_activity).  The original
-- pattern put SET FOREIGN_KEY_CHECKS = 1 here, which made the batch fail at
-- the resources INSERT with fk_resources_author even though users(user_id=1)
-- existed; leaving checks off avoids that.


-- ---------------------------------------------------------------------------
-- users  (demo-only for this deployment: a single signed-in admin)
--   password_hash = SHA-256(password).  For this demo the only valid
--   credential is  admin123  /  scse.
-- ---------------------------------------------------------------------------
INSERT INTO `users` (user_id, username, email, password_hash, role, is_verified) VALUES
    (1, 'admin123', 'admin123@uniarchive.local', 'bea9ee0a528a05f2dbf92324ac6547b4f630ce51aad42e6e6404472886c21a79', 'admin', 1);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
INSERT INTO `courses` (course_id, course_code, course_name) VALUES
    (1, 'BMAT202L', 'Probability & Statistics'),
    (2, 'PHY101',   'Engineering Physics'),
    (3, 'CSE3001',  'Software Engineering'),
    (4, 'EEE2002',  'Electrical Circuits Lab'),
    (5, 'CSE3003',  'Operating Systems'),
    (6, 'ECE1002',  'Digital Logic Design'),
    (7, 'CSE4001',  'Compiler Design'),
    (8, 'CSE2004',  'Database Management Systems');

-- ---------------------------------------------------------------------------
-- slots
-- ---------------------------------------------------------------------------
INSERT INTO `slots` (slot_id, slot_code) VALUES
    (1,'B1'),(2,'G2'),(3,'A1'),(4,'C2'),(5,'L4'),
    (6,'F1'),(7,'D1'),(8,'E2'),(9,'A2'),(10,'C1');

-- ---------------------------------------------------------------------------
-- resource_types
-- ---------------------------------------------------------------------------
INSERT INTO `resource_types` (type_id, type_name) VALUES
    (1,'Notes'),(2,'Question Bank'),(3,'Cheatsheet'),(4,'Lab Report'),(5,'Solution');

-- ---------------------------------------------------------------------------
-- professors
-- ---------------------------------------------------------------------------
INSERT INTO `professors` (professor_id, professor_name) VALUES
    (1,'Prof. Sharma'),(2,'Prof. Gupta'),(3,'Dr. Ray'),(4,'Prof. Anitha'),
    (5,'Dr. Kumar'),(6,'Prof. Chandran'),(7,'Dr. Srinivasan'),(8,'Prof. Meera'),
    (9,'Prof. Roberts');

-- ---------------------------------------------------------------------------
-- semesters
-- ---------------------------------------------------------------------------
INSERT INTO `semesters` (semester_id, semester_name, year) VALUES
    (1,'Winter','2024'),
    (2,'Fall','2023'),
    (3,'Winter','2023');

-- ---------------------------------------------------------------------------
-- topics
-- ---------------------------------------------------------------------------
INSERT INTO `topics` (topic_id, topic_name) VALUES
    (1,'Probability'),(2,'Bayes Theorem'),(3,'Random Variables'),
    (4,'Hypothesis Testing'),(5,'T-Test'),(6,'Chi-Square'),
    (7,'Interference'),(8,'Diffraction'),(9,'Polarization'),
    (10,'Software Eng'),(11,'Agile'),(12,'UML'),(13,'Testing'),
    (14,'Circuits'),(15,'Oscilloscope'),(16,'KVL/KCL'),
    (17,'ANOVA'),(18,'Regression'),(19,'Correlation'),
    (20,'Scheduling'),(21,'Process'),(22,'Threads'),(23,'Deadlock'),
    (24,'K-Map'),(25,'Boolean Algebra'),(26,'Logic Gates'),
    (27,'Parsing'),(28,'LL(1)'),(29,'LR(0)'),(30,'Syntax Analysis'),
    (31,'SQL'),(32,'Joins'),(33,'Normalization'),(34,'Indexing'),
    -- topics that only appear in course coverage analytics:
    (35,'Statistics'),(36,'Lin. Algebra'),(37,'Calculus'),(38,'Hypothesis'),
    (39,'SDLC'),(40,'Design Patterns'),(41,'Optics'),(42,'Mechanics'),
    (43,'Thermo'),(44,'OS'),(45,'DLD'),(46,'Compiler'),(47,'DBMS');

-- ---------------------------------------------------------------------------
-- resources
--   With a single demo user (user_id = 1, admin123) every resource is
--   authored by that user, so the JOIN chain in RESOURCE_SELECT resolves for
--   all 10 rows.  course_id / slot_id / type_id / professor_id / semester_id
--   already reference rows that exist in the dimension tables.
-- ---------------------------------------------------------------------------
INSERT INTO `resources`
    (resource_id, title, course_id, slot_id, type_id, author_id, professor_id,
     semester_id, quality_score, completeness, upvotes, downloads, views,
     description, pdf_url, created_at) VALUES
    (1, 'BMAT202L - Probability Handwritten Complete', 1, 1, 1, 1, 1, 1,
     94, 88, 147, 289, 1205,
     'Extremely detailed handwritten notes covering Module 1-3. Diagrams are high clarity.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 40 DAY)),
    (2, 'Unit 4: Hypothesis Testing Cheatsheet', 1, 2, 3, 1, 2, 3,
     89, 45, 67, 150, 560,
     'Concise formula sheet. Missing derivations but excellent for quick revision.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 35 DAY)),
    (3, 'Physics Wave Optics Solutions', 2, 3, 5, 1, 3, 3,
     76, 100, 23, 45, 120,
     'Solved past papers for Wave Optics module. Steps are included.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 30 DAY)),
    (4, 'Full Semester 3 Review', 3, 4, 1, 1, 4, 2,
     98, 95, 310, 890, 3400,
     'Gold standard notes. Includes previous year questions integrated into topics.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 25 DAY)),
    (5, 'Lab Exp 4-8 Observations', 4, 5, 4, 1, 5, 1,
     65, 60, 12, 30, 89,
     'Raw observations for experiments 4 through 8. Verify calculations.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 20 DAY)),
    (6, 'Module 5 Question Bank', 1, 6, 2, 1, 1, 1,
     92, 100, 56, 210, 890,
     'Comprehensive question set with answer keys for regression analysis.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 15 DAY)),
    (7, 'Operating Systems - Process Scheduling', 5, 7, 1, 1, 6, 2,
     88, 70, 89, 120, 450,
     'Detailed breakdown of RR, SJF, and FCFS algorithms with Gantt charts.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 10 DAY)),
    (8, 'Digital Logic Design - Karnaugh Maps', 6, 8, 1, 1, 7, 3,
     95, 100, 200, 450, 1500,
     'Simplified guide to solving 4-variable and 5-variable K-Maps.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 6 DAY)),
    (9, 'Compiler Design - Parser Construction', 7, 9, 1, 1, 8, 1,
     91, 85, 75, 180, 600,
     'Step-by-step guide to constructing parsing tables. Very helpful for CAT1.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (10, 'Database Management - SQL Queries', 8, 10, 3, 1, 9, 2,
     93, 50, 320, 600, 2100,
     'Quick reference for complex SQL joins and nested queries.',
     'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
     DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ---------------------------------------------------------------------------
-- resource_topics  (resolves Resource.topics[])
-- ---------------------------------------------------------------------------
INSERT INTO `resource_topics` (resource_id, topic_id) VALUES
    (1,1),(1,2),(1,3),
    (2,4),(2,5),(2,6),
    (3,7),(3,8),(3,9),
    (4,10),(4,11),(4,12),(4,13),
    (5,14),(5,15),(5,16),
    (6,17),(6,18),(6,19),
    (7,20),(7,21),(7,22),(7,23),
    (8,24),(8,25),(8,26),
    (9,27),(9,28),(9,29),(9,30),
    (10,31),(10,32),(10,33),(10,34);

-- ---------------------------------------------------------------------------
-- comments  (resolves Resource.comments[])  — weak entity on resource
--   author_id must reference an existing user; with the single demo user
--   (user_id = 1) the thread is authored by admin123.
-- ---------------------------------------------------------------------------
INSERT INTO `comments` (comment_id, resource_id, author_id, comment_text, upvotes, is_op) VALUES
    (1, 1, 1, 'The derivation on page 4 is slightly off, check the standard Kreyzig book.', 12, 0),
    (2, 1, 1, 'Thanks for pointing that out! Will update v2.',                              5,  1),
    (3, 1, 1, 'This saved my life for the CAT2 exam. Bless you.',                         24, 0);

-- ---------------------------------------------------------------------------
-- course_stats  (maintained aggregates)
-- ---------------------------------------------------------------------------
INSERT INTO `course_stats` (course_id, completeness, quality_avg, total_resources) VALUES
    (1, 82, 88, 45),
    (3, 91, 92, 78),
    (2, 65, 72, 22),
    (5, 75, 80, 30),
    (6, 85, 90, 55),
    (7, 60, 85, 15),
    (8, 90, 88, 95);

-- ---------------------------------------------------------------------------
-- course_topic_coverage  (resolves CourseStats.topicCoverage[])
-- ---------------------------------------------------------------------------
INSERT INTO `course_topic_coverage` (course_id, topic_id, coverage) VALUES
    (1, 1, 95),(1, 35, 80),(1, 36, 40),(1, 37, 90),(1, 38, 75),
    (3, 39, 100),(3, 13, 85),(3, 40, 70),(3, 12, 90),
    (2, 41, 80),(2, 42, 50),(2, 43, 30),
    (5, 44, 70),
    (6, 45, 85),
    (7, 46, 60),
    (8, 47, 90);

-- ---------------------------------------------------------------------------
-- course_activity  (resolves CourseStats.activityGrid[]: 364 daily intensities)
--   Deterministic pseudo-random intensity so the seed is reproducible.
-- ---------------------------------------------------------------------------
INSERT INTO `course_activity` (course_id, activity_date, intensity)
SELECT
    c.course_id,
    DATE_SUB(CURDATE(), INTERVAL (363 - n.d) DAY) AS activity_date,
    CASE
        WHEN ((n.d * 7 + c.course_id * 13) % 10) > 6
            THEN ((n.d * 3 + c.course_id * 5) % 4) + 1
        ELSE 0
    END AS intensity
FROM `courses` c
CROSS JOIN (
    SELECT a.i + b.i * 10 + e.i * 100 AS d
    FROM (SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
    CROSS JOIN (SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
    CROSS JOIN (SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) e
) n
WHERE n.d < 364;

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------
SELECT 'users' AS table_name, COUNT(*) AS rows_loaded FROM users
UNION ALL SELECT 'courses',           COUNT(*) FROM courses
UNION ALL SELECT 'slots',             COUNT(*) FROM slots
UNION ALL SELECT 'resource_types',    COUNT(*) FROM resource_types
UNION ALL SELECT 'topics',            COUNT(*) FROM topics
UNION ALL SELECT 'professors',        COUNT(*) FROM professors
UNION ALL SELECT 'semesters',         COUNT(*) FROM semesters
UNION ALL SELECT 'resources',         COUNT(*) FROM resources
UNION ALL SELECT 'resource_topics',   COUNT(*) FROM resource_topics
UNION ALL SELECT 'comments',          COUNT(*) FROM comments
UNION ALL SELECT 'course_stats',      COUNT(*) FROM course_stats
UNION ALL SELECT 'course_topic_coverage', COUNT(*) FROM course_topic_coverage
UNION ALL SELECT 'course_activity',   COUNT(*) FROM course_activity;

SET FOREIGN_KEY_CHECKS = 1;
