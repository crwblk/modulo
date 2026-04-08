# Contributing to Modulo

Thank you for your interest in contributing to Modulo! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Be respectful, inclusive, and helpful. Treat all contributors with kindness and professionalism. We aim to create a welcoming environment for everyone.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/modulo.git`
3. Navigate to the project: `cd modulo`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
# Install backend dependencies
npm install

# UI dependencies are installed automatically with npm install
```

### Running the Development Server

```bash
npm run dev
```

The backend server will start on `http://localhost:4000` with auto-reload on file changes via `ts-node-dev`.

### Configuration

The project uses a centralized configuration system with Zod validation. See `.env.example` for all available options:

```bash
# Core settings
PORT=4000
NODE_ENV=development
LOG_LEVEL=info

# Feature flags
ENABLE_PUBLIC_PROXY=true

# Rate limiting
RATE_LIMIT_MAX=1000
PUBLISH_RATE_LIMIT_MAX=50

# Upload limits
MAX_UPLOAD_SIZE=52428800  # 50MB
```

All configuration is type-safe and validated at startup. Invalid configurations will prevent the server from starting.

### Building the Project

```bash
# Build both backend and UI
npm run build

# Build only the UI
npm run build:ui
```

### Running in Production Mode

```bash
npm start
```

## Project Structure

Modulo consists of two main parts:

1. **Backend** (`src/`) - TypeScript/Express API server
2. **UI** (`ui/`) - React/Vite frontend application

```
modulo/
├── src/                    # Backend (TypeScript)
│   ├── index.ts            # Entry point
│   ├── server.ts           # Express server factory
│   ├── config.ts           # Configuration management (Zod)
│   ├── types/              # TypeScript interfaces
│   ├── validation/         # Zod validation schemas
│   ├── middleware/         # Express middleware
│   │   ├── requestId.ts    # Request ID tracing
│   │   ├── security.ts     # Path traversal + name validation
│   │   └── error.ts        # Error handler with codes
│   ├── routes/             # API route handlers
│   ├── registry/           # Registry modules (proxy)
│   ├── storage/            # File system storage (atomic writes)
│   └── utils/              # Utilities (logger, params)
├── ui/                     # Frontend (React + Vite)
│   ├── src/                # React source
│   └── public/             # Static assets
├── tests/                  # Integration tests
├── vitest.config.ts        # Test configuration
└── eslint.config.mjs       # Backend ESLint config
```

## Making Changes

1. Make your changes in the appropriate module
2. Ensure all tests pass: `npm test`
3. Run linting: `npm run lint`
4. Commit your changes using conventional commits
5. Push to your fork and submit a pull request

### Available Scripts

```bash
npm run dev              # Start development server with auto-reload
npm run build            # Build TypeScript backend + React UI
npm start                # Start production server
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run lint             # Check for linting issues
npm run lint:fix         # Fix linting issues automatically
npm run lint:backend     # Lint backend only
npm run lint:ui          # Lint UI only
```

## Testing

We use **Vitest** for unit testing and **Supertest** for HTTP integration testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

- Place test files alongside the code they test with the `.test.ts` suffix
- Use descriptive test names that explain the expected behavior
- Test both happy paths and error conditions
- Mock external dependencies (e.g., Storage module)
- Use `describe` blocks to organize related tests

**Example:**

```typescript
import { describe, it, expect } from "vitest";
import { validatePackageName } from "./schemas";

describe("validatePackageName", () => {
  it("should accept valid npm package names", () => {
    expect(validatePackageName("my-package")).toBe(true);
    expect(validatePackageName("@scope/package")).toBe(true);
  });

  it("should reject invalid package names", () => {
    expect(validatePackageName("INVALID")).toBe(false);
    expect(validatePackageName("")).toBe(false);
  });
});
```

### Integration Tests

Integration tests are located in `tests/` and test full workflows:

- Full publish workflow (login, publish, install)
- Proxy fallback to npmjs.org
- Authentication flows
- Error handling

### Test Coverage

Coverage thresholds are enforced (70% minimum across lines, functions, branches, and statements). Aim for higher coverage where possible.

## Code Style

We use **ESLint** for code quality and consistency.

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Lint backend only
npm run lint:backend

# Lint UI only
npm run lint:ui
```

### General Guidelines

- **Use TypeScript** for all new code
- **Follow existing code style** and formatting conventions
- **Use meaningful variable and function names** that describe their purpose
- **Add comments** for complex logic or non-obvious decisions
- **Keep functions small** and focused on a single responsibility
- **Handle errors appropriately** - don't swallow exceptions
- **Use async/await** instead of promise chains
- **Validate all external inputs** using Zod schemas
- **Export only what's needed** - avoid overly broad exports

### Backend Guidelines

- Use functional middleware patterns
- Keep route handlers thin - delegate to services
- Use the Storage abstraction, don't access filesystem directly
- Validate all request inputs with Zod schemas
- Use the AppError class for expected errors with appropriate error codes
- Log important events with the Winston logger, include requestId from req.id
- Use getParam() utility for extracting route parameters
- Follow atomic write patterns for file operations
- Use config module for all configuration access

### Frontend Guidelines

- Use React hooks appropriately
- Keep components focused and reusable
- Use Framer Motion for animations
- Use Lucide icons for consistency
- Follow the existing design system and CSS variable patterns

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

| Type       | Description                     |
| ---------- | ------------------------------- |
| `feat`     | New feature                     |
| `fix`      | Bug fix                         |
| `docs`     | Documentation changes           |
| `style`    | Code style changes (formatting) |
| `refactor` | Code refactoring                |
| `test`     | Adding or updating tests        |
| `chore`    | Maintenance tasks               |
| `perf`     | Performance improvements        |
| `ci`       | CI/CD configuration changes     |

**Scope Examples:** `routes`, `middleware`, `storage`, `ui`, `auth`, `validation`, `docs`

**Examples:**

```
feat(routes): add health check and readiness endpoints
feat(config): add centralized configuration with Zod validation
fix(storage): implement atomic writes to prevent corruption
fix(publish): add cleanup for failed publishes
feat(middleware): add request ID tracing
feat(security): enhance path traversal validation
docs(api): update documentation with new endpoints
test(validation): add schema validation tests
refactor(routes): use getParam utility for parameter extraction
perf(ui): add pagination to package listing
```

## Pull Requests

1. Ensure your branch is up to date with `main`
2. Update the documentation if needed
3. Add tests for new features
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Update CHANGELOG.md if adding features or fixing bugs
7. Push to your fork
8. Submit a pull request with a clear description

### Pull Request Template

```markdown
## Description

Brief description of the changes and the problem they solve.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Tests pass locally (`npm test`)
- [ ] New tests added for features
- [ ] Manual testing completed
- [ ] Linting passes (`npm run lint`)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] CHANGELOG.md updated (if applicable)
```

## Reporting Issues

When creating an issue, please:

1. Use a clear, descriptive title
2. Provide steps to reproduce the issue
3. Include expected vs actual behavior
4. Add relevant logs, error messages, or screenshots
5. Specify your environment (OS, Node.js version, npm version)
6. Include a minimal code example if applicable

## License

By contributing to Modulo, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to Modulo! 🚀
