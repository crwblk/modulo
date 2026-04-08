# Modulo

A lightweight, secure, open-source private npm registry built with TypeScript, Express 5, and a modern React UI.

![Modulo UI Preview](https://via.placeholder.com/1000x600/0f172a/6366f1?text=Modulo+Registry+UI)

## ✨ Features

- **Hybrid Registry** - Stores private packages locally, proxies public requests to `registry.npmjs.org` (configurable)
- **Modern UI** - Premium dark-themed dashboard with glassmorphism design for browsing packages
- **npm CLI Compatible** - Full support for `npm login`, `npm publish`, `npm install`
- **Large Uploads** - Handles package versions up to 50MB (configurable)
- **Stream-Based Delivery** - Efficient tarball serving using Node.js streams
- **Security First** - Helmet, rate limiting, enhanced path traversal protection, atomic writes, input validation with Zod
- **Structured Logging** - Winston-based logging with file rotation (5MB x 5 files) and request ID tracing
- **Server-Side Search** - Built-in package search with pagination support
- **Health Checks** - Liveness and readiness probes for production monitoring
- **Zero Database** - File-based storage with atomic writes, no database required
- **Type-Safe** - Full TypeScript coverage across backend and frontend
- **Error Codes** - Consistent error responses with machine-readable codes

## 📦 Technical Stack

### Backend

| Layer          | Technology         | Version |
| -------------- | ------------------ | ------- |
| **Runtime**    | Node.js            | v18+    |
| **Framework**  | Express            | 5.2.1   |
| **Language**   | TypeScript         | 6.0.2   |
| **Validation** | Zod                | 4.3.6   |
| **Security**   | Helmet             | 8.1.0   |
| **Rate Limit** | express-rate-limit | 8.3.2   |
| **CORS**       | cors               | 2.8.6   |
| **Filesystem** | fs-extra           | 11.3.4  |
| **Logging**    | Winston            | 3.19.0  |
| **Body Parse** | body-parser        | 2.2.2   |
| **Env Config** | dotenv             | 17.4.0  |

### Frontend (UI)

| Layer           | Technology                        | Version |
| --------------- | --------------------------------- | ------- |
| **Framework**   | React                             | 19.2.4  |
| **Build Tool**  | Vite                              | 8.0.1   |
| **Routing**     | React Router DOM                  | 7.14.0  |
| **Animations**  | Framer Motion                     | 12.38.0 |
| **Icons**       | Lucide React                      | 1.7.0   |
| **HTTP Client** | Axios                             | 1.14.0  |
| **Fonts**       | Plus Jakarta Sans, JetBrains Mono | -       |

### Dev & Testing

| Tool            | Purpose                      |
| --------------- | ---------------------------- |
| **Vitest**      | Test runner with V8 coverage |
| **Supertest**   | HTTP integration testing     |
| **ESLint**      | Code linting (backend + UI)  |
| **Husky**       | Git pre-commit hooks         |
| **lint-staged** | Run linters on staged files  |

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
git clone https://github.com/crwblk/modulo.git
cd modulo
npm install
```

### Configuration

Environment variables are loaded automatically. Available configuration options:

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

See `.env.example` for all available options including custom storage directories.

### Running the Registry

**Development mode** (with auto-reload via `ts-node-dev`):

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

The registry will be available at [http://localhost:4000](http://localhost:4000).

## 📖 Usage

### 1. Configure npm to use the registry

```bash
npm config set registry http://localhost:4000
```

### 2. Authenticate

```bash
npm login
```

Any username/password combination works by default.

### 3. Publish a package

```bash
npm publish
```

### 4. Install a package

```bash
npm install <package-name>
```

### 5. Browse packages

Open [http://localhost:4000](http://localhost:4000) in your browser to browse packages, view metadata, read READMEs, and search your registry.

## 🛠 Development

### Available Scripts

```bash
npm run dev              # Start development server with auto-reload
npm run build            # Build TypeScript backend + React UI
npm run build:ui         # Build only the React UI
npm start                # Start production server
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run lint             # Check for linting issues (backend + UI)
npm run lint:backend     # Check backend linting only
npm run lint:ui          # Check UI linting only
npm run lint:fix         # Fix linting issues automatically
```

### Project Structure

```
modulo/
├── src/                          # Backend (TypeScript)
│   ├── index.ts                  # Entry point: starts server, ensures directories
│   ├── server.ts                 # Express server factory with middleware
│   ├── config.ts                 # Configuration management with Zod validation
│   ├── types/                    # TypeScript interfaces for npm metadata
│   │   └── index.ts              #   Package metadata, auth, publish payloads
│   ├── validation/               # Zod validation schemas
│   │   ├── schemas.ts            #   Package name, semver, auth, search schemas
│   │   └── schemas.test.ts       #   Validation schema tests
│   ├── middleware/               # Express middleware
│   │   ├── error.ts              #   Global error handler (AppError class)
│   │   ├── validation.ts         #   Zod-based request validation
│   │   ├── security.ts           #   Path traversal prevention + name validation
│   │   ├── cache.ts              #   Cache-Control header factory
│   │   ├── requestLogger.ts      #   Structured HTTP request logging
│   │   └── requestId.ts          #   Request ID tracing middleware
│   ├── routes/                   # API route handlers
│   │   ├── index.ts              #   Main router: mounts sub-routers + static UI
│   │   ├── auth.ts               #   Authentication: login, whoami
│   │   ├── metadata.ts           #   Package metadata (local + proxy fallback)
│   │   ├── publish.ts            #   Package publishing with cleanup
│   │   ├── tarball.ts            #   Tarball download/streaming
│   │   ├── ui.ts                 #   UI backend: packages list, search, detail
│   │   └── index.test.ts         #   Route unit tests
│   ├── registry/                 # Registry-specific modules
│   │   └── proxy.ts              #   npmjs.org proxy for public packages
│   ├── storage/                  # Storage layer
│   │   ├── fs.ts                 #   File system CRUD with atomic writes
│   │   └── fs.test.ts            #   Storage unit tests
│   └── utils/
│       ├── logger.ts             #   Winston logger with rotation
│       └── params.ts             #   Parameter extraction utilities
├── ui/                           # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.tsx              #   React entry point
│   │   ├── App.tsx               #   Main app shell with Router
│   │   ├── index.css             #   Global styles: CSS variables, glassmorphism
│   │   ├── pages/
│   │   │   ├── Home.tsx          #     Home: package list, search, hero
│   │   │   └── PackageDetail.tsx #     Package detail: README, install command
│   │   ├── components/
│   │   │   └── CopyButton.tsx    #     Copy-to-clipboard with animated icon
│   │   └── assets/               #   Static assets
│   ├── public/                   # Static public files
│   └── package.json              # UI dependencies
├── tests/                        # Integration tests
│   └── integration.test.ts       # Full publish/install workflow tests
├── storage/                      # Local package storage (git-ignored)
│   ├── metadata/                 #   Package metadata JSON files
│   └── tarballs/                 #   Tarball binaries
├── logs/                         # Application logs (git-ignored)
├── vitest.config.ts              # Vitest test configuration
├── tsconfig.json                 # Backend TypeScript config
├── eslint.config.mjs             # Backend ESLint config
└── .gitignore                    # Git ignore patterns
```

### Architecture

**Request Flow:**

```
Client (npm CLI / Browser)
  └── Express Server (server.ts)
      ├── Security middleware (helmet, CORS, rate limiting)
      ├── Body parsing (50MB limit for npm payloads)
      ├── Request logging (Winston)
      └── Routes (routes/index.ts)
          ├── auth.ts      → PUT /-/user/:id, GET /-/whoami
          ├── metadata.ts  → GET /:package (local → proxy fallback)
          ├── publish.ts   → PUT /:package (validate → save tarball → save metadata)
          ├── tarball.ts   → GET /:package/-/:filename (stream local → redirect npmjs)
          ├── ui.ts        → GET /-/ui/packages, /-/ui/search
          └── Static files → Built UI from ui/dist
      └── Global error handler
```

**Storage Model:**

```
storage/
├── metadata/
│   └── <package-name>.json    # Full npm metadata per package
└── tarballs/
    └── <package-name>/
        └── <filename>.tgz     # Tarball binaries
```

## 🔒 Security

Modulo includes enterprise-grade security features out of the box:

- **Helmet** - Sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Rate Limiting** - Prevents abuse (1000 req/15min general, 50 req/15min for publish)
- **Input Validation** - All inputs validated with Zod schemas against npm spec
- **Path Traversal Protection** - Enhanced validation for package names and filenames
- **Atomic Writes** - Prevents metadata corruption from concurrent operations
- **Automatic Cleanup** - Failed publishes clean up orphaned tarballs
- **CORS** - Configurable cross-origin resource sharing
- **Request ID Tracing** - UUID tracking for audit trails and debugging
- **Configurable Proxy** - Can be disabled for private-only registries

## 📝 API Documentation

Full API documentation is available in [API.md](API.md).

### Key Endpoints

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| `GET`  | `/-/ping`               | Basic health check                      |
| `GET`  | `/-/health`             | Detailed health check with uptime       |
| `GET`  | `/-/ready`              | Readiness probe (storage check)         |
| `PUT`  | `/-/user/:id`           | Login / register user                   |
| `GET`  | `/-/whoami`             | Get current authenticated user          |
| `GET`  | `/:package`             | Get package metadata (local or proxied) |
| `PUT`  | `/:package`             | Publish package version                 |
| `GET`  | `/:package/-/:filename` | Download package tarball                |
| `GET`  | `/-/ui/packages`        | List packages with pagination           |
| `GET`  | `/-/ui/package/:name`   | Get package detail (UI API)             |
| `GET`  | `/-/ui/search`          | Search packages with pagination         |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

Test coverage thresholds are enforced (70% minimum across lines, functions, branches, and statements). Tests use Vitest with Supertest for HTTP integration testing.

### Test Structure

- **Unit tests** - Co-located with source files (`*.test.ts` suffix)
- **Integration tests** - In `tests/` directory for full workflow testing
- **Mocked storage** - All route tests mock the Storage module
- **Isolated test storage** - Separate `test-storage/` directory for test isolation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is open-source and licensed under the ISC License. See [LICENSE](LICENSE) for details.

## 🆚 Why Modulo?

| Feature            | Modulo        | Verdaccio   |
| ------------------ | ------------- | ----------- |
| Database Required  | ❌ No         | ✅ Yes      |
| Setup Complexity   | 🟢 Simple     | 🟡 Moderate |
| Modern UI          | ✅ Yes        | 🟡 Basic    |
| TypeScript         | ✅ Full       | 🟡 Partial  |
| Built-in Search    | ✅ Yes        | ✅ Yes      |
| Lightweight        | ✅ ~50MB      | 🟡 ~200MB   |
| Streaming Tarballs | ✅ Yes        | ✅ Yes      |
| React Frontend     | ✅ React 19   | 🟡 Legacy   |
| Framer Motion      | ✅ Animations | ❌ No       |

**Choose Modulo when you need:**

- A simple, lightweight private registry
- Easy deployment without database complexity
- A modern, beautiful UI for browsing packages
- Full TypeScript support across the stack
- Quick setup for teams and personal projects

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/crwblk/modulo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/crwblk/modulo/discussions)
- **Source**: [GitHub Repository](https://github.com/crwblk/modulo)
