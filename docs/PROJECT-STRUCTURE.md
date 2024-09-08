# Project Structure

This NestJS project is organized into modules, with a focus on meter readings functionality. The main components are:

## Meter Readings Module

The core module of the application, responsible for:
- Processing and storing meter readings
- Parsing CSV files containing meter data
- Providing API endpoints for meter reading operations

Key components include:
- Controller for handling HTTP requests
- Service for business logic
- CSV parser service for processing input files
- DTOs for data validation and transformation

## Testing

The project includes unit tests for:
- Meter readings service
- CSV parsing functionality

Tests are located alongside the modules they cover.

## Configuration

The application uses NestJS's built-in configuration system for managing environment-specific settings.

## API Documentation

API endpoints are documented using Swagger/OpenAPI, providing interactive documentation for the meter readings API.

## Data Persistence

The application uses PostgreSQL as its primary database for storing meter reading data. PostgreSQL was chosen for its reliability, robust feature set, and excellent support for complex queries and data integrity constraints.

Key points:
- Database: PostgreSQL
- ORM: TypeORM (assumed, as it's commonly used with NestJS)
- Entities: Meter readings and related data structures

The database schema is designed to efficiently store and retrieve meter reading data, supporting the core functionality of the application.