# 🧾 PTO Portal

A leave request and approval system built with **React**, **Firebase Firestore**, and **Tailwind CSS**.  
Employees can submit PTO (Paid Time Off) requests, and admins can view, approve, or deny them.

---

## ✨ Features

### 🔐 Login with Employee ID + OTP

- Employee enters their ID, receives a one-time code (OTP) via email
- Custom OTP system using Firestore + EmailJS
- Secure login without full Firebase Auth

### 📋 Employee Dashboard

- View previous PTO submissions
- Submit new PTO request via modal form
- Automatically calculates business days between selected dates

### 👨‍💼 Admin Dashboard

- View all employee requests
- Approve or deny requests with a single click
- See request status with color-coded badges
- Filtered access (admin-only route)

### 🔒 Session Management

- Auto logout after **2 hours of inactivity**
- Session is stored in `localStorage`
- Toast notifications for session expiration

### 📦 Firestore Integration

- Requests stored in `ptoRequests` collection
- Employee profiles in `employees` collection
- OTP codes stored temporarily in `otps` collection
- Secure Firestore rules:
  - Only allow creation of own requests
  - Only allow admins to update request statuses
  - Lock updates once request is approved/denied

---

## 💻 Tech Stack

- [React + Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Firestore](https://firebase.google.com/)
- [EmailJS](https://www.emailjs.com/) – for sending OTP emails
- [React Toastify](https://fkhadra.github.io/react-toastify/) – for toasts

---

## 🛠 Local Setup

```bash
git clone https://github.com/yourusername/leave-request-portal.git
cd mini-project
npm install
```
