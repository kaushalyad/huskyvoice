Leave Management App

This is a simple leave management web app.

Employees can register/login, apply for leave, and check the status of their requests (PENDING / APPROVED / REJECTED).

Employers can login, view all leave requests, and approve or reject them.

Tech used:
- Vue 3 + Vite + Tailwind (frontend)
- Node.js + Express (backend)
- MongoDB Atlas (Mongoose)
- JWT authentication with roles (EMPLOYEE, EMPLOYER)

Project folders:

backend/   -> Express API  
frontend/  -> Vue application  

Running locally

1. MongoDB

Create a MongoDB Atlas cluster and copy the connection string.

2. Backend

Go to backend folder

cd backend

Create a `.env` file and add:

MONGODB_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
CLIENT_URL=http://localhost:5173  

Install dependencies

npm install

Run the server

npm run dev

Backend will start on:

http://localhost:5000


3. Frontend

Go to frontend folder

cd frontend

Create `.env` file

VITE_API_URL=http://localhost:5000

Install dependencies

npm install

Start the app

npm run dev

Frontend will run on:

http://localhost:5173


API routes

Auth

POST /api/auth/register  
POST /api/auth/login  


Employee

POST /api/leaves       -> create leave request  
GET /api/leaves/my     -> get own leave requests  


Employer

GET /api/leaves  
PATCH /api/leaves/:id/approve  
PATCH /api/leaves/:id/reject  


