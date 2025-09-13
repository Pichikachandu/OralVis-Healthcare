# OralVis Healthcare - Frontend

A modern React-based frontend for the OralVis Healthcare application, providing an intuitive interface for dental image submission, annotation, and report management.

## ✨ Features

- **Responsive Design**: Optimized for both desktop and mobile devices
- **User Authentication**: Secure login and registration with JWT
- **Role-Based Access Control**: Separate interfaces for patients and administrators
- **Image Upload**: Upload dental images (upper, front, lower jaw)
- **Annotation Tools**: Interactive tools for dental professionals to annotate images
- **PDF Generation**: Generate and download detailed dental reports
- **Submission History**: View and manage previous submissions

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Backend server (see backend README for setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oralvis-app/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## 🛠️ Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (use with caution)

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services and utilities
├── assets/        # Images, fonts, etc.
├── styles/        # Global styles and themes
└── App.js         # Main application component
```

## 🔒 Authentication

The frontend uses JWT for authentication. Tokens are stored in localStorage and included in API requests via an axios interceptor.

## 🌐 API Integration

Key API endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/submissions` - Get all submissions (admin)
- `GET /api/submissions/own` - Get user's submissions
- `POST /api/submissions` - Create new submission
- `PUT /api/submissions/:id/annotate` - Add annotations to submission
- `POST /api/submissions/:id/generate-pdf` - Generate PDF report

## 🎨 Styling

This project uses Tailwind CSS for styling with custom configurations. The theme can be customized in `tailwind.config.js`.

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🚀 Deployment

To create a production build:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
