# Node.js Backend Server

This is the Express.js backend server that replaces the PHP API.

## Database Configuration

The server connects to your MySQL database with credentials configured in `server/.env`:

```
DB_HOST=31.22.4.48
DB_PORT=3306
DB_NAME=almajdsa_testalmajd
DB_USER=almajdsa_testalmajddb
DB_PASS=uHv{IHV-S{HFZ^kX
```

## Running the Server

Start the backend server:
```bash
npm run dev:server
```

The server will run on port 3001.

## Development

For development, you need to run both:
1. Frontend (Vite): `npm run dev` (port 5173)
2. Backend (Express): `npm run dev:server` (port 3001)

Vite is configured to proxy `/api` requests to the Node.js server.

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/check-auth` - Check authentication status

### Public Profile
- `GET /api/public-profile?publicId=XXXX` - Get public profile

### Admin (requires authentication)
- `GET /api/admin/profiles` - List all profiles
- `POST /api/admin/profiles` - Create/update profile
- `DELETE /api/admin/profiles?id=X` - Delete profile
