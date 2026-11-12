# 🩸 Blood Donation Management System

A web-based platform designed to connect voluntary blood donors with hospitals and individuals in need of emergency blood transfusions.

---

## 📌 Features
- **Donor Directory & Search:** Filter and find voluntary donors instantly by blood group.
- **Donor Registration:** Allows new voluntary donors to register their contact information and blood group.
- **User Authentication:** Secure login for registered donors with session tracking.
- **Responsive Interface:** Clean and lightweight UI accessible across modern browsers.

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js (`http`, `fs`, `path`, `querystring`, `url`)
- **Database:** MongoDB Atlas (Cloud Database) with native MongoDB driver

---

## 📂 Project Structure
```text
blood-donation/
├── public/
│   ├── index.html       # Landing page (Hero banner, donor search, information)
│   ├── login.html       # Donor login page
│   ├── register.html    # Donor registration form
│   ├── home.html        # Home page
│   └── style.css        # Application stylesheet
├── server.js            # Node.js HTTP server & MongoDB routes
├── start_project.bat    # Project launcher
├── push_to_github.bat   # Git push helper
├── package.json         # Project metadata and dependencies
└── README.md            # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/26csph02/blood-donation.git
cd blood-donation
```

Install dependencies:
```bash
npm install
```

### 3. Run Application
Start the Node.js server:
```bash
npm start
```
*(or run `node server.js`)*

Open your browser and navigate to:
```text
http://localhost:3000
```
