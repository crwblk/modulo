# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of modulo seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Open a GitHub Issue**

Since modulo is open source, please report security vulnerabilities publicly:

1. Go to the [Issues](https://github.com/crwblk/modulo/issues) page
2. Create a new issue with the label `security`
3. Provide a detailed description of the vulnerability, including:
   - Type of vulnerability (e.g., path traversal, XSS, RCE, etc.)
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)

### 2. **What to expect**

- **Acknowledgment**: We will acknowledge receipt of your report within **48 hours**
- **Assessment**: Initial assessment within **7 days**
- **Updates**: Regular updates on remediation progress
- **Disclosure**: Coordinated disclosure after a fix is released

## Security Features

modulo includes several built-in security measures:

### HTTP Security Headers

- **Helmet** integration sets secure headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-DNS-Prefetch-Control: off`
  - Strict MIME type checking

### Rate Limiting

- **General requests**: 1000 requests per 15-minute window per IP
- **Publish endpoints**: 50 requests per 15-minute window per IP
- Configurable via `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, and `PUBLISH_RATE_LIMIT_MAX`

### Input Validation

- All inputs validated with **Zod** schemas
- Package names validated against npm specification
- Semantic versioning enforcement
- Filename sanitization

### Path Traversal Protection

- Enhanced validation prevents directory traversal attacks
- Package names and filenames are sanitized before filesystem operations
- Requests with suspicious path patterns are rejected

### Atomic File Operations

- Metadata writes use atomic operations to prevent corruption
- Prevents race conditions during concurrent publishes
- Failed operations are automatically cleaned up

### CORS Protection

- Configurable Cross-Origin Resource Sharing
- Restricted by default to prevent unauthorized access

### Request Tracing

- UUID-based request ID tracing for audit trails
- Structured logging with Winston for security event tracking

## Security Best Practices for Deployment

When deploying modulo in production, we recommend:

### 1. **Use HTTPS**

Always deploy behind a reverse proxy (nginx, Caddy, etc.) with TLS/SSL termination.

### 2. **Set NODE_ENV=production**

Enable production optimizations and stricter security settings:

```bash
NODE_ENV=production npm start
```

### 3. **Configure Rate Limits**

Adjust rate limits based on your team size and usage patterns:

```bash
RATE_LIMIT_MAX=500
PUBLISH_RATE_LIMIT_MAX=20
```

### 4. **Restrict Network Access**

Use firewall rules to limit access to trusted networks only.

### 5. **Keep Dependencies Updated**

Regularly update dependencies to patch known vulnerabilities:

```bash
npm audit
npm audit fix
```

### 6. **Monitor Logs**

Monitor the `logs/` directory for suspicious activity. modulo provides structured logging with request IDs for traceability.

### 7. **Disable Public Proxy (if not needed)**

If you only need private packages, disable the public npm proxy:

```bash
ENABLE_PUBLIC_PROXY=false
```

### 8. **Use Strong Upload Limits**

Set appropriate upload size limits:

```bash
MAX_UPLOAD_SIZE=52428800  # 50MB in bytes
```

## Known Limitations

- **Authentication**: Default authentication is open (any username/password works). For production use, implement proper authentication middleware or deploy behind a reverse proxy with authentication.
- **Authorization**: No built-in access control or permissions system. All authenticated users have full access.
- **Encryption at Rest**: Package tarballs and metadata are stored unencrypted on the filesystem.

## Security Dependencies

We monitor the following dependencies for security vulnerabilities:

- **express** - Web framework
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **zod** - Input validation
- **body-parser** - Request body parsing
- **cors** - Cross-origin resource sharing

Run `npm audit` regularly to check for known vulnerabilities in dependencies.

## Acknowledgments

We appreciate the security research community's efforts in keeping modulo secure. Contributors who report valid security issues will be acknowledged in our changelog (unless anonymity is requested).

## Contact

- **Security Issues**: Use GitHub Security Advisories
- **General Questions**: [GitHub Discussions](https://github.com/crwblk/modulo/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/crwblk/modulo/issues)
