# KIMS E-Portal

A comprehensive employee management and information portal built with React, Vite, and Express.js. KIMS E-Portal provides a centralized platform for managing employee information, training materials, holiday schedules, upcoming events, and more.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Project Components](#project-components)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Features
- **Dashboard**: Centralized view of employee information and quick links
- **Training Materials**: Access and manage training resources
- **Telephone Directory**: Searchable directory of employee contact information
- **Holiday List**: View company holidays and time-off schedules
- **Upcoming Events**: Check upcoming company events and activities
- **People Management**: Browse and manage employee profiles

### Admin Features
- **Admin Panel**: Comprehensive administration interface
- **Dashboard Management**: Configure and customize dashboard elements
- **User Management**: Manage employee accounts and roles
- **Content Management**: Upload and manage training materials, notices, and documents
- **Excel Import**: Bulk import employee data via Excel files
- **File Management**: Handle PDF uploads for notices

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different access levels for users and admins
- **Password Encryption**: Bcrypt password hashing for security
- **CORS Support**: Secure cross-origin requests

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI library with latest features
- **Vite 8**: Fast build tool and development server with HMR
- **React Router 7**: Client-side routing and navigation
- **Tailwind CSS 4**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Icons**: Additional icon support
- **Axios**: HTTP client for API requests
- **React Compiler**: Automatic performance optimization

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js 5**: Fast and minimalist web framework
- **MySQL2**: MySQL database driver with Promise support
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing and encryption
- **CORS**: Cross-Origin Resource Sharing
- **Multer**: File upload middleware
- **XLSX**: Excel file parsing and handling
- **Dotenv**: Environment variable management

### Development Tools
- **Nodemon**: Auto-restart server during development
- **ESLint**: Code quality and style linting
- **Babel**: JavaScript transpiler
- **PostCSS**: CSS transformation tool

## 📁 Project Structure

```
kims-eportal/
├── src/                          # Frontend source code
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Application entry point
│   ├── index.css                 # Global styles
│   ├── App.css                   # App component styles
│   ├── assets/                   # Static assets
│   ├── img/                      # Image files
│   ├── components/
│   │   ├── Header.jsx            # Header component
│   │   ├── Sidebar.jsx           # Sidebar navigation
│   │   ├── NoticeBoard.jsx       # Notice board component
│   │   ├── AdminCard.jsx         # Admin card component
│   │   ├── BirthdayCard.jsx      # Birthday card component
│   │   ├── EventsCard.jsx        # Events card component
│   │   └── Admincard.jsx         # Alternative admin card
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context for state management
│   ├── pages/
│   │   ├── Dashboard.jsx         # Main dashboard page
│   │   ├── Login.jsx             # Login page
│   │   ├── AdminPanel.jsx        # Admin panel page
│   │   ├── ManageDashboard.jsx   # Dashboard management page
│   │   ├── TrainingMaterials.jsx # Training materials page
│   │   ├── TelephoneDirectory.jsx# Employee directory page
│   │   ├── HolidayList.jsx       # Holiday calendar page
│   │   ├── UpcomingEvents.jsx    # Events page
│   │   └── People.jsx            # People management page
│   ├── services/
│   │   └── api.js                # Axios API configuration
│   └── styles/
│       ├── dashboard.css         # Dashboard styles
│       ├── login.css             # Login styles
│       ├── Adminpanel.css        # Admin panel styles
│       ├── managedashboard.css   # Dashboard management styles
│       ├── training.css          # Training page styles
│       ├── telephone-directory.css
│       ├── holiday-list.css      # Holiday list styles
│       ├── people.css            # People page styles
│       └── upcoming-events.css   # Events page styles
├── backend/                      # Backend source code
│   ├── server.js                 # Express server setup and routes
│   ├── setupDb.js                # Database initialization script
│   ├── package.json              # Backend dependencies
│   └── uploads/
│       └── notices/              # Uploaded notice files
├── public/                       # Static public assets
├── index.html                    # HTML entry point
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── eslint.config.js              # ESLint configuration
└── README.md                     # This file
```

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **MySQL** 8.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kims_eportal
cd kims-eportal
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuration

### Frontend Configuration

Create a `.env.local` file in the root directory (optional):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=kims@123
DB_NAME=kims_portal

# JWT Configuration
JWT_SECRET=your_secret_key_here

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Database Setup

1. Create MySQL database:

```sql
CREATE DATABASE kims_portal;
USE kims_portal;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add more tables as needed for your specific database schema
```

2. Run database setup script (if available):

```bash
cd backend
node setupDb.js
cd ..
```

## 🏃 Running the Application

### Development Mode

#### Terminal 1 - Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Terminal 2 - Backend Development Server

```bash
cd backend
npm run dev
```

The backend API will be running at `http://localhost:5000`

### Production Build

#### Build Frontend

```bash
npm run build
npm run preview
```

#### Start Backend for Production

```bash
cd backend
npm start
```

## 🔍 Development

### Available Scripts

#### Frontend Scripts

```bash
# Start development server with Hot Module Replacement
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

#### Backend Scripts

```bash
# Start server with auto-reload (development)
cd backend
npm run dev

# Start server (production)
npm start
```

### Code Quality

ESLint is configured to maintain code quality. Run linting:

```bash
npm run lint
```

### Customization

#### Tailwind CSS Colors

Custom colors are defined in `tailwind.config.js`:

```javascript
extend: {
  colors: {
    'kims-bg': '#196174',        // Teal background
    'kims-green': '#0e8851',     // Active sidebar green
    'kims-header-btn': '#2c4048', // Dark button
    'kims-header-icon': '#e2e8f0' // Icon color
  }
}
```

#### Font Family

Default font is set to Poppins. Update in `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['"Poppins"', 'system-ui', 'sans-serif'],
}
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| POST | `/api/login` | User login | `{ username, password }` |

### Response Format

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "employee",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Note**: Additional API endpoints can be added to the backend. Include them in the database queries and route handlers in `backend/server.js`.

## 🎨 Project Components

### Frontend Components

- **Header**: Navigation header with logo and user menu
- **Sidebar**: Main navigation sidebar with menu items
- **NoticeBoard**: Display important notices and announcements
- **AdminCard**: Card component for admin dashboard elements
- **BirthdayCard**: Display upcoming birthdays
- **EventsCard**: Display upcoming events

### Pages

- **Dashboard**: Main page with quick information and links
- **Login**: Authentication page
- **AdminPanel**: Admin control center
- **ManageDashboard**: Dashboard configuration page
- **TrainingMaterials**: Training resources and materials
- **TelephoneDirectory**: Employee contact directory
- **HolidayList**: Company holiday calendar
- **UpcomingEvents**: Upcoming company events
- **People**: Employee profiles and information

## 🔐 Security Considerations

1. **JWT Tokens**: Tokens are stored in localStorage with 1-day expiration
2. **Password Security**: Passwords are hashed using bcrypt
3. **CORS**: Configured to prevent unauthorized cross-origin requests
4. **Environment Variables**: Sensitive credentials stored in `.env` file
5. **SQL Safety**: Use parameterized queries to prevent SQL injection

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License. See LICENSE file for details.

## 📧 Support

For support or inquiries, please contact the development team.

---

**Last Updated**: April 2026
**Version**: 1.0.0
