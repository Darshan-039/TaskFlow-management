# TaskFlow — REST API with Auth

A full-stack task manager with JWT authentication, role-based access control (user/admin), and a React frontend.


## Tech Stack

Backend    | Node.js, Express.js               
Database   | MongoDB + Mongoose                
Auth       | JWT + bcryptjs                    
Validation | express-validator                 
Security   | helmet, cors, express-rate-limit  
Frontend   | React.js, Axios                   



## Project Structure


```
project/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, error handler
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   ├── utils/        # JWT helpers, response helpers
│   │   ├── validators/   # Input validation rules
│   │   └── server.js     # Entry point
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance
    │   ├── context/      # Auth context (React)
    │   ├── pages/        # Login, Register, Dashboard
    │   ├── App.js
    │   └── App.css
    └── package.json
```


## Setup Instructions


### 1. Backend Setup

<!-- bash -->
cd backend
npm install


# Edit .env and set your MONGO_URI and JWT_SECRET


Start the server:
<!--bash -->
npm run dev     
npm start   

Server runs at: `http://localhost:5000`

---

### 2. Frontend Setup

<!-- bash -->
cd frontend
npm install
npm start

Frontend runs at: `http://localhost:3000`

---

## API Reference (v1)

### Base URL
```
http://localhost:5000/api/v1
```

### Auth Endpoints

Method | Endpoint           | Access  | Description        |
       |                    |         |                    |
POST   | /auth/register     | Public  | Register new user  |
POST   | /auth/login        | Public  | Login, get JWT     |
GET    | /auth/me           | Private | Get own profile    |

### Task Endpoints

Method | Endpoint      | Access     | Description             |
       |               |            |                         |
GET    | /tasks        | Private    | Get tasks (own/all)     |
POST   | /tasks        | Private    | Create a task           |
GET    | /tasks/:id    | Private    | Get single task         |
PUT    | /tasks/:id    | Private    | Update a task           |
DELETE | /tasks/:id    | Private    | Delete a task           |

### Admin Endpoints

| Method | Endpoint       | Access | Description      |
|        |                |        |                  |
| GET    | /admin/users   | Admin  | List all users   |







## Roles

| Role  | Capabilities                                      |
|       |                                                   |
| user  | CRUD on own tasks only                            |
| admin | CRUD on all tasks + view all users                |

To create an admin: manually update `role` field in MongoDB for a user.

---

---

