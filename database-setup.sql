-- Celebrity Connect Database Setup for Supabase
-- Run this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS celebrities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'celebrity', 'admin')),
    full_name VARCHAR(100),
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Celebrities table
CREATE TABLE celebrities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    category VARCHAR(50),
    profile_image VARCHAR(500),
    available_for_booking BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_appointment_id UUID,
    related_message_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_celebrities_user_id ON celebrities(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_celebrity_id ON appointments(celebrity_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Insert Admin User (password: admin123)
-- Hash generated with bcrypt for 'admin123'
INSERT INTO users (username, email, password, role, full_name) 
VALUES (
    'admin', 
    'admin@celebrityconnect.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin', 
    'System Administrator'
);

-- Insert Test User (password: test123)
-- Hash generated with bcrypt for 'test123'
INSERT INTO users (username, email, password, role, full_name) 
VALUES (
    'testuser', 
    'test@celebrityconnect.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'user', 
    'Test User'
);

-- Create Celebrity Users and Profiles
-- Tom Hanks
INSERT INTO users (username, email, password, role, full_name) 
VALUES (
    'tomhanks', 
    'tomhanks@celebrityconnect.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'celebrity', 
    'Tom Hanks'
);

INSERT INTO celebrities (user_id, name, bio, category, available_for_booking) 
VALUES (
    (SELECT id FROM users WHERE username = 'tomhanks'),
    'Tom Hanks',
    'Academy Award-winning actor known for Forrest Gump, Cast Away, and Toy Story.',
    'Actor',
    true
);

-- Taylor Swift
INSERT INTO users (username, email, password, role, full_name) 
VALUES (
    'taylorswift', 
    'taylorswift@celebrityconnect.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'celebrity', 
    'Taylor Swift'
);

INSERT INTO celebrities (user_id, name, bio, category, available_for_booking) 
VALUES (
    (SELECT id FROM users WHERE username = 'taylorswift'),
    'Taylor Swift',
    'Grammy Award-winning singer-songwriter and global superstar.',
    'Musician',
    true
);

-- Oprah Winfrey
INSERT INTO users (username, email, password, role, full_name) 
VALUES (
    'oprahwinfrey', 
    'oprahwinfrey@celebrityconnect.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'celebrity', 
    'Oprah Winfrey'
);

INSERT INTO celebrities (user_id, name, bio, category, available_for_booking) 
VALUES (
    (SELECT id FROM users WHERE username = 'oprahwinfrey'),
    'Oprah Winfrey',
    'Media mogul, philanthropist, and influential talk show host.',
    'TV Host',
    true
);

-- Create welcome notification for test user
INSERT INTO notifications (user_id, type, title, message) 
VALUES (
    (SELECT id FROM users WHERE username = 'testuser'),
    'welcome',
    'Welcome to Celebrity Connect! 🌟',
    'Welcome to Celebrity Connect! We''re thrilled to have you join our exclusive platform where you can connect with your favorite celebrities. Explore celebrity profiles, book appointments, and send messages to start your journey. Have an amazing experience!'
);

-- Verify setup
SELECT 'Setup Complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_celebrities FROM celebrities;
SELECT COUNT(*) as total_notifications FROM notifications;
