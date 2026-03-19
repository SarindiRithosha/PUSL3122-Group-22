# FurniPlan — Web-Based Furniture Design and Visualisation System

## Overview
FurniPlan is a web-based application that allows furniture retailers and their customers to plan and visualise room layouts interactively. Designers (admins) can manage furniture, create room templates, and build 2D and 3D room designs. Customers can browse furniture, design their own rooms, visualise in 2D and 3D, and place orders.

## Group
PUSL3122 HCI, Computer Graphics and Visualisation - Group 22,
BSc (Hons) Software Engineering, University of Plymouth

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 7 |
| 3D Rendering | Three.js r183, React Three Fiber, @react-three/drei |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Authentication | JWT, bcryptjs |
| File Uploads | Multer |
| Testing | Jest 30, Supertest, mongodb-memory-server |

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)

### Installation

**Backend:**
```bash
cd server
npm install
npm start
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

### Running the Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Admin Setup
To create an initial admin account, run the seed script:
```bash
cd server
node scripts/seedAdmin.js
```

This will insert predefined admin credentials into the database.

## Testing
Run backend tests using:
```bash
cd server
npm test
```

## Features

### Admin Side
- Furniture Management — add, edit, delete, publish/unpublish furniture with 2D images and 3D models (GLB/OBJ)
- Room Template Management — create room templates with shape, dimensions, wall and floor colour palettes
- Design Workspace — 2D SVG canvas with drag, rotate, scale, collision detection, and 3D view via Three.js
- Design Library — manage and publish saved designs
- Customer Orders — view and update order status
- Analytics — revenue and order statistics dashboard

### Customer Side
- Furniture Catalogue — browse, search, and filter published furniture
- Furniture Detail — interactive 3D viewer with live colour tinting
- Room Selector — choose from published room templates
- Design Workspace — place furniture, customise, and visualise in 2D and 3D
- My Saved Designs — save, reload, and continue editing designs
- Cart and Checkout — add to cart and place orders
- My Account — profile, order history, saved designs, favorites

## 3D Models
3D furniture models used in this project were sourced from:
- [3dsky.org](https://3dsky.org)
- [Sketchfab.com](https://sketchfab.com)

All models were used for academic and non-commercial purposes only. Please refer to the individual licences on each source platform.

## Licence
This project was developed for academic purposes as part of the PUSL3122 module at the University of Plymouth. Not intended for commercial use.
