# 📚 Library Management System — MERN Stack (Final Year Thesis Project)

A full-stack Library Management System built with MongoDB, Express.js, React.js, and Node.js (MERN). Includes JWT authentication, role-based dashboards (Admin/Student), book & student management, a complete borrow/return/renew workflow with automatic fine calculation, reports with PDF/Excel export, notifications, and dark mode.
## 🧱 Tech Stack

Used application Technology & Programming tools|
| Frontend | React.js (Vite), React Router, Context API, Formik + Yup, Chart.js |

| Backend | Node.js, Express.js |

| Database | MongoDB (Atlas or local) |

| Auth | JWT + bcryptjs |

| File Uploads | Multer |

| Emails | Nodemailer |

| PDF/CSV Export | pdfkit, json2csv, csv-parser |

| Scheduling | node-cron (overdue detection, due-date reminders) |

	Project Structure

library-management-system/
	client/                # React frontend (Vite)
│   src/
      components/    # Navbar, Sidebar, Footer, Table, Modal, BookCard, Loader, PrivateRoute
      pages/   # Login, Register, Dashboard, Books, Students, Borrow, Fines, Reports, Profile, Settings...
      context/         # AuthContext (React Context API state management)
      services/        # api.js (Axios instance with JWT interceptor)

	server/                # Express backend
    ├── config/db.js
    ├── models/             # User, Book, Borrow, Fine, Notification
    ├── controllers/        # auth, book, user, borrow, fine, dashboard, report, notification
    ├── routes/
    ├── middleware/         # auth (JWT), upload (multer), errorHandler
    └── utils/              # generateToken, sendEmail, cronJobs, seeder

	Setup Instructions

1. Prerequisites
o	Node.js v18+
o	MongoDB Atlas account (or local MongoDB instance)
o	(Optional) Gmail App Password or Mailtrap account for email features
2. Backend Setup
- `MONGODB
- `JWT_SECRET
- `EMAIL_USER

 3. Frontend Setup
o	Html
o	Css and js
	Core Features Implemented

- Auth: Register, Login, JWT sessions, Email verification, Forgot/Reset Password, Change Password, Logout
- Dashboards: Admin (books/students/borrowed/returned/overdue/fine stats + charts + recent activity) and Student (borrowed books, due dates, fines)
- Books: Full CRUD, image upload, search/filter, pagination, CSV import, CSV & PDF export
- Students: Full CRUD (admin), department/contact info, activate/deactivate
- Borrow workflow: Student requests → Admin approves/rejects → issued with due date → student can renew (max 2x) or admin marks returned → automatic fine calculation on late return


See the `docs/` folder for:
- `API_DOCUMENTATION.md` — full endpoint reference
- `INSTALLATION_GUIDE.md` — step-by-step setup (expanded version of above)
- `DEPLOYMENT_GUIDE.md` — deploying to Vercel + Render/Railway + Atlas
- `ER_DIAGRAM.md` — entity relationship description (Users, Books, Borrows, Fines, Notifications)

