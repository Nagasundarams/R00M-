# R00m5BE

Node.js + Express + MongoDB backend using Mongoose, JWT auth, and security middlewares (helmet, cors, morgan, dotenv).

## Requirements

- Node.js 18+ and npm
- MongoDB connection string

## Setup

1. Install dependencies:
   - npm install
2. Create a .env file in the project root:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/r00m5
   JWT_SECRET=replace-with-a-strong-secret
   NODE_ENV=development
   ```
3. Start the server:
   - Dev (auto-reload): npm run dev
   - Prod: npm start

## Scripts

- start: node src/server.js
- dev: nodemon src/server.js

## Tech

- express 5, mongoose, jsonwebtoken, bcryptjs
- helmet, cors, morgan, dotenv, dayjs

## Project Structure (suggested)

```
R00m5BE/
  src/
    server.js
    // routes/
    // controllers/
    // models/
    // middleware/
    // utils/
  .env
  package.json
  README.md
```

## Notes

- Ensure MONGODB_URI is reachable before starting.
- Update JWT_SECRET in production.
- Add routes/controllers/models under src as needed.

## License

ISC (see package.json)
