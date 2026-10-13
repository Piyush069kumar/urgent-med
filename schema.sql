CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'hospital_admin');

-- 1. Credentials
CREATE TABLE credential (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. State Table (For standardized spelling)
CREATE TABLE state (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. District Table (For standardized spelling, linked to State)
CREATE TABLE district (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    state_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_district_state
        FOREIGN KEY (state_id)
        REFERENCES state(id)
        ON DELETE CASCADE,
        
    -- Prevents duplicate district names within the same state
    CONSTRAINT unique_state_district 
        UNIQUE (state_id, name)
);

-- 4. Hospital
CREATE TABLE hospital (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    hospital_name VARCHAR(255) NOT NULL,
    licence_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    
    district_id INT NOT NULL,
    state_id INT NOT NULL,
    pincode VARCHAR(20), -- VARCHAR is safer for pincodes/zipcodes

    hospital_lat DOUBLE PRECISION,
    hospital_long DOUBLE PRECISION,
    
    -- PostGIS spatial column for fast exact radius/nearest searches
    location geometry(Point, 4326),

    is_active BOOLEAN DEFAULT TRUE,
    status BOOLEAN DEFAULT FALSE,

    credential_id UUID UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_hospital_credential
        FOREIGN KEY (credential_id)
        REFERENCES credential(id),

    CONSTRAINT fk_hospital_district
        FOREIGN KEY (district_id)
        REFERENCES district(id),

    CONSTRAINT fk_hospital_state
        FOREIGN KEY (state_id)
        REFERENCES state(id)
);

-- Create a spatial index to make "find nearest hospital" incredibly fast
CREATE INDEX hospital_location_idx ON hospital USING GIST (location);

-- 5. Resource Category
CREATE TABLE resource_category (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 6. Resource
CREATE TABLE resource (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    resource_category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,

    CONSTRAINT fk_resource_category
        FOREIGN KEY (resource_category_id)
        REFERENCES resource_category(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_resource_category_name
        UNIQUE (resource_category_id, name)
);

-- 7. Hospital Resource
CREATE TABLE hospital_resource (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    hospital_id UUID NOT NULL,
    resource_id INT NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_hospital_resource_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospital(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_hospital_resource
        FOREIGN KEY (resource_id)
        REFERENCES resource(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_hospital_resource
        UNIQUE (hospital_id, resource_id)
);