🎯 Project Overview
The Leave Management System is a full-stack MERN application designed to streamline employee leave management with role-based access control. The system provides separate dashboards for employees and managers, enabling efficient leave request workflows, attendance tracking, and profile management.
Key Highlights
•	Type: Full-Stack Web Application
•	Architecture: MERN Stack (MongoDB, Express.js, React, Node.js)
•	Authentication: JWT-based with HTTP-only cookies
•	Database: MongoDB Atlas (Cloud Database)
•	Frontend Build Tool: Vite
•	Styling: Modern CSS3 with Glassmorphism effects
________________________________________
✨ Complete Feature List
🔐 Authentication & Authorization
1.	User Registration
•	Register as Employee or Manager
•	Email validation and uniqueness check
•	Password hashing with bcrypt (10 salt rounds)
•	Automatic leave balance initialization (20 days)
2.	User Login
•	Secure JWT token generation
•	HTTP-only cookie storage
•	Role-based dashboard redirection
•	Session persistence
3.	User Logout
•	Token invalidation
•	Cookie clearing
•	Secure session termination
4.	Profile Management
•	View user profile information
•	Upload/update profile picture
•	File upload with Multer
•	Image storage in /uploads directory
📝 Leave Management System
5.	Apply for Leave (Employee)
•	Date range selection (start date to end date)
•	Automatic day calculation
•	Leave reason input
•	Real-time balance validation
•	Insufficient balance error handling
6.	View My Leave Requests (Employee)
•	List all personal leave requests
•	Status tracking (Pending, Approved, Rejected)
•	Date range display
•	Reviewer information
7.	View Leave Balance (Employee)
•	Current available leave days
•	Real-time balance updates
•	Balance deduction on approval
8.	View All Leave Requests (Manager)
•	Complete list of all employee requests
•	Employee information display
•	Filter by status (pending/approved/rejected)
•	Sort by creation date
9.	Approve Leave Requests (Manager)
•	Balance validation before approval
•	Automatic balance deduction
•	Reviewer tracking
•	Timestamp recording
•	Prevent duplicate approvals
10.	Reject Leave Requests (Manager)
•	Rejection with reason tracking
•	No balance deduction
•	Reviewer information
•	Status update
11.	View All Employee Balances (Manager)
•	Complete employee leave balance overview
•	Real-time balance tracking
•	Employee details display
⏰ Attendance Management System
12.	Clock In (Employee)
•	Daily clock-in functionality
•	Timestamp recording
•	Duplicate prevention (one clock-in per day)
•	Automatic date tracking
13.	Clock Out (Employee)
•	Daily clock-out functionality
•	Automatic work hours calculation
•	Total hours display
•	Validation (must clock in first)
14.	View Attendance Status (Employee)
•	Current day status check
•	Clock-in/out status display
•	Real-time attendance information
15.	View Attendance History (Employee)
•	Last 30 days attendance records
•	Clock-in/out times
•	Total hours worked per day
•	Date-wise sorted display
16.	View All Employee Attendance (Manager)
•	Today's attendance overview
•	All employees' clock-in/out status
•	Employee information display
•	Real-time attendance monitoring
🎨 UI/UX Features
17.	Modern Glassmorphism Design
•	Gradient backgrounds
•	Blur effects and transparency
•	Smooth animations and transitions
•	Color-coded status badges
18.	Responsive Layout
•	Mobile-friendly design
•	Tablet optimization
•	Desktop full-screen support
19.	Interactive Components
•	Hover effects
•	Loading states
•	Error notifications
•	Success messages
20.	Form Validation
•	Real-time input validation
•	Error message display
•	Required field indicators
________________________________________
🛠️ Tech Stack & Libraries
Backend Technologies
Technology	Version	Purpose
Node.js	Latest	JavaScript runtime environment
Express.js	^4.18.2	Web application framework
MongoDB	Cloud Atlas	NoSQL database
Mongoose	^8.0.3	MongoDB ODM (Object Data Modeling)
Backend Dependencies
json
{
  "bcrypt": "^5.1.1",           // Password hashing
  "cookie-parser": "^1.4.6",    // Cookie parsing middleware
  "cors": "^2.8.5",             // Cross-Origin Resource Sharing
  "dotenv": "^16.4.5",          // Environment variable management
  "express": "^4.18.2",         // Web framework
  "jsonwebtoken": "^9.0.2",     // JWT authentication
  "mongoose": "^8.0.3",         // MongoDB ODM
  "multer": "^2.0.2"            // File upload handling
}
Backend Dev Dependencies
json
{
  "nodemon": "^3.0.2"           // Auto-restart development server
}
Frontend Technologies
Technology	Version	Purpose
React	^18.2.0	UI library
Vite	^5.0.8	Build tool and dev server
React Router DOM	^6.20.1	Client-side routing
Axios	^1.6.2	HTTP client for API calls
Frontend Dependencies
json
{
  "react": "^18.2.0",           // UI library
  "react-dom": "^18.2.0",       // React DOM rendering
  "react-router-dom": "^6.20.1", // Routing
  "axios": "^1.6.2"             // HTTP client
}
Frontend Dev Dependencies
json
{
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8"
}
Additional Technologies
•	Context API: Global state management
•	CSS3: Modern styling with custom properties
•	ES6+ Modules: Modern JavaScript syntax
•	HTTP-only Cookies: Secure token storage
________________________________________
👥 User Roles & Permissions
EMPLOYEE Role
✅ Allowed Actions
1.	Authentication
•	Register new account
•	Login to system
•	Logout from system
•	View own profile
2.	Leave Management
•	Apply for leave with date range and reason
•	View own leave requests
•	View leave request status (pending/approved/rejected)
•	View personal leave balance
•	See reviewer information on processed requests
3.	Attendance Management
•	Clock in daily
•	Clock out daily
•	View today's attendance status
•	View attendance history (last 30 days)
•	See total hours worked
4.	Profile Management
•	Upload profile picture
•	Update profile picture
•	View profile information
❌ Restricted Actions
•	Cannot approve/reject leave requests
•	Cannot view other employees' leave requests
•	Cannot view other employees' leave balances
•	Cannot view all employees' attendance
•	Cannot access manager dashboard
•	Cannot modify other users' data
MANAGER Role
✅ Allowed Actions
1.	Authentication
•	Login to system
•	Logout from system
•	View own profile
2.	Leave Management
•	View all leave requests from all employees
•	Approve leave requests (with balance validation)
•	Reject leave requests
•	View all employees' leave balances
•	Filter leave requests by status
•	See employee details for each request
3.	Attendance Management
•	View all employees' attendance for today
•	See clock-in/out status of all employees
•	Monitor employee attendance
4.	Profile Management
•	Upload profile picture
•	Update profile picture
❌ Restricted Actions
•	Cannot apply for leave (manager-specific role)
•	Cannot access employee dashboard
•	Cannot clock in/out (manager role limitation)
________________________________________
📡 API Endpoints
Base URL
•	Development: http://localhost:8080/api
•	Production: Your deployed backend URL
1. Authentication Routes (/api/auth)
Method	Endpoint	Access	Description	Request Body	Response
POST	/register	Public	Register new user	{ name, email, password, role }	User object + JWT cookie
POST	/login	Public	Login user	{ email, password }	User object + JWT cookie
GET	/logout	Protected	Logout user	None	Success message
GET	/profile	Protected	Get current user profile	None	User object (no password)
Example Request - Register
javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"  // or "manager"
}
Example Response - Register
javascript
{
  "message": "User registered successfully",
  "user": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "leaveBalance": 20,
    "profilePicture": ""
  }
}
2. Leave Routes (/api/leaves)
Method	Endpoint	Access	Description	Request Body	Response
POST	/apply	Employee	Apply for leave	{ startDate, endDate, reason }	Leave object
GET	/my-leaves	Protected	Get own leave requests	None	Array of leave objects
GET	/all	Manager	Get all leave requests	Query: ?status=pending	Array of leave objects
PUT	/:id/approve	Manager	Approve leave request	None	Updated leave + balance
PUT	/:id/reject	Manager	Reject leave request	None	Updated leave object
Example Request - Apply Leave
javascript
POST /api/leaves/apply
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-05",
  "reason": "Family vacation"
}
Example Response - Apply Leave
javascript
{
  "message": "Leave request submitted successfully",
  "leave": {
    "_id": "65xyz789...",
    "employeeId": {
      "_id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-03-05T00:00:00.000Z",
    "numberOfDays": 5,
    "reason": "Family vacation",
    "status": "pending",
    "createdAt": "2026-02-17T03:02:40.000Z"
  }
}
3. Balance Routes (/api/balance)
Method	Endpoint	Access	Description	Request Body	Response
GET	/my-balance	Protected	Get own leave balance	None	Balance object
GET	/all	Manager	Get all employees' balances	None	Array of user balances
Example Response - My Balance
javascript
{
  "balance": 15,
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
4. Attendance Routes (/api/attendance)
Method	Endpoint	Access	Description	Request Body	Response
POST	/clock-in	Employee	Clock in for the day	None	Attendance object
POST	/clock-out	Employee	Clock out for the day	None	Updated attendance
GET	/status	Employee	Get today's attendance status	None	Status object
GET	/history	Employee	Get attendance history (30 days)	None	Array of attendance
GET	/all	Manager	Get all employees' attendance today	None	Array of attendance
Example Response - Clock In
javascript
{
  "message": "Clocked in successfully!",
  "attendance": {
    "_id": "65def456...",
    "employeeId": "65abc123...",
    "date": "2026-02-17T00:00:00.000Z",
    "clockIn": "2026-02-17T03:02:40.000Z",
    "status": "present"
  }
}
Example Response - Clock Out
javascript
{
  "message": "Clocked out successfully!",
  "attendance": {
    "_id": "65def456...",
    "employeeId": "65abc123...",
    "date": "2026-02-17T00:00:00.000Z",
    "clockIn": "2026-02-17T03:02:40.000Z",
    "clockOut": "2026-02-17T11:30:15.000Z",
    "totalHours": 8.46,
    "status": "present"
  }
}
5. Profile Routes (/api/profile)
Method	Endpoint	Access	Description	Request Body	Response
POST	/upload	Protected	Upload profile picture	FormData with image file	Updated user object
Example Request - Upload Profile Picture
javascript
POST /api/profile/upload
Content-Type: multipart/form-data
FormData: {
  profilePicture: [File]
}
________________________________________
🗄️ Database Schema
Database Information
•	Database Name: fsd_Leave_management
•	Database Type: MongoDB (Cloud - MongoDB Atlas)
•	Connection: Mongoose ODM
•	Total Collections: 3
1. User Collection (users)
javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  name: String,                     // Required, trimmed
  email: String,                    // Required, unique, lowercase, trimmed
  password: String,                 // Required, hashed with bcrypt, min 6 chars
  role: String,                     // Enum: ['employee', 'manager'], default: 'employee'
  leaveBalance: Number,             // Default: 20
  profilePicture: String,           // File path, default: ''
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-updated timestamp
}
Indexes
•	email: Unique index for fast lookup and uniqueness
Pre-save Middleware
•	Password hashing with bcrypt (10 salt rounds)
Instance Methods
•	comparePassword(candidatePassword): Compare plain password with hashed password
Example Document
javascript
{
  "_id": "65abc123def456...",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$abcdef...",  // Hashed
  "role": "employee",
  "leaveBalance": 15,
  "profilePicture": "uploads/profile-1708142560123.jpg",
  "createdAt": "2026-02-01T10:00:00.000Z",
  "updatedAt": "2026-02-17T03:02:40.000Z"
}
2. Leave Collection (leaves)
javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  employeeId: ObjectId,             // Reference to User, required
  startDate: Date,                  // Required
  endDate: Date,                    // Required
  numberOfDays: Number,             // Auto-calculated, required
  reason: String,                   // Required, trimmed
  status: String,                   // Enum: ['pending', 'approved', 'rejected'], default: 'pending'
  reviewedBy: ObjectId,             // Reference to User (manager)
  reviewedAt: Date,                 // Timestamp when reviewed
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-updated timestamp
}
Relationships
•	employeeId → References users collection
•	reviewedBy → References users collection
Pre-save Middleware
•	Automatic calculation of numberOfDays from date range
•	Formula: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
Example Document
javascript
{
  "_id": "65xyz789abc012...",
  "employeeId": "65abc123def456...",
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-03-05T00:00:00.000Z",
  "numberOfDays": 5,
  "reason": "Family vacation",
  "status": "approved",
  "reviewedBy": "65manager123...",
  "reviewedAt": "2026-02-18T10:30:00.000Z",
  "createdAt": "2026-02-17T03:02:40.000Z",
  "updatedAt": "2026-02-18T10:30:00.000Z"
}
3. Attendance Collection (attendances)
javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  employeeId: ObjectId,             // Reference to User, required
  date: Date,                       // Required, default: Date.now
  clockIn: Date,                    // Clock-in timestamp
  clockOut: Date,                   // Clock-out timestamp
  status: String,                   // Enum: ['present', 'absent', 'half-day'], default: 'present'
  location: String,                 // Default: 'Office'
  totalHours: Number,               // Auto-calculated, default: 0
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-updated timestamp
}
Relationships
•	employeeId → References users collection
Indexes
•	Compound unique index: { employeeId: 1, date: 1 } (prevents duplicate attendance for same day)
Business Logic
•	totalHours calculated as: 
(clockOut - clockIn) / (1000 * 60 * 60) in hours
Example Document
javascript
{
  "_id": "65def456ghi789...",
  "employeeId": "65abc123def456...",
  "date": "2026-02-17T00:00:00.000Z",
  "clockIn": "2026-02-17T03:02:40.000Z",
  "clockOut": "2026-02-17T11:30:15.000Z",
  "status": "present",
  "location": "Office",
  "totalHours": 8.46,
  "createdAt": "2026-02-17T03:02:40.000Z",
  "updatedAt": "2026-02-17T11:30:15.000Z"
}
________________________________________
🏗️ Project Architecture
Backend Structure
backend/
├── Controllers/              # Business logic handlers
│   ├── authController.js     # 4 functions: register, login, logout, getProfile
│   ├── leaveController.js    # 5 functions: apply, getMyLeaves, getAllLeaves, approve, reject
│   ├── balanceController.js  # 2 functions: getMyBalance, getAllBalances
│   ├── attendanceController.js # 5 functions: clockIn, clockOut, getStatus, getMyHistory, getAllAttendance
│   └── profileController.js  # 1 function: uploadProfilePicture
│
├── Database/
│   └── connection.js         # MongoDB connection setup
│
├── Middleware/
│   ├── authMiddleware.js     # JWT verification & role checking
│   └── uploadMiddleware.js   # Multer file upload configuration
│
├── Models/                   # Mongoose schemas
│   ├── userModel.js          # User schema with password hashing
│   ├── leaveModel.js         # Leave schema with day calculation
│   └── Attendance.js         # Attendance schema with unique index
│
├── Routes/                   # API route definitions
│   ├── authRoutes.js         # 4 endpoints
│   ├── leaveRoutes.js        # 5 endpoints
│   ├── balanceRoutes.js      # 2 endpoints
│   ├── attendanceRoutes.js   # 5 endpoints
│   └── profileRoutes.js      # 1 endpoint
│
├── Utils/
│   └── generateToken.js      # JWT token generation utility
│
├── uploads/                  # Profile picture storage
├── .env                      # Environment variables
├── .env.example              # Environment template
├── index.js                  # Express server entry point
└── package.json              # Dependencies
Frontend Structure
frontend/
├── public/                   # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   └── [Component files]
│   │
│   ├── context/              # React Context for state management
│   │   └── AuthContext.jsx  # Global auth state
│   │
│   ├── pages/                # Page components
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── EmployeeDashboard.jsx  # Employee dashboard (28KB)
│   │   └── ManagerDashboard.jsx   # Manager dashboard (18KB)
│   │
│   ├── styles/               # Additional CSS modules
│   │   └── [Style files]
│   │
│   ├── utils/                # Utility functions
│   │   └── api.js            # Axios instance & API calls
│   │
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles (13.6KB)
│
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
API Controllers Summary
Controller	Functions	Total Endpoints
authController	4	4
leaveController	5	5
balanceController	2	2
attendanceController	5	5
profileController	1	1
TOTAL	17	17
Middleware Components
1.	authMiddleware.js
•	protect: Verifies JWT token
•	employeeOnly: Restricts to employee role
•	managerOnly: Restricts to manager role
2.	uploadMiddleware.js
•	Multer configuration for file uploads
•	Destination: uploads/ directory
•	File naming: profile-{timestamp}-{originalname}
________________________________________
🌐 Deployment Information
Current Deployment Status
Backend
•	Status: Running locally
•	Development URL: http://localhost:8080
•	Production URL: Not yet deployed
•	Recommended Platforms:
•	Render (Free tier available)
•	Railway (Free tier available)
•	Heroku (Paid)
•	AWS EC2 (Scalable)
•	DigitalOcean (Droplet)
Frontend
•	Status: Running locally
•	Development URL: http://localhost:5173
•	Production URL: Not yet deployed
•	Recommended Platforms:
•	Vercel (Free tier, recommended)
•	Netlify (Free tier)
•	GitHub Pages (Static hosting)
•	AWS S3 + CloudFront
Database
•	Status: ✅ Deployed (Cloud)
•	Platform: MongoDB Atlas
•	Connection: mongodb+srv://e0223009_db:***@cluster0.gv21p66.mongodb.net/fsd_Leave_management
•	Cluster: Cluster0
•	Region: Cloud-hosted
Deployment Checklist
For Backend Deployment
1.	Set environment variables on hosting platform:
PORT=8080
MONGO_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=<your_secret_key>
NODE_ENV=production
FRONTEND_URL=<your_deployed_frontend_url>
2.	Update CORS settings in production
3.	Ensure MongoDB Atlas IP whitelist includes hosting platform
4.	Set up file upload storage (consider cloud storage like AWS S3)
For Frontend Deployment
1.	Build the production bundle:
bash
npm run build
2.	Set environment variable:
VITE_API_URL=<your_deployed_backend_url>/api
3.	Deploy the dist folder
4.	Configure redirects for React Router (SPA)
Environment Variables
Backend (.env)
env
PORT=8080
MONGO_URI=mongodb+srv://e0223009_db:***@cluster0.gv21p66.mongodb.net/fsd_Leave_management
JWT_SECRET=f9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d9e8
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
Frontend (.env)
env
VITE_API_URL=http://localhost:8080/api
Quick Deployment Guide
Deploy to Vercel (Frontend)
bash
cd frontend
npm run build
vercel --prod
Deploy to Render (Backend)
1.	Connect GitHub repository
2.	Select backend directory
3.	Set build command: npm install
4.	Set start command: npm start
5.	Add environment variables
6.	Deploy
________________________________________
📊 Project Statistics
Code Metrics
•	Total API Endpoints: 17
•	Total Controllers: 5
•	Total Models: 3
•	Total Routes: 5
•	Total Middleware: 2
•	Backend Dependencies: 8
•	Frontend Dependencies: 4
File Sizes
•	Employee Dashboard: 28.5 KB
•	Manager Dashboard: 18 KB
•	Global Styles: 13.6 KB
•	Auth Controller: 3.7 KB
•	Leave Controller: 5.6 KB
•	Attendance Controller: 4.3 KB
Database Collections
•	Users: Dynamic (grows with registrations)
•	Leaves: Dynamic (grows with applications)
•	Attendances: Dynamic (grows daily)
________________________________________
🔒 Security Features
1.	Password Security
•	Bcrypt hashing with 10 salt rounds
•	Passwords never stored in plain text
•	Password comparison using bcrypt
2.	Authentication
•	JWT tokens with secure secret
•	HTTP-only cookies (XSS protection)
•	Token expiration (configurable)
3.	Authorization
•	Role-based access control
•	Protected routes with middleware
•	Employee/Manager separation
4.	Input Validation
•	Required field validation
•	Email format validation
•	Date range validation
•	Balance validation
5.	Database Security
•	Mongoose schema validation
•	MongoDB injection prevention
•	Unique indexes for data integrity
6.	CORS Configuration
•	Specific origin allowlist
•	Credentials support
•	Secure cross-origin requests
________________________________________
🎨 UI/UX Design Features
Design System
•	Color Palette: Gradient-based (purple, pink, blue)
•	Typography: Modern sans-serif fonts
•	Layout: Flexbox and Grid-based
•	Spacing: Consistent padding and margins
Visual Effects
1.	Glassmorphism
•	Backdrop blur effects
•	Semi-transparent backgrounds
•	Border gradients
2.	Animations
•	Smooth transitions (0.3s ease)
•	Hover effects on buttons
•	Loading states
•	Fade-in animations
3.	Status Indicators
•	Color-coded badges
•	Pending: Yellow/Orange
•	Approved: Green
•	Rejected: Red
Responsive Breakpoints
•	Mobile: < 768px
•	Tablet: 768px - 1024px
•	Desktop: > 1024px
________________________________________
📝 Business Rules & Validation
Leave Management Rules
1.	Application Validation
•	Start date must be before or equal to end date
•	Must have sufficient leave balance
•	Minimum 1 day leave required
2.	Approval Validation
•	Only pending requests can be approved
•	Balance re-validated at approval time
•	Balance deducted only on approval
3.	Balance Calculation
•	Initial balance: 20 days
•	Deduction formula: Current balance - Number of days
•	No negative balances allowed
Attendance Rules
1.	Clock-in Rules
•	One clock-in per day
•	Cannot clock in twice
•	Automatic date tracking
2.	Clock-out Rules
•	Must clock in first
•	One clock-out per day
•	Automatic hours calculation
3.	Hours Calculation
•	Formula: (clockOut - clockIn) / (1000 * 60 * 60)
•	Rounded to 2 decimal places
________________________________________
🚀 Getting Started
Prerequisites
•	Node.js v14 or higher
•	MongoDB Atlas account (or local MongoDB)
•	npm or yarn package manager
Installation Steps
1.	Clone the repository
bash
git clone <repository-url>
cd leave-management-system_FSD
2.	Backend Setup
bash
cd backend
npm install
# Create .env file with required variables
npm run dev
3.	Frontend Setup
bash
cd frontend
npm install
npm run dev
4.	Access the application
•	Frontend: http://localhost:5173
•	Backend: http://localhost:8080
