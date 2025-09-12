# Logging API Documentation

## POST /logs

Create a new log entry.

**Request Body:**

```
{
  "message": "string", // required
  "level": "info" | "warn" | "error", // optional, default: info
  "meta": { ... } // optional, any object
}
```

**Response:**

- 201 Created: Returns the created log object
- 400 Bad Request: Validation error

---

## GET /logs

Retrieve all logs. Optionally filter by level.

**Query Parameters:**

- `level` (optional): info, warn, or error

**Response:**

- 200 OK: Returns an array of log objects
- 500 Server Error: On failure

---

**Example curl requests:**

Create a log:

```
curl -X POST http://localhost:4000/logs \
  -H "Content-Type: application/json" \
  -d '{"message":"User login failed","level":"error","meta":{"userId":123}}'
```

Get all logs:

```
curl http://localhost:4000/logs
```

Get only error logs:

```
curl http://localhost:4000/logs?level=error
```
