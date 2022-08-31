DROP TABLE IF EXISTS `interval_msg`;
CREATE TABLE `interval_msg` (
  `id` int NOT NULL,
  `b_mon` tinyint DEFAULT NULL,
  `b_week` tinyint DEFAULT NULL,
  `b_day` tinyint DEFAULT NULL,
  `month` int DEFAULT NULL,
  `week` int DEFAULT NULL,
  `day` int DEFAULT NULL,
  `hour` int DEFAULT NULL,
  `minute` int DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `message` varchar(100) DEFAULT NULL,
  `done` tinyint DEFAULT NULL,
  `week_number` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_ja_0900_as_cs;

DROP TABLE IF EXISTS `reply_msg`;
CREATE TABLE `reply_msg` (
  `id` int NOT NULL,
  `req` varchar(100) NOT NULL,
  `res` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_ja_0900_as_cs;;

