# Modulo Registry API Documentation

## Overview

Modulo is a private npm registry compatible with the standard npm CLI. It provides a hybrid registry that stores private packages locally while proxying public package requests to `registry.npmjs.org`.

## Base URL

```
http://localhost:4000
```

## Configuration

All configuration is done via environment variables. See `.env.example` for all available options.

| Variable                 | Description                                      | Default       |
| ------------------------ | ------------------------------------------------ | ------------- |
| `PORT`                   | Server port                                      | `4000`        |
| `NODE_ENV`               | Environment (`development` or `production`)      | `development` |
| `LOG_LEVEL`              | Logging level (`debug`, `info`, `warn`, `error`) | `info`        |
| `ENABLE_PUBLIC_PROXY`    | Enable proxying to public npm registry           | `true`        |
| `MAX_UPLOAD_SIZE`        | Maximum upload size in bytes                     | `52428800`    |
| `RATE_LIMIT_WINDOW_MS`   | Rate limit window in milliseconds                | `900000`      |
| `RATE_LIMIT_MAX`         | Max requests per IP per window                   | `1000`        |
| `PUBLISH_RATE_LIMIT_MAX` | Max publish requests per IP per window           | `50`          |
| `REQUEST_TIMEOUT_MS`     | Request timeout in milliseconds                  | `30000`       |
| `STORAGE_DIR`            | Custom storage directory path                    | `./storage`   |
| `LOGS_DIR`               | Custom logs directory path                       | `./logs`      |

---

## API Endpoints

### Health & Readiness Checks

#### Ping (Basic Health Check)

```
GET /-/ping
```

Returns a simple health check response to verify the server is running.

**Response:** `pong` (plain text, HTTP 200)

**Example:**

```bash
curl http://localhost:4000/-/ping
```

#### Health Check (Liveness Probe)

```
GET /-/health
```

Returns detailed health information including uptime and version.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2026-04-08T11:00:00.000Z",
  "version": "0.0.1"
}
```

**Example:**

```bash
curl http://localhost:4000/-/health
```

#### Readiness Check

```
GET /-/ready
```

Checks if the server is ready to accept requests by verifying storage accessibility.

**Response (200 OK):**

```json
{
  "status": "ready",
  "requestId": "uuid-here",
  "timestamp": "2026-04-08T11:00:00.000Z"
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "not ready",
  "error": "Storage not accessible",
  "code": "STORAGE_UNAVAILABLE",
  "timestamp": "2026-04-08T11:00:00.000Z"
}
```

**Example:**

```bash
curl http://localhost:4000/-/ready
```

---

### Authentication

#### Login / Register User

```
PUT /-/user/:username
```

Authenticates a user and returns an authentication token. This endpoint is used by `npm login` to register or authenticate users.

**URL Parameters:**

- `username` (string, required): The username to log in as

**Request Body:**

```json
{
  "name": "username",
  "password": "password"
}
```

**Response (201 Created):**

```json
{
  "ok": true,
  "token": "modulo-token-username-1234567890"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Invalid username",
  "code": "INVALID_USERNAME"
}
```

**Example:**

```bash
curl -X PUT http://localhost:4000/-/user/myuser \
  -H "Content-Type: application/json" \
  -d '{"name":"myuser","password":"secret"}'
```

**Note:** Modulo operates as an open registry by default. Any username/password combination works. For production use, implement proper authentication middleware.

#### Whoami

```
GET /-/whoami
```

Returns the currently authenticated user. Requires a valid authentication token in the request headers.

**Headers:**

- `Authorization`: Bearer token (required)

**Response (200 OK):**

```json
{
  "username": "modulo-user"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "Authentication required"
}
```

**Example:**

```bash
curl http://localhost:4000/-/whoami \
  -H "Authorization: Bearer modulo-token-myuser-1234567890"
