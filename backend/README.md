# 🦷 OralVis Healthcare - Backend

<div align="center">
  <p>
    <a href="#">
      <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen" alt="Node.js Version">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Express-4.x-lightgrey" alt="Express Version">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248" alt="MongoDB Version">
    </a>
  </p>
</div>

A high-performance, secure, and scalable backend for the OralVis Healthcare platform, built with Node.js and Express. This backend powers the entire dental care management system, handling everything from user authentication to complex dental image processing.

## 🌟 Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Patient & Admin roles)
- Secure password hashing with bcrypt
- Token refresh mechanism

### 📱 API Endpoints
- RESTful API design following best practices
- Comprehensive error handling
- Request validation
- Rate limiting and security headers

### 🖼️ Image Management
- Secure file uploads with validation
- Support for multiple image types (JPEG, PNG)
- Image processing and optimization
- AWS S3 integration for reliable storage

### ✏️ Annotation System
- Real-time annotation tools
- Support for multiple annotation types:
  - Rectangles
  - Circles
  - Arrows
  - Freehand drawing
  - Text labels
- Version history for annotations

### 📄 Report Generation
- Dynamic PDF report generation
- Customizable report templates
- Integration with patient data
- Secure document storage and retrieval

### 📊 Database
- MongoDB with Mongoose ODM
- Optimized queries for performance
- Data validation and sanitization
- Automated backups

## 🏆 Why Choose OralVis Backend?

- **Scalable**: Built to handle thousands of concurrent users
- **Secure**: Industry-standard security practices
- **Maintainable**: Clean, well-documented codebase
- **Extensible**: Modular architecture for easy feature additions
- **Well-Tested**: Comprehensive test coverage

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or Atlas)
- AWS S3 bucket with appropriate permissions
- AWS IAM credentials with S3 access

## 🚀 Quick Start

### Prerequisites Verification
Before starting, ensure you have the following installed:

```bash
# Check Node.js and npm versions
node --version  # Requires v16 or higher
npm --version   # Requires v8 or higher

# Verify MongoDB is running (if using local instance)
mongod --version
```

### Installation Steps

1. **Clone the Repository**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/oralvis-app.git
   
   # Navigate to backend directory
   cd oralvis-app/backend
   ```

2. **Install Dependencies**
   ```bash
   # Install all required packages
   npm install
   
   # For production
   npm ci --only=production
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # ================
   # Server Configuration
   # ================
   PORT=5000
   NODE_ENV=development
   
   # ================
   # Database (MongoDB)
   # ================
   # Local MongoDB
   # MONGO_URI=mongodb://localhost:27017/oralvis
   
   # MongoDB Atlas
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/oralvis?retryWrites=true&w=majority
   
   # ================
   # Authentication (JWT)
   # ================
   JWT_SECRET=generate_a_strong_secret_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   
   # ================
   # AWS S3 Configuration
   # ================
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   S3_BUCKET=your_s3_bucket_name
   S3_REGION=us-east-1  # Update with your region
   S3_ENDPOINT=         # Optional: For non-AWS S3 compatible storage
   
   # ================
   # CORS & Security
   # ================
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=15*60*1000  # 15 minutes
   RATE_LIMIT_MAX=100  # 100 requests per window
   
   # ================
   # Development Settings
   # ================
   DEBUG=oralvis:*     # Enable debug logging
   NODE_TLS_REJECT_UNAUTHORIZED=0  # For development with self-signed certificates
   ```

4. **Start the Application**
   ```bash
   # Development mode with hot-reload
   npm run dev
   
   # Production mode
   npm start
   
   # Debug mode
   npm run debug
   ```

5. **Verify Installation**
   ```bash
   # Check if the server is running
   curl http://localhost:5000/api/health
   
   # Expected response:
   # {"status":"ok","timestamp":"2023-01-01T00:00:00.000Z"}
   ```

### Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Build the Docker image
docker build -t oralvis-backend .

# Run the container
docker run -p 5000:5000 --env-file .env oralvis-backend
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Port to run the server on |
| `NODE_ENV` | No | development | Node environment (development/production) |
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT token signing |
| `JWT_EXPIRE` | No | 30d | JWT token expiration time |
| `AWS_*` | Yes | - | AWS credentials and S3 configuration |
| `FRONTEND_URL` | Yes | - | URL of the frontend application |
| `CORS_ORIGIN` | No | * | Allowed CORS origins |
| `RATE_LIMIT_*` | No | - | Rate limiting configuration |

## 🏗️ Project Structure

```
backend/
├── config/          # Configuration files
│   ├── db.js       # Database connection
│   └── s3.js       # AWS S3 configuration
├── controllers/     # Route controllers
│   ├── authController.js
│   └── submissionController.js
├── middleware/     # Custom middleware
│   ├── auth.js     # Authentication middleware
│   └── upload.js   # File upload middleware
├── models/         # Mongoose models
│   ├── Submission.js
│   └── User.js
├── routes/         # API routes
│   ├── auth.js
│   └── submissions.js
├── utils/          # Utility functions
│   └── pdfGenerator.js
├── .env            # Environment variables
├── app.js          # Express app configuration
└── server.js       # Server entry point
```

## 📚 API Documentation

### 🔐 Authentication

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "securePassword123!",
  "name": "John Doe",
  "role": "patient" // or "admin"
}
```

**Responses:**
- `201 Created`: User registered successfully
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "securePassword123!"
}
```

**Responses:**
- `200 OK`: Login successful
  ```json
  {
    "success": true,
    "token": "jwt.token.here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "patient@example.com",
      "role": "patient"
    }
  }
  ```
- `401 Unauthorized`: Invalid credentials

### 📝 Submissions

#### Create New Submission (Patient)
```http
POST /api/submissions
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

