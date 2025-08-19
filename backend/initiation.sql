-- Membuat tabel users
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255),
  alamat TEXT,
  tiket VARCHAR(255),
  tps INTEGER,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menyisipkan data ke dalam tabel users
INSERT INTO "users" (id, nama, alamat, tiket, tps, "role",  "createdAt", "updatedAt") 
VALUES
('a86e1b44-a49c-4e69-812f-d1b849760018', 'John Doe', '123 Main St, Springfield, IL', '$2b$12$QCF4ecMKW8bsnUj2zO7qOuCzV9QjabNWJf6tdvrr.4E7O4HISNBzS', 1, "voter", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6b68295b-e2a4-4313-9b61-1c2b2922aa19', 'Jane Smith', '456 Oak St, Springfield, IL', '$2b$12$3DvTHic.ER73tRMK2k4hmOm6nMIstyMCNZG3dP0f3dlElHkbA8kJu', 1, "voter", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d1623ada-a545-4249-bdc3-c9e0bd11dfe0', 'Alice Johnson', '789 Pine St, Springfield, IL', '$2b$12$MYAAzTtonIl7iKATxuekMulXi1fOfuf8crmRuLyJbd0AqGJ0N8vt.', 1, "voter", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('95eee59f-db16-4ebc-8af5-2e81d4676695', 'Bob Brown', '101 Maple St, Springfield, IL', '$2b$12$Gxd34t9BE6bu340UnDMRdOu7CfYnYZuMkqmSPzVekHZel6VKc73Vu', 1, "voter", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('51f04eb7-0947-4344-b2c8-21651684695b', 'Charlie Green', '202 Birch St, Springfield, IL', '$2b$12$PqFUcXB4OjrnUy5Yb0P4purGjA.4NeO4X.HPdLDr5X4G8a07q5ZUm', 1, "voter", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- TICKET123, 456, 789, 101, 102
-- Membuat tabel candidates
CREATE TABLE IF NOT EXISTS "candidates" (
  "candidateNumber" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  party VARCHAR(255),
  description TEXT,
  photoUrl TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menyisipkan data ke dalam tabel candidates
INSERT INTO "candidates" ("candidateNumber", name, party, description, photoUrl, "createdAt", "updatedAt") VALUES
('3e4d0d91-1b75-4a2c-97a0-87cfdad10b3a', 'John Doe', 'Party A', 'Experienced candidate with a passion for reform.', '/assets/calon-1.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7f64bde3-9334-4b12-a9d1-5096d270f630', 'Jane Smith', 'Party B', 'Dedicated to improving education and healthcare.', '/assets/calon-2.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2cfa146-fb2e-4a3a-8c61-e02438e1c6e2', 'Alice Johnson', 'Party C', 'Focused on technology and innovation.', '/assets/calon-3.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
