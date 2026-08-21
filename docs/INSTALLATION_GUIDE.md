# Installation Guide

## 1. Requirements
- Node.js v18 or later (`node -v`)
- npm v9 or later
- A MongoDB Atlas cluster (free tier is enough) — https://www.mongodb.com/cloud/atlas
- (Optional) Gmail account with an "App Password" for sending real emails, or a free Mailtrap.io inbox for testing

## 2. Get a MongoDB connection string
1. Create a free cluster on MongoDB Atlas.
2. Create a database user (username + password).
3. Under "Network Access", allow your IP (or `0.0.0.0/0` for development).
4. Click "Connect" → "Drivers" → copy the connection string, e.g.:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/library_management?retryWrites=true&w=majority`

## 3. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```
MONGO_URI=<your connection string>
JWT_SECRET=<any random long string>
CLIENT_URL=http://localhost:5173
EMAIL_USER=<your email> (optional but needed for password reset / verification emails)
EMAIL_PASS=<your app password>
```

Seed the default admin + sample books:
```bash
npm run seed
```

Run in dev mode:
```bash
npm run dev
```
You should see: `Server running in development mode on port 5000` and `MongoDB Connected: ...`

## 4. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Open `http://localhost:5173`.

## 5. Verify it's working
- Go to `http://localhost:5000/api/health` — should return `{ "success": true, ... }`
- Log in with `admin@library.com` / `Admin@123`
- Add a book, register a student account in another browser/incognito window, request to borrow it, then approve it from the admin account.

## 6. Common Issues

| Problem | Fix |
|---|---|
| `MongoServerError: bad auth` | Double-check username/password in `MONGO_URI`, and that the DB user has read/write access |
| CORS errors in browser console | Make sure `CLIENT_URL` in `server/.env` matches the URL the frontend is running on |
| Emails not sending | This is optional in local dev — the app still works, it just logs the error to the console. Use Mailtrap.io for a zero-config test SMTP inbox |
| `EADDRINUSE` on port 5000 | Another process is using the port — change `PORT` in `.env` or stop the other process |
