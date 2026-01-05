-- 1. CLEANUP: Purani tables hatakar fresh start

DROP TABLE IF EXISTS salary_ledger CASCADE;
DROP TABLE IF EXISTS ping_logs CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;


-- 2. WARDS TABLE: Digital Geofencing Boundaries

CREATE TABLE wards (
    id             SERIAL PRIMARY KEY,
    ward_name      VARCHAR(100) NOT NULL,
    lat            DECIMAL(10, 8) NOT NULL,
    lng            DECIMAL(11, 8) NOT NULL,
    radius_meters  INT DEFAULT 1000
);


-- 3. EMPLOYEES TABLE: Global Personnel Registry

CREATE TABLE employees (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(50) DEFAULT 'worker', -- roles: 'admin', 'zonal', 'supervisor', 'worker'
    ward_id         INT REFERENCES wards(id) ON DELETE SET NULL,
    integrity_score DECIMAL(5,2) DEFAULT 100.00,
    phone_number    VARCHAR(15) UNIQUE NOT NULL,
    attendance_count INT DEFAULT 0,
    is_ping_active  BOOLEAN DEFAULT FALSE,
    base_salary     DECIMAL(10, 2) DEFAULT 25000.00,
    current_otp     VARCHAR(6) DEFAULT NULL,
    last_login      TIMESTAMPTZ DEFAULT NOW(),
    device_id       VARCHAR(255) DEFAULT NULL,
    joined_at       DATE DEFAULT CURRENT_DATE, -- NEW: Track joining date
    last_transfer_date DATE DEFAULT CURRENT_DATE -- NEW: Track last rotation
);


-- 4. ATTENDANCE LOGS: Immutable Security Ledger

CREATE TABLE attendance_logs (
    id               SERIAL PRIMARY KEY,
    emp_id           INT REFERENCES employees(id) ON DELETE CASCADE,
    check_in_time    TIMESTAMPTZ DEFAULT NOW(),
    lat              DECIMAL(10, 8),
    lng              DECIMAL(11, 8),
    status           VARCHAR(20), -- 'SUCCESS' / 'BLOCKED'
    face_match_score DECIMAL(5, 2),
    fail_reason      TEXT
);


-- 5. PING LOGS: Random Presence Verification

CREATE TABLE ping_logs (
    id            SERIAL PRIMARY KEY,
    emp_id        INT REFERENCES employees(id) ON DELETE CASCADE,
    sent_at       TIMESTAMPTZ DEFAULT NOW(),
    responded_at  TIMESTAMPTZ,
    status        VARCHAR(20) DEFAULT 'PENDING' -- 'PENDING', 'SUCCESS', 'FAILED'
);


-- 6. SALARY LEDGER: Financial Integrity Hub

CREATE TABLE salary_ledger (
    id           SERIAL PRIMARY KEY,
    emp_id       INT REFERENCES employees(id) ON DELETE CASCADE,
    amount       DECIMAL(10, 2),
    month_year   VARCHAR(20), -- e.g., 'Jan-2026'
    status       VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED'
    verified_at  TIMESTAMPTZ
);


-- 7. AUDIT LOGS: System Wide Security & Hash Logs

CREATE TABLE audit_logs (
    id           SERIAL PRIMARY KEY,
    action_type  VARCHAR(50),
    record_id    INT,
    payload      TEXT,
    sha256_hash  TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- 🚀 SEED DATA: Inserting High-Value Test Data for Hackathon Demo


-- Insert Wards (Coordinates centered around Delhi/Rohini)

INSERT INTO wards (ward_name, lat, lng, radius_meters) VALUES
    ('Ward 54 - Rohini Sector 7', 28.7041, 77.1025, 1200),
    ('Ward 12 - Lajpat Nagar',   28.5677, 77.2433, 800),
    ('Ward 05 - Civil Lines',    28.6814, 77.2227, 1000);


-- Insert Employees (Ensuring ID 1 is the Worker for your Dashboard)
-- Admin (Commissioner)

INSERT INTO employees (name, role, ward_id, phone_number, base_salary, integrity_score) VALUES
    ('Vikas Kumar (IAS)', 'admin', 3, '9000000001', 180000.00, 100.00);


-- Worker (Rajesh Kumar - Targeted by Frontend)

INSERT INTO employees (id, name, role, ward_id, phone_number, base_salary, integrity_score) VALUES
    (1, 'Rajesh Kumar', 'worker', 1, '9876543210', 28500.00, 8.50)
ON CONFLICT (id)
DO UPDATE
SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;


-- Supervisor

INSERT INTO employees (name, role, ward_id, phone_number, base_salary, integrity_score) VALUES
    ('Amit Sharma', 'supervisor', 1, '9988776655', 45000.00, 92.40);


-- Extra Workers for Dashboard Analytics

INSERT INTO employees (name, role, ward_id, phone_number, base_salary, integrity_score) VALUES
    ('Sunita Devi', 'worker', 2, '8888877777', 32000.00, 85.00), -- Critical Alert (Below 90)
    ('Ramesh Singh', 'worker', 1, '7777766666', 29000.00, 58.10);


-- Seed a Pending Salary for Rajesh (ID 1) to test OTP verification

INSERT INTO salary_ledger (emp_id, amount, month_year, status) VALUES
    (1, 28500.00, 'Jan-2026', 'PENDING');


-- Seed some historical logs for Analytics Charts

INSERT INTO attendance_logs (emp_id, status, face_match_score) VALUES
    (1, 'SUCCESS', 0.98),
    (4, 'SUCCESS', 0.95);



-- Set an active OTP for Rajesh (Testing purposes)

UPDATE employees
SET current_otp = '123456'
WHERE id = 1;


-- 🔄 SIMULATION: Set old transfer dates for ID 1 and 5 to test rotation logic
UPDATE employees 
SET last_transfer_date = '2022-01-01' 
WHERE id IN (1, 5);

INSERT INTO employees (name, role, ward_id, phone_number, base_salary, integrity_score, last_transfer_date) 
VALUES ('Super Admin Commissioner', 'admin', 1, '1234567890', 250000.00, 100.00, CURRENT_DATE);