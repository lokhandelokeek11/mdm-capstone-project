# API Reference

Base URL: `http://localhost:3000/api`

## Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Paginated List
```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 100 }
}
```

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user + organization |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Clear session |
| GET | `/auth/me` | Get current user |

## Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers (paginated) |
| GET | `/customers/:id` | Get customer detail |

## Journeys

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/journeys` | List journey summaries |
| GET | `/journeys/:customerId` | Get customer journey |

## Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events |
| POST | `/events` | Ingest event |

## Datasets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/datasets` | List datasets |
| POST | `/datasets` | Create dataset |
| GET | `/datasets/:id` | Get dataset |
| DELETE | `/datasets/:id` | Delete dataset |

## Segments, Predictions, Recommendations, Analytics, Models, Experiments

See route handlers in `backend/src/app/api/` for full endpoint list.

All endpoints (except auth register/login) require `Authorization: Bearer <token>` header.
