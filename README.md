# Document Signature App

## Overview

Document Signature App is a full-stack web application that allows users to upload PDF documents, place signatures at custom locations, generate signed PDFs, and securely download them.

The application uses JWT authentication, role-based document ownership verification, and PDF processing to provide a secure document signing workflow.

---

## Features

### Authentication

* User Registration
* User Login
* JWT Token Authentication
* Protected Routes

### Document Management

* Upload PDF Documents
* View Uploaded Documents
* Delete Documents
* Document Ownership Verification

### Signature Management

* Place Signature on PDF
* Drag-and-Drop Signature Positioning
* Save Signature Coordinates
* Apply Signature to PDF
* Generate Signed PDF

### PDF Operations

* PDF Upload
* PDF Processing using PyMuPDF
* Signed PDF Generation
* Download Signed PDF

---

## Tech Stack

### Frontend

* React
* Axios
* Tailwind CSS

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication
* PyMuPDF (fitz)

### Database

* SQLite

---

## Project Structure

```text
Document-Signature-App
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── models
├── routers
├── schemas
├── utils
├── uploads
├── signed_docs
├── database.py
├── main.py
└── requirements.txt
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd document-signature-app
```

---

### Create Virtual Environment

```bash
python -m venv venv
```

Activate Environment

Windows:

```bash
venv\Scripts\activate
```

---

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

### Install Frontend Dependencies

```bash
cd frontend

npm install
```

---

## Run Backend

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Run Frontend

```bash
cd frontend

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Application Workflow

### User Authentication

1. Register Account
2. Login
3. JWT Token Generated
4. Access Protected Features

### Document Signing Workflow

1. Upload PDF
2. Open Document
3. Place Signature Position
4. Save Signature Coordinates
5. Apply Signature
6. Generate Signed PDF
7. Download Signed PDF

---

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Documents

```http
POST   /api/documents/upload
GET    /api/documents
GET    /api/documents/my-documents
GET    /api/documents/{document_id}
DELETE /api/documents/{document_id}
```

### Signatures

```http
POST /api/signatures
GET  /api/signatures/{document_id}
POST /api/signatures/apply/{document_id}
GET  /api/signatures/download/{document_id}
DELETE /api/signatures/{signature_id}
```

---

## Security Features

* JWT Authentication
* Protected APIs
* User Ownership Verification
* Secure Document Access
* Authorization-Based Downloads

---

## Future Improvements

* Multiple Signatures Per Document
* Signature Image Upload
* Email Notifications
* Document Sharing
* Cloud Storage Integration
* Audit Logs

---

## Author

Aditya Kumar Mishra
Python Developer Intern

