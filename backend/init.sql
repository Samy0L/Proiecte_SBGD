CREATE DATABASE IF NOT EXISTS biblioteca_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca_app;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  pass VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  status VARCHAR(32) NOT NULL,
  facultate VARCHAR(160) NOT NULL DEFAULT '',
  dataInreg DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS carti (
  id VARCHAR(64) PRIMARY KEY,
  titlu VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  editura VARCHAR(255) NOT NULL,
  an INT NOT NULL,
  isbn VARCHAR(64) NOT NULL,
  pagini INT NOT NULL,
  gen VARCHAR(120) NOT NULL,
  coperta VARCHAR(120) NOT NULL,
  limba VARCHAR(120) NOT NULL,
  exemplare INT NOT NULL,
  disponibile INT NOT NULL
);

CREATE TABLE IF NOT EXISTS imprumuturi (
  id VARCHAR(64) PRIMARY KEY,
  carteId VARCHAR(64) NOT NULL,
  studentId VARCHAR(64) NOT NULL,
  dataImprumut DATE NOT NULL,
  termen DATE NOT NULL,
  status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS extinderi (
  id VARCHAR(64) PRIMARY KEY,
  studentId VARCHAR(64) NOT NULL,
  carteId VARCHAR(64) NOT NULL,
  imprumutId VARCHAR(64) NOT NULL,
  motiv TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  data DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id VARCHAR(64) PRIMARY KEY,
  data VARCHAR(32) NOT NULL,
  tip VARCHAR(64) NOT NULL,
  `desc` TEXT NOT NULL,
  user VARCHAR(64) NOT NULL
);

INSERT IGNORE INTO users (id, pass, role, name, email, status, facultate, dataInreg) VALUES
('admin01', '1234', 'bibliotecar', 'Maria Ionescu', 'admin@biblioteca.ro', 'activ', '', '2024-01-01'),
('student01', 'pass', 'student', 'Andrei Munteanu', 'andrei.m@univ.ro', 'activ', 'Litere', '2024-09-01'),
('student02', 'pass', 'student', 'Elena Dumitrescu', 'elena.d@univ.ro', 'activ', 'Drept', '2024-09-05');
