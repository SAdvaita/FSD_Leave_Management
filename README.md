# Leave Management System

A full-stack web application for managing employee leave requests with role-based access control, built with the MERN stack (MongoDB, Express, React, Node.js).

## 🎯 Project Overview

This Leave Management System allows employees to apply for leave and managers to review and act on leave requests. The system enforces leave balance validation and ensures complete data persistence using MongoDB.

## ✨ Features

- **JWT-based Authentication**: Secure user authentication with HTTP-only cookies
- **Role-Based Access Control**: Separate dashboards and permissions for employees and managers
- **Leave Balance Management**: Automatic tracking and validation of employee leave balances
- **Leave Request Workflow**: Apply, approve, and reject leave requests
- **Real-time Balance Updates**: Leave balances are automatically deducted upon approval
- **Responsive UI**: Modern, glassmorphism-styled interface with smooth animations
- **Data Persistence**: All data stored in MongoDB database

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **cookie-parser** - Cookie handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling with glassmorphism effects

## 👥 User Roles and Permissions

### EMPLOYEE
- ✅ Register and log in to the system
- ✅ Apply for leave with date range and reason
- ✅ View own leave requests and their status
- ✅ View personal leave balance
- ❌ Cannot approve/reject leave requests
- ❌ Cannot view other employees' data

### MANAGER
- ✅ Log in to the system
- ✅ View all leave requests from all employees
- ✅ Approve leave requests (with balance validation)
- ✅ Reject leave requests
- ✅ View all employees' leave balances
- ✅ Filter leave requests by status
- ❌ Cannot apply for leave (manager-specific role)

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/logout` | Protected | Logout user |
| GET | `/profile` | Protected | Get current user profile |

### Leave Routes (`/api/leaves`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/apply` | Employee | Apply for leave |
| GET | `/my-leaves` | Protected | Get own leave requests |
| GET | `/all` | Manager | Get all leave requests |
| PUT | `/:id/approve` | Manager | Approve leave request |
| PUT | `/:id/reject` | Manager | Reject leave request |

### Balance Routes (`/api/balance`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/my-balance` | Protected | Get own leave balance |
| GET | `/all` | Manager | Get all employees' balances |

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['employee', 'manager'], default: 'employee'),
  leaveBalance: Number (default: 20),
  createdAt: Date,
  updatedAt: Date
}
```

### Leave Model
```javascript
{
  employeeId: ObjectId (ref: User, required),
  startDate: Date (required),
  endDate: Date (required),
  numberOfDays: Number (auto-calculated),
  reason: String (required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/leave-management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start the backend server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8080/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📋 Business Rules

### Critical Validation Rules

1. **Leave Balance Validation on Application**:
   - When an employee applies for leave, the system checks if they have sufficient balance
   - If balance is insufficient, the request is rejected immediately
   - Error message shows available balance vs. requested days

2. **Leave Balance Validation on Approval**:
   - When a manager approves a leave request, the system validates balance again
   - This prevents race conditions if balance changed between application and approval
   - If balance is insufficient at approval time, the approval is rejected

3. **Automatic Balance Deduction**:
   - Leave balance is only deducted when a request is **approved**
   - Balance is NOT deducted when a request is pending or rejected
   - The deduction is atomic with the approval operation

4. **Leave Day Calculation**:
   - Number of days is automatically calculated from start and end dates
   - Both start and end dates are included in the count
   - Formula: `Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1`

## 🧪 Testing the Application

### Test Scenarios

1. **Register Users**:
   - Register an employee account
   - Register a manager account

2. **Employee Flow**:
   - Login as employee
   - View leave balance (should be 20 days initially)
   - Apply for leave (e.g., 5 days)
   - View leave request status (should be "pending")

3. **Manager Flow**:
   - Login as manager
   - View all leave requests
   - Approve the employee's leave request
   - Verify balance was deducted

4. **Balance Validation**:
   - As employee, try to apply for more days than available
   - Should receive error message about insufficient balance

5. **Edge Cases**:
   - Try to approve a request when employee has insufficient balance
   - Try to access manager routes as employee (should be forbidden)
   - Try to access employee routes as manager (should be forbidden)

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables on your hosting platform
2. Ensure MongoDB connection string is set correctly
3. Deploy the backend directory

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting platform
3. Set the `VITE_API_URL` environment variable to your backend URL

### MongoDB Setup (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update the `MONGO_URI` in your backend `.env` file

## 📁 Project Structure

```
leave-management-system/
├── backend/
│   ├── Controllers/
│   │   ├── authController.js
│   │   ├── leaveController.js
│   │   └── balanceController.js
│   ├── Database/
│   │   └── connection.js
│   ├── Middleware/
│   │   └── authMiddleware.js
│   ├── Models/
│   │   ├── userModel.js
│   │   └── leaveModel.js
│   ├── Routes/
│   │   ├── authRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── balanceRoutes.js
│   ├── Utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── EmployeeDashboard.jsx
    │   │   └── ManagerDashboard.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔒 Security Features

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens stored in HTTP-only cookies
- CORS configured for specific origins
- Role-based middleware protection on all sensitive routes
- Input validation on all API endpoints
- MongoDB injection prevention through Mongoose

## 🎨 UI Features

- Modern glassmorphism design
- Gradient backgrounds and smooth animations
- Responsive layout for mobile and desktop
- Color-coded status badges
- Real-time form validation
- Loading states and error handling
- Intuitive navigation and user feedback

## 📝 License

ISC

## 👨‍💻 Author

Created as a full-stack assignment demonstrating:
- RESTful API design
- JWT authentication
- Role-based access control
- Database modeling and relationships
- React state management
- Modern UI/UX principles

---

**Note**: This is a demonstration project. For production use, consider adding:
- Email notifications
- Password reset functionality
- Leave type categories
- Holiday calendar integration
- Audit logs
- Advanced reporting
- File attachments for leave requests
