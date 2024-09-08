# API Documentation

After starting the application, you can access the full Swagger API documentation at http://localhost:3000/api

## Meter Readings API

### Upload Meter Readings

Upload a CSV file containing meter readings in NEM12 format.

```bash
bash
curl -X POST 'http://localhost:3000/v1/meter-readings/upload' \
-H 'Content-Type: multipart/form-data' \
-F 'file=@/path/to/your/nem12_data.csv'
```