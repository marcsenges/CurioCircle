-- Additive, repeatable initial schema; never drop existing data.
CREATE TABLE IF NOT EXISTS cc_question (
  id INTEGER PRIMARY KEY, category INTEGER NOT NULL CHECK(category BETWEEN 0 AND 5)
);
CREATE TABLE IF NOT EXISTS cc_vote (
  question_id INTEGER NOT NULL REFERENCES cc_question(id),
  receipt_hash TEXT NOT NULL CHECK(length(receipt_hash)=64),
  revision INTEGER NOT NULL CHECK(revision>=1),
  vote INTEGER CHECK(vote IN (-1,1)),
  language TEXT NOT NULL CHECK(language IN ('de','en','es','fr','pt','it')),
  app_version TEXT NOT NULL CHECK(length(app_version)<=32),
  updated_day TEXT NOT NULL,
  PRIMARY KEY(question_id,receipt_hash)
);
CREATE INDEX IF NOT EXISTS cc_vote_question_language ON cc_vote(question_id,language,vote);
CREATE TABLE IF NOT EXISTS cc_suggestion (
  receipt_hash TEXT PRIMARY KEY CHECK(length(receipt_hash)=64),
  text TEXT NOT NULL CHECK(length(text) BETWEEN 12 AND 240),
  language TEXT NOT NULL CHECK(language IN ('de','en','es','fr','pt','it')),
  text_hash TEXT NOT NULL UNIQUE CHECK(length(text_hash)=64),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  submitted_day TEXT NOT NULL,
  reviewed_day TEXT
);
CREATE INDEX IF NOT EXISTS cc_suggestion_status ON cc_suggestion(status,submitted_day);
CREATE TABLE IF NOT EXISTS cc_rate (
  bucket TEXT PRIMARY KEY, count INTEGER NOT NULL CHECK(count>=0)
);

CREATE TABLE IF NOT EXISTS cc_feedback (
  receipt_hash TEXT PRIMARY KEY CHECK(length(receipt_hash)=64),
  text TEXT NOT NULL CHECK(length(text) BETWEEN 5 AND 1000),
  language TEXT NOT NULL CHECK(language IN ('de','en','es','fr','pt','it')),
  app_version TEXT NOT NULL CHECK(length(app_version)<=32),
  submitted_day TEXT NOT NULL
);
