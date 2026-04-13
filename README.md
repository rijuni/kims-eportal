# KIMS E-Portal - Complete Project

A comprehensive employee management and information portal solution for organizations. This repository contains the complete KIMS (Kanpur Institute of Management Studies) E-Portal application with both frontend and backend components.

## 📦 Project Overview

KIMS E-Portal is a full-stack web application designed to provide employees with centralized access to essential organizational information and resources. It features a modern, responsive UI built with React and Vite, coupled with a robust Express.js backend powered by MySQL.

## 🏗️ Repository Structure

```
kims_eportal/
├── kims-eportal/                 # Main application folder
│   ├── src/                      # React frontend source code
│   ├── backend/                  # Express.js backend server
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── eslint.config.js          # ESLint rules
│   └── README.md                 # Detailed project documentation
└── README.md                     # This file
```

## ✨ Key Features

### User Portal
- 🎯 **Dashboard** - Central hub with quick access to all features
- 📚 **Training Materials** - Manage and access training resources
- 📞 **Telephone Directory** - Employee contact information
- 🗓️ **Holiday List** - Company holidays and time-off schedules
- 🎉 **Upcoming Events** - Organization events and activities
- 👥 **People Management** - Employee profiles and information

### Admin Controls
- 🛡️ **Admin Panel** - Complete administration interface
- ⚙️ **Dashboard Management** - Customize dashboard content
- 👤 **User Management** - Manage employees and roles
- 📤 **Excel Import** - Bulk upload employee data
- 📄 **Document Management** - Upload and manage notices and files

### Security
- 🔒 JWT-based authentication
- 🔐 Bcrypt password encryption
- 🛡️ Role-based access control
- ✅ CORS protection

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite 8** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Axios** - HTTP client
- **Lucide & React Icons** - Icon libraries

### Backend
- **Node.js & Express.js 5** - Server framework
- **MySQL2** - Database driver
- **JWT & Bcrypt** - Security
- **Multer & XLSX** - File handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm 8+
- MySQL 8+

### Installation

1. **Clone and navigate:**
   ```bash
   cd kims-eportal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Configure backend (.env):**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=kims@123
   DB_NAME=kims_portal
   JWT_SECRET=your_secret_key
   ```

4. **Start development servers:**

   Terminal 1:
   ```bash
   npm run dev
   ```

   Terminal 2:
   ```bash
   cd backend
   npm run dev
   ```

Visit `http://localhost:5173` for the frontend and `http://localhost:5000` for the backend API.

## 📚 Documentation

For detailed information about the project, including:
- Complete feature documentation
- API endpoint specifications
- Development guidelines
- Deployment instructions
- Component architecture

Please see [kims-eportal/README.md](kims-eportal/README.md)

## 🔌 Available Scripts

### Frontend

```bash
npm run dev          # Start development server (HMR enabled)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start with auto-reload (Nodemon)
npm start            # Start production server
```

## 📁 Project Structure Details

### Frontend (`src/`)
- **components/** - Reusable React components (Header, Sidebar, Cards)
- **pages/** - Page components (Dashboard, Login, Admin Panel, etc.)
- **context/** - React Context for state management (AuthContext)
- **services/** - API service configuration (Axios setup)
- **styles/** - Component-specific and page styles

### Backend (`backend/`)

- **server.js** - Express application setup and API routes
- **setupDb.js** - Database initialization
- **uploads/** - File storage directory

## 📊 Database Schema

The application uses MySQL for data persistence. Key tables include:

- **users** - Employee accounts and credentials
- Custom tables for training materials, holidays, events, and notices

## 🔐 Security

- Passwords encrypted with bcrypt
- JWT tokens for session management (1-day expiration)
- CORS configured for secure API access
- SQL parameterized queries to prevent injection
- Environment variables for sensitive configuration

## 🎨 Customization

### Colors

Edit custom colors in `tailwind.config.js`:

- `kims-bg`: Primary background color
- `kims-green`: Active state color
- `kims-header-btn`: Button color
- `kims-header-icon`: Icon color

### Fonts
Default font is Poppins. Modify in `tailwind.config.js`.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m 'Add feature'`
3. Push: `git push origin feature/your-feature`
4. Submit a pull request

## 📝 Development Notes

- React Compiler is enabled for automatic performance optimization
- Hot Module Replacement (HMR) is enabled during development
- ESLint configured for code quality
- Database connection pooling for optimal performance
- File uploads supported via Multer (PDF for notices, Excel for data import)

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port in vite.config.js or backend/server.js
```

**Database connection failed:**
- Ensure MySQL is running
- Verify credentials in `.env` file
- Check database exists

**CORS errors:**
- Verify backend CORS configuration
- Check API base URL in frontend

## 📄 License

ISC License - See LICENSE file for details

## 📞 Support

For issues or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Maintained By**: Development Team