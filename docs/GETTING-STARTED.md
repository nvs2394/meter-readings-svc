# Getting Started

This guide will help you set up and run the Meter Reading API project.

## Prerequisites

Ensure you have the following installed:
- Node.js (latest LTS version)
- npm (comes with Node.js)
- Docker
- PostgreSQL (if not using Docker)

## Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd meter-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your local configuration

4. Start the PostgreSQL database:
   - If using Docker:
     ```bash
     docker-compose up -d postgres
     ```
   - Or ensure your local PostgreSQL instance is running

## Running the Application

1. Start the application in development mode:
   ```bash
   npm run start:dev
   ```

2. The API will be available at `http://localhost:3000`

## Running Tests

- Run unit tests:
  ```bash
  npm run test
  ```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
`http://localhost:3000/swagger`
