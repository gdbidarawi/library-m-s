# Thesis Outline — Library Management System (MERN Stack)

Use this as a skeleton for your full thesis document. Each chapter below includes what to write and which project artifacts to reference.

## Chapter 1 — Introduction
- Background of the study (manual library systems and their limitations)
- Problem statement
- Objectives (general + specific)
- Scope and limitations of the system
- Significance of the study
- Definition of terms (ISBN, JWT, MERN, fine, etc.)

## Chapter 2 — Literature Review
- Review of existing library management systems (Koha, LibraryWorld, etc.)
- Comparison table: manual vs existing digital systems vs proposed system
- Review of MERN stack and why it was chosen
- Review of authentication methods (JWT vs sessions)

## Chapter 3 — System Analysis and Design
- Requirements gathering (functional & non-functional requirements — list from the feature set in `README.md`)
- Use Case Diagram (Admin: manage books/students/borrows/reports; Student: browse/borrow/renew/pay fines)
- Class Diagram (map directly to `server/models/*.js`: User, Book, Borrow, Fine, Notification)
- ER Diagram (`docs/ER_DIAGRAM.md`)
- Sequence Diagram for the borrow → approve → return → fine flow (see `borrowController.js` for exact logic to diagram)
- Activity Diagram for registration + email verification flow
- System architecture diagram (Client—React SPA <-> REST API—Express <-> MongoDB Atlas)

## Chapter 4 — System Implementation
- Technology stack justification (table from README)
- Folder structure walkthrough (`client/` and `server/`)
- Key implementation details:
  - JWT authentication & bcrypt password hashing (`middleware/auth.js`, `models/User.js`)
  - Role-based access control (`authorize()` middleware)
  - Automatic fine calculation logic (`borrowController.js` -> `returnBook`)
  - Scheduled overdue detection with node-cron (`utils/cronJobs.js`)
  - File uploads with Multer (`middleware/upload.js`)
  - CSV import / CSV+PDF export (`bookController.js`)
- Screenshots: Login, Admin Dashboard, Student Dashboard, Books page, Borrow management, Reports
- Code snippets for the most important modules (2-3 pages max, don't dump entire files)

## Chapter 5 — Testing and Results
- Testing methodology (unit vs manual/functional testing)
- Test cases table, e.g.:

| Test Case | Input | Expected Output | Result |
|---|---|---|---|
| Login with valid credentials | Correct email/password | JWT returned, redirected to dashboard | Pass |
| Login with invalid password | Wrong password | 401 error, "Invalid email or password" | Pass |
| Borrow a book with 0 available copies | bookId with available=0 | 400 error, "No copies available" | Pass |
| Return book 3 days late | returnDate = dueDate+3 | Fine of $3 auto-created | Pass |
| Delete student with active borrow | studentId with issued book | 400 error, deletion blocked | Pass |

- API testing screenshots from Postman (import the routes from `docs/API_DOCUMENTATION.md`)
- Performance/usability notes

## Chapter 6 — Conclusion and Future Work
- Summary of what was achieved against the objectives in Chapter 1
- Limitations (e.g., local file storage for uploads — see `docs/DEPLOYMENT_GUIDE.md` section 5)
- Future work: mobile app, SMS notifications, RFID/barcode scanning integration, multi-branch library support, real i18next translations

## References
- Cite official docs used: React, Express, MongoDB/Mongoose, JWT (jwt.io), bcrypt, Multer, Chart.js, node-cron, etc.

## Appendices
- A: Full API Documentation (`docs/API_DOCUMENTATION.md`)
- B: Installation Guide (`docs/INSTALLATION_GUIDE.md`)
- C: ER Diagram (`docs/ER_DIAGRAM.md`)
- D: Deployment Guide (`docs/DEPLOYMENT_GUIDE.md`)
- E: Full source code listing (reference the GitHub repo / submitted zip rather than pasting thousands of lines)
