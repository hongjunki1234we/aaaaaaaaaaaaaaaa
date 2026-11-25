CREATE DATABASE IF NOT EXISTS hanil_tracker
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE hanil_tracker;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  target_exam ENUM('JLPT_N2', 'TOEIC', 'BOTH') NOT NULL DEFAULT 'BOTH',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS study_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_type ENUM('JLPT_N2', 'TOEIC') NOT NULL,
  category ENUM('VOCAB', 'GRAMMAR', 'WRONG_ANSWER') NOT NULL,
  term_or_question VARCHAR(255) NOT NULL,
  meaning_or_answer VARCHAR(255) NOT NULL,
  mistake_note TEXT,
  review_count INT NOT NULL DEFAULT 0,
  mastery_status ENUM('LEARNING', 'REVIEWING', 'MASTERED') NOT NULL DEFAULT 'LEARNING',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_study_logs_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trips (
  trip_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_jpy INT NOT NULL DEFAULT 0,
  exchange_rate_krw DECIMAL(8, 2) NOT NULL DEFAULT 9.00,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trips_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trip_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  item_type ENUM('SCHEDULE', 'EXPENSE', 'SPOT') NOT NULL,
  title VARCHAR(150) NOT NULL,
  location_name VARCHAR(150),
  visit_date DATE,
  amount_jpy INT NOT NULL DEFAULT 0,
  category ENUM('FOOD', 'TRANSIT', 'STAY', 'GOODS', 'OTHER') NOT NULL DEFAULT 'OTHER',
  is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trip_items_trip
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS culture_tips (
  tip_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  region_or_topic VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_culture_tips_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (username, target_exam) VALUES
  ('learner_kr', 'BOTH');

INSERT INTO study_logs (user_id, exam_type, category, term_or_question, meaning_or_answer, mistake_note, review_count, mastery_status) VALUES
  (1, 'JLPT_N2', 'VOCAB', '〜にわたって', '〜에 걸쳐, 〜동안 내내', '기간이나 범위가 넓을 때 쓰이는 표현 복습', 2, 'REVIEWING'),
  (1, 'TOEIC', 'WRONG_ANSWER', 'Part 5 시제/수일치 함정 문제', '복수 주어와 전치사구 수식 구분', '주어 뒤 수식어구를 괄호로 묶고 동사 수 확인하기', 1, 'LEARNING');

INSERT INTO trips (user_id, city_name, start_date, end_date, budget_jpy, exchange_rate_krw, memo) VALUES
  (1, '후쿠오카', '2026-12-18', '2026-12-20', 50000, 9.10, '하카타·무로미 중심 2박 3일 기록');

INSERT INTO trip_items (trip_id, item_type, title, location_name, visit_date, amount_jpy, category, is_recommended, note) VALUES
  (1, 'EXPENSE', '지하철 이동', '하카타역 - 무로미역', '2026-12-18', 600, 'TRANSIT', TRUE, 'IC카드 충전 및 노선 확인'),
  (1, 'SPOT', '야키토리 저녁 식사', '후쿠오카 시내', '2026-12-18', 3800, 'FOOD', TRUE, '분위기 좋고 메뉴 구성 만족');

INSERT INTO culture_tips (user_id, region_or_topic, title, content, helpful_count) VALUES
  (1, 'JLPT N2 독해', '시간 배분 및 지문 근거 찾기 요령', '긴 지문보다 짧은 지문과 접속사 흐름을 먼저 정확히 잡는 것이 안정적입니다.', 3);