```

---

### Package Metadata

#### Get Package Metadata

```
GET /:package
```

Retrieves package metadata. If the package exists in local storage, returns the local metadata. If not, proxies the request to `registry.npmjs.org`.

**URL Parameters:**

- `package` (string, required): Package name (must be a valid npm package name)

**Response (200 OK):**

```json
{
  "name": "my-package",
  "dist-tags": { "latest": "1.0.0" },
  "versions": {
    "1.0.0": {
      "name": "my-package",
      "version": "1.0.0",
      "description": "A sample package",
      "main": "index.js",
      "dist": {
        "integrity": "sha512-abc123...",
        "shasum": "abc123def456...",
        "tarball": "http://localhost:4000/my-package/-/my-package-1.0.0.tgz"
      }
    }
  },
  "time": {
    "created": "2024-01-01T00:00:00.000Z",
    "modified": "2024-01-01T00:00:00.000Z",
    "1.0.0": "2024-01-01T00:00:00.000Z"
  },
  "description": "A sample package",
  "readme": "# My Package\n\nDocumentation here..."
}
```

**Response (404 Not Found):**

```json
{
  "error": "Not Found",
  "code": "NOT_FOUND"
}
```

**Response (502 Bad Gateway):**

```json
{
  "error": "Failed to fetch from proxy registry",
  "code": "PROXY_ERROR"
}
```

**Example:**

```bash
curl http://localhost:4000/my-package
```

**Example (Proxy to npmjs.org):**

```bash
curl http://localhost:4000/express
```

**Note:** If `ENABLE_PUBLIC_PROXY=false`, the proxy is disabled and only local packages are served.

---

### Publish Package

```
PUT /:package
```

Publishes a new version of a package. Accepts the standard npm publish payload with `_attachments` containing the base64-encoded tarball data.

**URL Parameters:**

- `package` (string, required): Package name

**Request Body:** Standard npm publish payload (JSON)

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "dist-tags": { "latest": "1.0.0" },
  "versions": {
    "1.0.0": {
      "name": "my-package",
      "version": "1.0.0",
      "description": "A sample package",
      "main": "index.js"
    }
  },
  "_attachments": {
    "my-package-1.0.0.tgz": {
      "content_type": "application/octet-stream",
      "data": "<base64-encoded-tarball>",
      "length": 12345
    }
  }
}
```

**Response (201 Created):**

```json
{
  "ok": true
}
```

**Error Responses:**

- `400 Bad Request` - Invalid payload, missing attachments, validation error
- `409 Conflict` - Version already exists
- `429 Too Many Requests` - Publish rate limit exceeded (50 requests per 15 minutes)

**Example:**

```bash
# Using npm CLI (recommended)
npm publish --registry http://localhost:4000
```

**Note:** Package names are validated against npm specification. Failed publishes automatically clean up any uploaded tarballs.

---

### Download Tarball

```
GET /:package/-/:filename
```

Downloads a package tarball. Serves local tarballs via streams for efficiency. If the package doesn't exist locally, redirects to the npm registry.

**URL Parameters:**

- `package` (string, required): Package name
- `filename` (string, required): Tarball filename (e.g., `my-package-1.0.0.tgz`)

**Response (200 OK):**

- Content-Type: `application/octet-stream`
- Body: Tarball binary data (streamed)

**Response (302 Redirect):**

- If package not found locally and proxy enabled, redirects to `registry.npmjs.org`

**Response (404 Not Found):**

- If package not found locally and proxy disabled

```json
{
  "error": "Tarball not found",
  "code": "NOT_FOUND"
}
```

**Example:**

```bash
curl http://localhost:4000/my-package/-/my-package-1.0.0.tgz -o package.tgz
```

---

## UI Backend Endpoints

These endpoints are used by the React UI dashboard and return structured JSON data.

### List All Packages

```
GET /-/ui/packages
```

Returns a paginated list of packages in the registry.

**Query Parameters:**

- `page` (number, optional): Page number (1-based, default: 1)
- `limit` (number, optional): Items per page (max: 200, default: 50)

**Response (200 OK):**

```json
{
  "packages": [
    {
      "name": "my-package",
      "description": "A sample package",
      "version": "1.0.0",
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    },
    {
      "name": "another-package",
      "description": "Another package",
      "version": "2.1.0",
      "lastUpdated": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "hasMore": true
  }
}
```

### Get Package Detail (UI)

```
GET /-/ui/package/:name
```

Returns full package metadata for display in the UI.

**URL Parameters:**

- `name` (string, required): Package name

**Response (200 OK):**

```json
{
  "name": "my-package",
  "dist-tags": { "latest": "1.0.0" },
  "versions": { ... },
  "time": { ... },
  "description": "A sample package",
  "readme": "# My Package\n\n..."
}
```

**Response (404 Not Found):**

```json
{
  "error": "Package not found locally",
  "code": "NOT_FOUND"
}
```

### Search Packages

```
GET /-/ui/search?q=query&size=20&from=0
```

Searches packages by name and description with pagination support.

**Query Parameters:**

- `q` (string, optional): Search query
- `size` (number, optional, max 100): Number of results to return (default: 20)
- `from` (number, optional): Offset for pagination (default: 0)
- `page` (number, optional): Page number for paginated fetch (default: 1)
- `limit` (number, optional, max 500): Packages to fetch per page (default: 100)

