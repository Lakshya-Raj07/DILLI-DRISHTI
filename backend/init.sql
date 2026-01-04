-- 1. CLEANUP: Purani tables hatakar fresh start
DROP TABLE IF EXISTS salary_ledger CASCADE;
DROP TABLE IF EXISTS ping_logs CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS wards CASCADE;

-- 2. WARDS TABLE: Digital Geofencing Boundaries
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    radius_meters INT DEFAULT 1000
);

-- 3. EMPLOYEES TABLE: Global Personnel Registry
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'worker', -- roles: 'admin', 'zonal', 'supervisor', 'worker'
    ward_id INT REFERENCES wards(id) ON DELETE SET NULL,
    integrity_score DECIMAL(5,2) DEFAULT 100.00,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    attendance_count INT DEFAULT 0,
    is_ping_active BOOLEAN DEFAULT FALSE,
    base_salary DECIMAL(10, 2) DEFAULT 25000.00,
    current_otp VARCHAR(6) DEFAULT NULL,
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ATTENDANCE LOGS: Immutable Security Ledger
CREATE TABLE attendance_logs (
    id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES employees(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    status VARCHAR(20), -- 'SUCCESS' / 'BLOCKED'
    face_match_score DECIMAL(5, 2),
    fail_reason TEXT
);

-- 5. PING LOGS: Random Presence Verification
CREATE TABLE ping_logs (
    id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES employees(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING' -- 'PENDING', 'SUCCESS', 'FAILED'
);

-- 6. SALARY LEDGER: Financial Integrity Hub
CREATE TABLE salary_ledger (
    id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2),
    month_year VARCHAR(20), -- e.g., 'Jan-2026'
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED'
    verified_at TIMESTAMPTZ
);

-- 🚀 SEED DATA: Inserting High-Value Test Data for Hackathon Demo

INSERT INTO wards (ward_name, lat, lng, radius_meters) VALUES 
('Ward 54 - Rohini Sector 7', 28.7041, 77.1025, 1200),
('Ward 12 - Lajpat Nagar', 28.5677, 77.2433, 800),
('Ward 05 - Civil Lines', 28.6814, 77.2227, 1000),
('Ward 22 - Dwarka Ph-1', 28.5823, 77.0500, 1500),
('Ward 09 - Karol Bagh', 28.6550, 77.1888, 900),
('Ward 41 - Pitampura', 28.7033, 77.1323, 1100),
('Ward 102 - Narela', 28.8427, 77.0911, 2000),
('Ward 88 - Hauz Khas', 28.5494, 77.2001, 1000),
('Ward 33 - Chandni Chowk', 28.6506, 77.2300, 700),
('Ward 67 - Janakpuri', 28.6219, 77.0878, 1200);

-- Insert Admin & Supervisors
INSERT INTO employees (name, role, ward_id, phone_number, base_salary, integrity_score) VALUES 
('Vikas Kumar (IAS)', 'admin', 3, '9000000001', 185000.00, 100.00),
('Amit Sharma', 'supervisor', 1, '9988776655', 48000.00, 94.50),
('Meena Kumari', 'supervisor', 2, '9988776644', 48000.00, 91.20),
('Sanjay Tyagi', 'supervisor', 5, '9988776633', 48000.00, 89.00);

-- Insert Workers (Ensuring ID 1 is Rajesh Kumar)
INSERT INTO employees (id, name, role, ward_id, phone_number, base_salary, integrity_score, attendance_count) VALUES 
(1, 'Rajesh Kumar', 'worker', 1, '9876543210', 28500.00, 98.50, 24);

-- Batch Insert More Workers with varying Integrity Scores (to show Red/Green in Dashboard)
INSERT INTO employees (name, role, ward_id, phone_number, base_salary, integrity_score, attendance_count, is_ping_active) VALUES 
('Sunita Devi', 'worker', 2, '8888877777', 32000.00, 84.50, 15, FALSE), -- ALERT (Low Score)
('Ramesh Singh', 'worker', 1, '7777766666', 29000.00, 99.10, 26, TRUE),  -- ACTIVE PING
('Anil Kapoor', 'worker', 4, '6666655555', 27500.00, 92.00, 10, FALSE),
('Pooja Verma', 'worker', 5, '5555544444', 31000.00, 97.40, 22, FALSE),
('Suresh Raina', 'worker', 6, '4444433333', 28000.00, 72.30, 5, FALSE),  -- CRITICAL ALERT
('Deepak Chahar', 'worker', 7, '3333322222', 30500.00, 95.80, 20, TRUE),  -- ACTIVE PING
('Kavita Rani', 'worker', 8, '2222211111', 29500.00, 88.90, 12, FALSE), -- ALERT
('Mohit Sharma', 'worker', 9, '1111100000', 33000.00, 91.50, 18, FALSE),
('Rahul Dravid', 'worker', 10, '1234512345', 28000.00, 100.00, 30, FALSE),
('Sourav Ganguly', 'worker', 1, '5432154321', 28000.00, 96.00, 28, FALSE),
('VVS Laxman', 'worker', 2, '9898989898', 28000.00, 94.20, 25, FALSE),
('Yuvraj Singh', 'worker', 3, '8787878787', 35000.00, 81.00, 14, FALSE), -- ALERT
('Harbhajan Singh', 'worker', 4, '7676767676', 28000.00, 92.50, 21, FALSE),
('Zaheer Khan', 'worker', 5, '6565656565', 30000.00, 98.80, 27, FALSE),
('Ishant Sharma', 'worker', 6, '5454545454', 28000.00, 65.00, 2, FALSE); -- CRITICAL ALERT

-- 7. SEED ATTENDANCE LOGS: Showing History and Violations
INSERT INTO attendance_logs (emp_id, lat, lng, status, face_match_score, fail_reason) VALUES 
(1, 28.7041, 77.1025, 'SUCCESS', 0.98, 'Verified'),
(5, 28.5677, 77.2433, 'SUCCESS', 0.95, 'Verified'),
(6, 28.7041, 77.1025, 'SUCCESS', 0.92, 'Verified'),
(7, 28.9000, 77.5000, 'BLOCKED', 0.95, 'Outside Geofence'), -- Violation Example
(10, 28.7033, 77.1323, 'BLOCKED', 0.40, 'Face Mismatch'); -- Fraud Example

-- 8. SEED PENDING SALARIES: To show "Authorize Pay" feature
INSERT INTO salary_ledger (emp_id, amount, month_year, status) VALUES 
(1, 28500.00, 'Jan-2026', 'PENDING'),
(5, 32000.00, 'Jan-2026', 'PENDING'),
(6, 29000.00, 'Jan-2026', 'PENDING'),
(7, 27500.00, 'Jan-2026', 'PENDING'),
(10, 28000.00, 'Jan-2026', 'PENDING');

-- 9. SEED ACTIVE PINGS: To show "Awaiting Response" animation
INSERT INTO ping_logs (emp_id, status) VALUES 
(7, 'PENDING'),
(11, 'PENDING');

-- FINAL TOUCH: Set an active OTP for Rajesh (ID 1)
UPDATE employees SET current_otp = '123456' WHERE id = 1;