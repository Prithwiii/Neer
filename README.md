# Neer

Neer is a full-stack community living platform built for residential and apartment management. It combines a React frontend with an Express + MongoDB backend to help residents manage communication, maintenance, access, billing, and shared services from a single application.

The project includes modules for proposals, resource management, garage bookings, lost-and-found items, maintenance requests, intercom messaging, bills, flat info, house help, and alert tracking.

## Features

- Resident proposal and request management
- Resource and inventory tracking
- Garage booking and access flows
- Building layout and contact directory data
- Lost and found reporting
- Family expense tracking
- Maintenance and repair workflows
- Intercom and messaging features
- Notice and alert broadcasting
- Camera and monitoring support
- Live socket-based updates
- MongoDB-powered persistence

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Real-time communication: Socket.io
- Authentication: JWT + cookie-based auth support
- Live communication/voice stack: LiveKit SDK
- Styling: custom CSS and frontend components

## Project Structure

```text
.
├── client/               # React frontend application
│   ├── src/              # UI source files
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies and scripts
│   ├── vite.config.js    # Vite configuration
│   └── index.html        # Frontend entry HTML
├── server/               # Express backend application
│   ├── config/           # DB and socket configuration
│   ├── controller/       # Business logic controllers
│   ├── middleware/       # Auth and request middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API endpoints
│   ├── services/         # Background services and integrations
│   ├── utils/            # Helper utilities
│   ├── app.js            # Express app setup
│   ├── server.js         # Server bootstrap and route registration
│   ├── package.json      # Backend dependencies and scripts
│   └── .env.example      # Sample server environment file
├── package.json          # Root dependency file
├── .gitignore            # Git ignore rules
├── package-lock.json     # Lockfile
└── README.md             # Project documentation
```

## Backend Modules

The backend exposes API groups such as:

- `/api/proposals`
- `/api/resources`
- `/api/bookings`
- `/api/notices`
- `/api/maintenance`
- `/api/intercom`
- `/api/bills`
- `/api/building-layout`
- `/api/garages`
- `/api/garage-bookings`
- `/api/flats`
- `/api/househelp`
- `/api/family-expenses`
- `/api/lost-found`
- `/api/cameras`
- `/api/messages`
- `/api/alerts`

These routes suggest a neighborhood management system covering resident communication, building operations, maintenance, and services.

## Prerequisites

Before running the project, ensure you have:

- Node.js 18+
- npm
- MongoDB running locally or configured via MongoDB Atlas
- A `.env` file for backend configuration

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Prithwiii/Neer.git
cd Neer
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Create a `.env` file in `server/` using `.env.example` as a template. Configure the MongoDB connection and any required service credentials.

### 5. Start the backend

```bash
cd server
npm run dev
```

The backend listens on the default port:

```text
http://localhost:5000
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

Then open the local Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

## Useful Scripts

### Backend

```bash
npm run start
npm run dev
npm run seed
npm run seed:garages
npm run seed:layout
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Notes

This repository appears to be a property/community solution that supports apartment residents with operational workflows, communication channels, and building management tools. The backend uses Socket.io for real-time updates, while the frontend is a Vite-powered React app suitable for a modular, dashboard-driven user experience.

## License

This project does not currently declare a license in the repository root. Please check with the project owner before reusing or distributing the code in a production environment.

## Contributing

Contributions are welcome. If you would like to improve or extend the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear summary
