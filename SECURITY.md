# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.1   | :white_check_mark: |

As modulo is in early development (v0.0.1), we recommend always using the latest version for the most up-to-date security features and fixes.

## 🔒 Built-in Security Features

modulo is designed with security in mind. Here are the security measures already implemented:

### HTTP Security Headers

- **Helmet** middleware sets secure headers including:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection`
  - Strict Content-Security-Policy directives

### Rate Limiting

- **General requests**: 1000 requests per 15-minute window per IP
- **Publish requests**: 50 requests per 15-minute window per IP
- Configurable via `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, and `PUBLISH_RATE_LIMIT_MAX` environment variables

### Input Validation

- All inputs validated using **Zod** schemas against npm package specification
- Package names, versions, and user credentials validated before processing
- Type-safe TypeScript throughout the codebase

### Path Traversal Protection

- Enhanced validation prevents directory traversal attacks
- Package names and filenames rigorously validated
- File access restricted to designated storage directories

### Data Integrity

- **Atomic writes** prevent metadata corruption from concurrent operations
- Failed publish operations automatically clean up orphaned tarballs
- File-based storage with no database attack surface

### Request Tracing

- UUID-based request ID tracking for audit trails
- Structured logging with Winston for security event monitoring
- Log rotation (5MB × 5 files) prevents disk exhaustion

## 🚨 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in modulo:

1. **GitHub**: Use [GitHub Security Advisories](https://github.com/crwblk/modulo/security/advisories/new) to privately report the issue

We will acknowledge receipt of your report within **48 hours** and provide a detailed response within **5 business days**, including:

- Confirmation of the vulnerability
- Next steps and timeline for remediation
- Any workarounds or mitigations

### When to Report

Please report vulnerabilities related to:

- Authentication bypass or weaknesses
- Path traversal or file access issues
- Remote code execution
- Denial of service vectors
- Data exposure or leakage
- Injection attacks (XSS, command injection, etc.)
- Package supply chain security issues

## 🛡️ Security Best Practices for Users

### Configuration

- **Set appropriate upload limits**: Configure `MAX_UPLOAD_SIZE` based on your needs
- **Use in production**: Always set `NODE_ENV=production` in production environments
- **Configure rate limits**: Adjust rate limiting based on your team size and usage patterns
- **Restrict network access**: Bind to localhost or use a reverse proxy with TLS

### Deployment

- **Use HTTPS in production**: Always place modulo behind a TLS-enabled reverse proxy (nginx, Caddy, etc.) in production
- **Implement authentication**: Consider adding an additional authentication layer (API keys, tokens) for production use
- **Monitor logs**: Regularly review logs in `logs/` directory for suspicious activity
- **Backup storage**: Regularly backup the `storage/` directory to prevent data loss
- **Keep dependencies updated**: Run `npm audit` regularly and update dependencies

### Network Security

```bash
# Example: Run behind nginx with TLS
# /etc/nginx/sites-available/modulo
server {
    listen 443 ssl;
    server_name registry.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Security Audit

Run regular security audits on the project:

```bash
# Check for known vulnerabilities in dependencies
npm audit

# Fix automatic security issues
npm audit fix

# View detailed audit report
npm audit --json
```

## 🚧 Known Limitations

- **Default authentication**: Currently accepts any username/password combination. For production use, implement proper authentication (LDAP, OAuth, token-based)
- **No encryption at rest**: Package tarballs and metadata are stored unencrypted. Ensure filesystem-level encryption if storing sensitive packages
- **Single-tenant design**: Current version doesn't support multi-user access controls or package-level permissions

## 📝 Security Changelog

### v0.0.1 (Current)

- ✅ Helmet security headers
- ✅ Rate limiting (general + publish-specific)
- ✅ Input validation with Zod
- ✅ Path traversal protection
- ✅ Atomic writes for data integrity
- ✅ Request ID tracing for auditing
- ✅ Structured logging with rotation

## 🤝 Responsible Disclosure

We follow a **responsible disclosure** policy:

1. Reporter submits vulnerability details privately
2. We validate and develop a fix
3. Fix is released with a security advisory
4. Reporter is credited (unless anonymity requested)

**We do not support bug bounties at this time**, but we greatly appreciate responsible disclosure and will credit reporters in release notes (with permission).

## 📚 Additional Resources

- [npm Security Best Practices](https://docs.npmjs.com/cli/v10/using-npm/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Working Group](https://github.com/nodejs/security-wg)

---

**Last Updated**: April 8, 2026

For general questions about modulo security, please open a GitHub Discussion or refer to our [API Documentation](API.md).
