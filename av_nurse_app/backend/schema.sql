-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table users (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null unique,
  password text not null, -- Stores hashed password (bcrypt)
  role text default 'patient' check (role in ('patient', 'nurse', 'doctor', 'admin')),
  phone text,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Services Table
create table services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  price numeric not null,
  category text not null, -- 'nursing', 'physiotherapy', etc.
  duration text,
  image text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  service_id uuid references services(id),
  service_name text,
  date date not null,
  time text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  notes text,
  total_price numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  stock integer default 0,
  image text,
  prescription_required boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  shipping_address jsonb, -- Store address as JSON
  payment_method text not null,
  payment_result jsonb,
  tax_price numeric default 0.0,
  shipping_price numeric default 0.0,
  total_price numeric default 0.0,
  is_paid boolean default false,
  paid_at timestamp with time zone,
  is_delivered boolean default false,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table (for normalization)
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  name text not null,
  qty integer not null,
  price numeric not null,
  image text
);