# Form Data:
# - patientName: String (required)
# - patientAge: Number (required)
# - patientGender: String (required)
# - notes: String (optional)
# - upperJaw: File (image/jpeg, image/png, max 5MB)
# - lowerJaw: File (image/jpeg, image/png, max 5MB)
# - frontTeeth: File (image/jpeg, image/png, max 5MB)
```

**Responses:**
- `201 Created`: Submission created successfully
- `400 Bad Request`: Missing required fields or invalid file types
- `401 Unauthorized`: Authentication required

#### Get All Submissions (Admin Only)
```http
GET /api/submissions
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status`: Filter by status (pending, annotated, reported)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Responses:**
- `200 OK`: List of submissions
  ```json
  {
    "success": true,
    "count": 2,
    "pagination": {
      "next": { "page": 2, "limit": 10 },
      "prev": null
    },
    "data": [
      {
        "_id": "submission_id",
        "patientName": "John Doe",
        "status": "pending",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### ✏️ Annotations

#### Add/Update Annotations
```http
PUT /api/submissions/:id/annotate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "annotations": [
    {
      "id": "annotation_1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 150,
      "color": "#FF0000",
      "label": "Cavity",
      "notes": "Requires filling"
    },
    {
      "type": "circle",
      "x": 300,
      "y": 200,
      "radius": 50,
      "color": "#00FF00",
      "label": "Healthy"
    }
  ]
}
```

**Responses:**
- `200 OK`: Annotations saved successfully
- `400 Bad Request`: Invalid annotation data
- `404 Not Found`: Submission not found
- `403 Forbidden`: Not authorized to annotate this submission

### 📄 Reports

#### Generate PDF Report
```http
POST /api/submissions/:id/generate-pdf
Authorization: Bearer <jwt_token>
```

**Responses:**
- `200 OK`: PDF report generated
  ```json
  {
    "success": true,
    "data": {
      "pdfUrl": "https://s3.amazonaws.com/bucket/reports/report_123.pdf"
    }
  }
  ```
- `404 Not Found`: Submission not found
- `500 Internal Server Error`: Failed to generate PDF

### 🔍 Health Check
```http
GET /api/health
```

**Responses:**
- `200 OK`: Service is healthy
  ```json
  {
    "status": "ok",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "uptime": 12345.67,
    "database": "connected"
  }
  ```

## 🔧 Development Guide

### Development Workflow

1. **Start the development server**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server with hot-reload
   npm run dev
   ```
   The server will be available at `http://localhost:5000`

2. **Running Tests**
   ```bash
   # Run all tests
   npm test
   
   # Run tests in watch mode
   npm test -- --watch
   
   # Generate test coverage report
   npm run test:coverage
   ```

3. **Code Quality**
   ```bash
   # Run ESLint
   npm run lint
   
   # Fix linting issues automatically
   npm run lint:fix
   
   # Run type checking (if using TypeScript)
   npm run type-check
   ```

### Debugging

1. **VS Code Launch Configuration**
   Add this to your `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Backend",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/server.js",
         "envFile": "${workspaceFolder}/.env",
         "console": "integratedTerminal"
       }
     ]
   }
   ```

2. **Debug Logging**
   Use the `debug` package for logging:
   ```javascript
   const debug = require('debug')('oralvis:module:name');
   debug('Debug message');
   ```
   Enable debug logs: `DEBUG=oralvis:* npm run dev`

## 🚀 Production Deployment

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB 4.4+ (or MongoDB Atlas)
- AWS S3 bucket with proper permissions
- PM2 or similar process manager (recommended)
- Nginx or similar reverse proxy (recommended)

### Deployment Steps

1. **Server Setup**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/oralvis-app.git
   cd oralvis-app/backend
   
   # Install production dependencies
   npm ci --only=production
   
   # Set environment variables in .env.production
   cp .env.example .env.production
   nano .env.production
   ```

2. **Process Management with PM2**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start application
   pm2 start server.js --name "oralvis-backend" --env production
   
   # Save process list for automatic startup
   pm2 save
   pm2 startup
   
   # Monitor logs
   pm2 logs oralvis-backend
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL with Let's Encrypt**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtain and install certificate
   sudo certbot --nginx -d api.yourdomain.com
   ```

## 🔒 Security Best Practices

1. **Dependencies**
   ```bash
   # Regularly update dependencies
   npm outdated
   npm update
   
   # Check for vulnerabilities
   npm audit
   npm audit fix
   ```

2. **Environment Configuration**
   - Never commit `.env` files
   - Use different secrets for development and production
   - Rotate secrets regularly
   - Use AWS IAM roles when possible

3. **API Security**
   - Enable CORS only for trusted domains
   - Implement rate limiting
   - Use Helmet.js for security headers
   - Validate all user inputs
   - Sanitize output

## 📊 Monitoring & Logging

1. **Log Management**
   - Use Winston or Morgan for logging
   - Rotate logs regularly
   - Store logs in a centralized location

2. **Monitoring**
   - Set up health check endpoints
   - Monitor error rates and response times
   - Set up alerts for critical issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ☁️ AWS S3 Configuration

### 1. Create S3 Bucket
1. Log in to AWS Management Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Enter a unique bucket name (e.g., `oralvis-healthcare-2025`)
5. Select the AWS Region closest to your users
6. Enable versioning (recommended)
7. Click "Create bucket"

### 2. Configure CORS Policy
Add the following CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Set Up IAM User
1. Go to IAM in AWS Console
2. Create a new user with programmatic access
3. Attach the following policy (replace `your-bucket-name`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

4. Save the access key ID and secret access key for your `.env` file

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