**Response (200 OK):**

```json
{
  "objects": [
    {
      "name": "my-package",
      "description": "A sample package",
      "version": "1.0.0",
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 10,
  "from": 0,
  "size": 20,
  "page": 1,
  "limit": 100
}
```

**Example:**

```bash
curl "http://localhost:4000/-/ui/search?q=utils&size=10&from=0"
```

---

## Using with npm CLI

### Set Registry URL

```bash
npm config set registry http://localhost:4000
```

### Login

```bash
npm login
```

Follow the interactive prompts. Any username/password combination works by default.

### Publish a Package

```bash
# From your package directory
npm publish
```

### Install a Package

```bash
npm install my-package
```

### Scoped Packages

Modulo supports scoped packages. Publish and install as usual:

```bash
npm publish --scope=@myorg
npm install @myorg/my-package
```

---

## Rate Limiting

The API implements IP-based rate limiting to prevent abuse:

### General Endpoints

- **Window:** 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max requests per IP:** 1000 (configurable via `RATE_LIMIT_MAX`)
- **Headers:** Returns standard rate limit headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`)

### Publish Endpoint

- **Window:** 15 minutes
- **Max publish requests per IP:** 50 (configurable via `PUBLISH_RATE_LIMIT_MAX`)

When the limit is exceeded, the server returns:

**Response (429 Too Many Requests):**

```json
{
  "error": "Too many requests, please try again later",
  "code": "RATE_LIMITED"
}
```

---

## Caching

The API sets appropriate `Cache-Control` headers for different types of responses:

- **Metadata responses**: Cached by browsers/CDNs
- **Tarball responses**: Cached for efficient delivery
- **UI endpoints**: Appropriate caching for dashboard performance

---

## Error Responses

All API errors follow a consistent JSON format with error codes:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

In development mode (`NODE_ENV=development`), responses may also include a `stack` field for debugging.

**Common Status Codes:**

| Code  | Meaning               | Typical Cause                                     | Error Code            |
| ----- | --------------------- | ------------------------------------------------- | --------------------- |
| `400` | Bad Request           | Invalid payload, missing fields, validation error | `BAD_REQUEST`         |
| `401` | Unauthorized          | Missing or invalid authentication token           | `UNAUTHORIZED`        |
| `403` | Forbidden             | Access denied                                     | `FORBIDDEN`           |
| `404` | Not Found             | Package or endpoint doesn't exist                 | `NOT_FOUND`           |
| `409` | Conflict              | Version already exists                            | `CONFLICT`            |
| `422` | Validation Error      | Request validation failed                         | `VALIDATION_ERROR`    |
| `429` | Too Many Requests     | Rate limit exceeded                               | `RATE_LIMITED`        |
| `500` | Internal Server Error | Unexpected server error                           | `INTERNAL_ERROR`      |
| `502` | Bad Gateway           | Proxy failure (npmjs.org unreachable)             | `PROXY_ERROR`         |
| `503` | Service Unavailable   | Storage not accessible                            | `STORAGE_UNAVAILABLE` |

## Request ID Tracing

All API responses include an `X-Request-ID` header containing a unique UUID for request tracing. This ID is also logged with all server-side logs, enabling correlation of log entries across async operations.

**Example:**

```bash
curl -v http://localhost:4000/-/health

# Response headers:
# X-Request-ID: 550c74d9-1b99-4c6b-89c5-a2720d57fdcf
```

You can also provide your own request ID:

```bash
curl -H "X-Request-ID: my-custom-trace-id" http://localhost:4000/-/health
```

---

## Security Notes

- All inputs are validated using Zod schemas
- Path traversal attacks are blocked with enhanced validation
- Package names must follow npm naming conventions (`/^[a-z0-9][a-z0-9._-]*$/`)
- Tarball filenames must match pattern (`/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.tgz$/`)
- Semver validation is enforced for versions
- Request size is limited (default 50MB, configurable via `MAX_UPLOAD_SIZE`)
- Metadata writes are atomic to prevent corruption
- Failed publishes automatically clean up uploaded tarballs

---

## npm CLI Compatibility

Modulo is fully compatible with the standard npm CLI workflows:

- ✅ `npm login` - Authentication
- ✅ `npm publish` - Package publishing
- ✅ `npm install` - Package installation
- ✅ `npm search` - Package search
- ✅ `npm view` - Package metadata viewing
- ✅ `npm whoami` - Current user verification

No special configuration beyond setting the registry URL is required.
