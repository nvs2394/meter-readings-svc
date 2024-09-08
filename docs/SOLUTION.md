# Solution Overview

This NestJS application provides a robust solution for processing and managing meter readings.

## Key Features

1. CSV Parsing: Efficiently parses NEM12 format CSV files containing meter reading data.
2. Data Validation: Implements thorough validation of input data to ensure data integrity.
3. API Endpoints: Offers RESTful API endpoints for meter reading operations.
4. Database Integration: Utilizes PostgreSQL for persistent storage of meter reading data.
5. Error Handling: Implements comprehensive error handling and logging for debugging and monitoring.

## Core Components

### CsvParserService
- Responsible for parsing NEM12 format CSV files.
- Handles different record types (200, 300) and their specific data structures.
- Implements error handling to manage invalid data gracefully.

### MeterReadingService
- Manages business logic for processing and storing meter readings.
- Interacts with the database to persist and retrieve meter reading data.
- Implements query functionality for fetching meter readings based on various criteria.

### MeterReadingController
- Defines API endpoints for meter reading operations.
- Handles file uploads for CSV processing.
- Provides endpoints for querying and managing meter reading data.

## Data Flow

1. CSV file is uploaded through the API.
2. CsvParserService processes the file, extracting meter reading data.
3. Parsed data is validated and transformed into appropriate data structures.
4. MeterReadingService stores the processed data in the PostgreSQL database.
5. API endpoints allow retrieval and management of stored meter reading data.

## Testing Strategy

- Unit tests cover individual components, particularly the CsvParserService and MeterReadingService.