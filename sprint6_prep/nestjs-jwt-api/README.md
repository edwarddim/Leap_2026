# NestJS REST API with JWT Authentication

A ready-to-run NestJS REST API starter featuring user registration, password hashing with `bcrypt`, JWT token issuance, and route protection via a custom `AuthGuard`.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run start:dev
   ```
   The API will run at `http://localhost:3000`.

## API Endpoints & Testing

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

### 2. Login (Get JWT Token)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```
*Note: A default demo user (`username: "admin"`, `password: "admin123"`) is also pre-seeded on startup.*

### 3. Access Protected Profile Route
Replace `<YOUR_ACCESS_TOKEN>` with the token returned from `/auth/login`:
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
