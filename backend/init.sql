-- Purani tables hatakar fresh start
DROP TABLE IF EXISTS salary_ledger;
DROP TABLE IF EXISTS ping_logs;
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS wards;

-- 1. Wards Table (Boundary points)
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    radius_meters INT DEFAULT 1000
);

-- 2. Employees Table (The Core)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ward_id INT REFERENCES wards(id),
    integrity_score DECIMAL(5,2) DEFAULT 100.00,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    attendance_count INT DEFAULT 0,
    is_ping_active BOOLEAN DEFAULT FALSE,
    base_salary DECIMAL(10, 2) DEFAULT 25000.00,
    current_otp VARCHAR(6) DEFAULT NULL
);

-- 3. Attendance Logs (Verification Ledger)
CREATE TABLE attendance_logs (
    id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES employees(id),
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    status VARCHAR(20), -- 'SUCCESS' / 'BLOCKED'
    face_match_score DECIMAL(5, 2),
    fail_reason TEXT
);

-- 4. Random Ping Logs
CREATE TABLE ping_logs (
    id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES employees(id),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- 5. Salary Ledger (Finance)
CREATE TABLE salary_ledger (
    id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES employees(id),
    amount DECIMAL(10, 2),
    month_year VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ
);

-- Dummy Data for MCD
INSERT INTO wards (ward_name, lat, lng, radius_meters) VALUES 
('Ward 54 - Rohini', 28.7041, 77.1025, 1000),
('Ward 12 - Lajpat Nagar', 28.5677, 77.2433, 800);

INSERT INTO employees (name, ward_id, phone_number, base_salary) VALUES 
('Rajesh Kumar', 1, '9876543210', 28500.00),
('Sunita Devi', 2, '9988776655', 32000.00);