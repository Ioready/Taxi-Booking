
------------------------------ PHASE 1  ------------------------------------

CREATE TABLE global (
    id SERIAL PRIMARY KEY,                -- Unique identifier for the global entity
    title VARCHAR(255) NOT NULL,          -- Title or heading of the global entity
    img_url VARCHAR(255),                 -- URL or file path to the image associated with the global entity
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),  -- Status of the global entity with default value and constraint
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the global entity was created
);


-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'car_owner', 'renter')) NOT NULL,
    is_subscribed BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    licence_no VARCHAR(255) NOT NULL,
    licence_picture VARCHAR(255),
    account_id VARCHAR(255),
    approve BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255),
    whatsapp_number VARCHAR(15) UNIQUE
);

-- -- Cars Table
CREATE TABLE Cars (
    car_id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    images TEXT[],
    description TEXT,
    model VARCHAR(50),
    year INT,
    registration_number VARCHAR(20),
    availability BOOLEAN DEFAULT TRUE,
    daily_rate DECIMAL(10, 2),
    no_of_seats INT,
    fuel VARCHAR(20),
    color VARCHAR(20),
    mileage DECIMAL(10, 2),
    condition VARCHAR(20) DEFAULT 'Used' CHECK (condition IN ('New', 'Used')),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Approved', 'Cancelled', 'Pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Bookings Table
CREATE TABLE Bookings (
    booking_id SERIAL PRIMARY KEY,
    car_id INT REFERENCES Cars(car_id) ON DELETE CASCADE,
    renter_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    booking_start TIMESTAMP NOT NULL,
    booking_end TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Approved', 'Cancelled', 'Pending')),
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid'));
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE stripe_transactions (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL,
--     stripe_id VARCHAR(255) NOT NULL,
--     bal_id VARCHAR(255),
--     amount BIGINT NOT NULL,
--     url TEXT,
--     email VARCHAR(255) NOT NULL,
--     customer_id VARCHAR(255),
--     created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- Financial Transactions Table
CREATE TABLE FinancialTransactions (
    financial_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    amount BIGINT NOT NULL, -- Stored in the smallest currency unit (e.g., cents for USD)
    payment_type VARCHAR(55) CHECK (payment_type IN ('Subscription', 'Booking')) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE, -- Store the Stripe session ID
    stripe_payment_intent_id VARCHAR(255) UNIQUE, -- Store the Stripe Payment Intent ID
    currency VARCHAR(10) DEFAULT 'usd', -- Currency used for the transaction
    application_fee_amount INTEGER DEFAULT 300, -- Application fee charged (in the smallest currency unit)
    transfer_destination VARCHAR(255), -- Connected account to receive the transfer
    status VARCHAR(50) DEFAULT 'pending', -- Status of the transaction (e.g., pending, completed, failed)
    customer_email VARCHAR(255), -- Email of the customer who made the payment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Subscription Packages Table
CREATE TABLE SubscriptionPackages (
    package_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    duration VARCHAR(20),
    price DECIMAL(10, 2) NOT NULL,
    no_of_cars INT NOT NULL DEFAULT 3,
    description TEXT,
    features TEXT,
    type VARCHAR(20) CHECK (type IN ('exclusive', 'including tax')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    tax_name VARCHAR(50),
    tax_percentage DECIMAL(5, 2) CHECK (tax_percentage BETWEEN 0 AND 100),
    product_id VARCHAR(50),
    price_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE UserSubscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    package_id INT REFERENCES SubscriptionPackages(package_id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'expired', 'cancelled', 'pending')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



------------------------------ PHASE 2 ------------------------------------

-- Incident Reports Table
CREATE TABLE IncidentReports (
    report_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    reporter_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    media TEXT[] DEFAULT '{}',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending'
);


-- Toll Reports Table
CREATE TABLE TollReports (
    toll_report_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    reporter_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    toll_location VARCHAR(255),
    toll_amount DECIMAL(10, 2),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending'
);

-- Updates Table
CREATE TABLE JourneyUpdates (
    update_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    update_type VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    booking_id INT REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    car_id INT REFERENCES Cars(car_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


