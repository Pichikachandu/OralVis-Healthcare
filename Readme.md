# 🦷 OralVis Healthcare

<div align="center">
  <p>
    A modern, full-stack dental healthcare management platform providing seamless image submission, annotation, and report generation for dental professionals and patients.
  </p>
  <p>
    <a href="#">
      <img src="https://img.shields.io/badge/React-18.x-blue" alt="React Version">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen" alt="Node.js Version">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248" alt="MongoDB Version">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
    </a>
  </p>
</div>

---

## ✨ Features

### 🎨 Frontend Features
- **Responsive Design**: Optimized for both desktop and mobile devices
- **User Authentication**: Secure login and registration with JWT
- **Role-Based Access Control**: Separate interfaces for patients and administrators
- **Image Upload**: Upload dental images (upper, front, lower jaw)
- **Annotation Tools**: Interactive tools for dental professionals to annotate images
- **PDF Generation**: Generate and download detailed dental reports
- **Submission History**: View and manage previous submissions

### 🔐 Backend Features
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Patient & Admin roles
- **RESTful API**: Clean and comprehensive API endpoints
- **Image Management**: Secure file uploads with AWS S3 integration
- **Annotation System**: Real-time annotation tools with multiple types (rectangles, circles, arrows, freehand, text)
- **PDF Report Generation**: Dynamic report generation with customizable templates
- **MongoDB Database**: Optimized queries and data validation

---

## 🏗️ Project Structure

```
oralvis-app/
├── frontend/                 # React-based frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context for state management
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # Global styles
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main application component
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── package.json        # Frontend dependencies
│
└── backend/                 # Node.js/Express backend application
    ├── config/             # Configuration files (database, AWS S3)
    ├── controllers/        # Route controllers
    ├── middleware/         # Custom middleware (auth, upload)
    ├── models/            # Mongoose models
    ├── routes/            # API routes
    ├── scripts/           # Utility scripts
    ├── .env               # Environment variables
    ├── index.js           # Express app configuration
    └── package.json       # Backend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local or Atlas)
- **AWS S3 bucket** with appropriate permissions
- **AWS IAM credentials** with S3 access

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/Pichikachandu/OralVis-Healthcare.git
cd oralvis-app
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env
```

**Required Backend Environment Variables:**
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/oralvis

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Start the Backend:**
```bash
npm run dev    # Development mode
npm start      # Production mode
```

The backend will be available at `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
```

**Start the Frontend:**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

---

## 🛠️ Available Scripts

### Frontend Scripts
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (use with caution)

### Backend Scripts
- `npm run dev`: Runs the server in development mode with hot-reload
- `npm start`: Runs the server in production mode
- `npm test`: Launches the test runner
- `npm run lint`: Runs ESLint
- `npm run lint:fix`: Fixes linting issues automatically

---

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Frontend**: Tokens are stored in localStorage and included in API requests via axios interceptor
- **Backend**: JWT tokens are generated on login and verified on protected routes
- **Token Expiration**: 30 days (configurable)
- **Password Security**: Passwords are hashed using bcrypt

### User Roles
- **Patient**: Can submit images, view their own submissions
- **Admin**: Can view all submissions, add annotations, generate reports

---

## 🌐 API Integration

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Submissions:**
- `GET /api/submissions` - Get all submissions (admin only)
- `GET /api/submissions/own` - Get user's submissions
- `POST /api/submissions` - Create new submission
- `PUT /api/submissions/:id/annotate` - Add annotations
- `POST /api/submissions/:id/generate-pdf` - Generate PDF report

**Health Check:**
- `GET /api/health` - API health status

For detailed API documentation, see [backend/README.md](backend/README.md)

---

## 🎨 Frontend Technologies

- **React**: UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **JWT**: Token-based authentication
- **React Router**: Client-side routing

## ⚙️ Backend Technologies

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **AWS S3**: Image storage
- **PDFKit**: PDF generation
- **JWT**: Authentication
- **Bcrypt**: Password hashing

---

## 📁 Directory Structure Details

### Frontend Structure
```
frontend/src/
├── components/         # Reusable components
│   ├── AnnotationCanvas.js
│   ├── Login.js
│   ├── Register.js
│   ├── UploadForm.js
│   ├── LoadingSpinner.js
│   └── ... (other components)
├── pages/             # Page components
│   ├── Home.js
│   ├── AdminDashboard.js
│   ├── PatientDashboard.js
│   ├── SubmissionDetail.js
│   └── AllCases.js
├── services/          # API integration
│   └── api.js
├── context/           # React context
│   └── AuthContext.js
├── hooks/             # Custom hooks
│   └── useAuth.js
├── styles/            # Global styles
└── utils/             # Utilities
```

### Backend Structure
```
backend/
├── config/           # Configuration
│   ├── db.js        # MongoDB connection
│   └── s3.js        # AWS S3 configuration
├── controllers/      # Route handlers
├── middleware/       # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API routes
└── scripts/         # Utility scripts
```

---

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
```
The build artifacts will be stored in the `build/` directory. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment
See [backend/README.md](backend/README.md) for detailed deployment instructions including:
- PM2 process management
- Nginx configuration
- SSL with Let's Encrypt
- Production environment setup

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Dependencies**: Keep all packages updated (`npm audit`, `npm update`)
3. **API Security**: 
   - CORS enabled only for trusted domains
   - Rate limiting enabled
   - Input validation and sanitization
4. **Password Security**: Passwords hashed with bcrypt
5. **AWS Configuration**: Use IAM roles for S3 access when possible

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

For issues, questions, or suggestions, please open an issue in the repository.

**Developed by**: Pichikachandu
**Email**: chandupichika0@gmail.com