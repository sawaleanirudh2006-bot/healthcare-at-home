# Healnest Backend

This is the backend API for the Healnest application, built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance (local or Atlas)

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    -   Copy `.env.example` to `.env` (if exists) or create `.env`.
    -   Set `PORT`, `MONGO_URI`, and `JWT_SECRET`.

### Running the Server

-   **Development:**
    ```bash
    npm run dev
    ```
-   **Production:**
    ```bash
    npm start
    ```

## API Documentation

-   **Auth**: `/api/auth`
-   **Services**: `/api/services`
-   **Bookings**: `/api/bookings`
-   **Products**: `/api/products`
-   **Orders**: `/api/orders`
