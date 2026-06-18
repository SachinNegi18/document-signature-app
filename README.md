# SignDoc — Document Signature App

A full-stack e-signature platform inspired by DocuSign, built to demonstrate real-world SaaS patterns: authentication, file handling, drag-and-drop UX, PDF processing, audit logging, and public share links.

**Live demo:** https://document-signature-app-two.vercel.app

## Features

- JWT-based authentication (register/login)
- PDF upload with file-type validation
- Drag-and-drop signature placement on rendered PDF pages
- Real handwritten signature capture (canvas drawing, not just text)
- Server-side PDF modification — signature is permanently embedded using PDF-Lib
- Tokenized public share links — external users can view and accept/reject without logging in
- Audit trail — every upload, sign, and view action is logged with IP and timestamp
- Status lifecycle: Pending → Signed / Rejected
- Document filtering by status on the dashboard

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, react-pdf, @dnd-kit, react-signature-canvas, axios, react-router-dom

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Multer, PDF-Lib

**Deployment:** Frontend on Vercel, Backend on Render, Database on MongoDB Atlas

## Architecture Notes

- Signature coordinates are stored separately from the PDF, then burned into a new PDF file on "finalize" — this keeps the original document immutable and the signed version traceable.
- Public share links use a signed JWT (not a random string) so the link itself proves authenticity without a database lookup for validation.
- Known limitation: Render's free tier uses ephemeral storage, so uploaded files are wiped on redeploy. A production version would use S3 or Cloudinary instead of local disk storage.

## Running Locally

**Backend:**
cd server
npm install
npm run dev

**Frontend:**
cd client
npm install
npm run dev

Create a `.env` file in `server/` with `MONGO_URI` and `JWT_SECRET`, and a `.env` file in `client/` with `VITE_API_URL=http://localhost:5000`.

<img width="1902" height="715" alt="Screenshot 2026-06-18 172049" src="https://github.com/user-attachments/assets/b6998433-f013-49dc-a0d4-ca5f65428cd1" />
<img width="1912" height="892" alt="Screenshot 2026-06-18 171910" src="https://github.com/user-attachments/assets/c8f7f84a-a9ef-4747-8fbb-66fd7483c869" />
<img width="1912" height="903" alt="Screenshot 2026-06-18 171815" src="https://github.com/user-attachments/assets/f77be4fe-b63d-49a3-b4fb-f90324127ed8" />
