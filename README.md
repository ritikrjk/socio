# Socio Backend API Documentation

## Overview
This is the backend API for the Socio app, built with Node.js, Express, and MongoDB. It provides authentication, user, and post management endpoints for a social networking application.

## Setup & Environment
- Install dependencies: `npm install`
- Create a `.env` file based on `.env.example` with your MongoDB URI and JWT secrets.
- Start the server: `npm run dev`

## Authentication
- Uses JWT for authentication (access and refresh tokens).
- Access token is required for most endpoints (send as `Authorization: Bearer <token>` header).
- Refresh token endpoint issues new tokens when the access token expires.

## Endpoints

### Auth
#### POST /api/auth/register
- Registers a new user.
- **Body:** `{ nameFirst, nameLast, email, password, gender }`
- **Response:** `{ user, refreshToken, accessToken }`

#### POST /api/auth/login
- Logs in an existing user.
- **Body:** `{ email, password }`
- **Response:** `{ user, refreshToken, accessToken }`

#### POST /api/auth/refresh-token
- Issues new access and refresh tokens.
- **Body:** `{ refreshToken }`
- **Response:** `{ accessToken, refreshToken }`

### User
#### GET /api/user/userdata
- Returns the authenticated user's own profile data.
- **Usage:** For viewing "My Profile" or account details.
- **Auth:** Requires access token.
- **Response:** `{ user }`

#### GET /api/user/:id
- Returns the profile data of another user by their user ID.
- **Usage:** For visiting another user's profile page.
- **Auth:** Requires access token.
- **Response:** `{ user }`

## Error Codes
- 400: Bad request (missing/invalid data)
- 401: Unauthorized (invalid/expired token)
- 404: Not found
- 500: Server error

## Testing
- Run all tests: `npm test`
- Unit and integration tests are located in the `tests/` directory.

---

## [To be continued: User and Post endpoints] 