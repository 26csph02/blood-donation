# 🩸 Blood Donation Management System

A simple, lightweight full-stack mini project designed to connect voluntary blood donors with recipients in need of emergency blood transfusions.

---

## 📌 Project Overview
- **Objective:** Provide a fast, accessible platform to search voluntary blood donors by blood group and allow new donors to register securely.
- **Audience:** Academic Mini Project demonstration for viva/examinations.
- **Architecture:** Clean, minimal, human-written code using standard core web technologies without bloated frameworks.

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (DOM Manipulation, Fetch API, Session Storage)
- **Backend:** Pure Node.js (`http`, `fs`, `path`, `querystring`, `url`) — *No Express framework*
- **Database:** MongoDB Atlas (Cloud Database) with native `mongodb` driver & local fallback
- **Version Control:** Git & GitHub

---

## 📂 Project Structure
```text
blood-donation/
├── public/
│   ├── index.html       # Public landing page (Hero banner, donor search, facts)
│   ├── login.html       # Donor login page
│   ├── register.html    # New donor registration form
│   ├── home.html        # Home page alias
│   └── style.css        # Clean, responsive CSS styling
├── server.js            # Pure Node.js HTTP server & MongoDB routes
├── start_project.bat    # 1-click launcher (installs dependencies & opens browser)
├── push_to_github.bat   # 1-click script to push changes to GitHub
├── package.json         # Node.js project metadata (single dependency: mongodb)
└── README.md            # Project documentation
```

---

## 🚀 How to Run on Any Computer (Lab / Exam)

### 1. Prerequisites
- **Node.js** installed on the computer (check via `node -v` in terminal/CMD).

### 2. Steps to Run
1. **Download the project:**
   - Clone via Git:
     ```bash
     git clone https://github.com/26csph02/blood-donation.git
     cd blood-donation
     ```
   - *OR* Click **Code $\rightarrow$ Download ZIP** on GitHub and extract the folder.

2. **One-Click Run (Windows):**
   - Double-click **`start_project.bat`**.
   - It will automatically install packages (if running for the first time), start the server, and open `http://localhost:3000` in your browser.

3. **Manual Run (Terminal / CMD):**
   ```bash
   npm install
   node server.js
   ```
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🔍 Key Pages & Workflow
1. **Home Page (`/` or `index.html`):**
   - Public view with "Search Donors by Blood Group" and "Why Donate" information.
   - Top navigation with prominent **Login** and **Register** options.
2. **Login Page (`login.html`):**
   - Registered donors can log in using their email or full name and password.
   - Redirects to Home page with a personalized greeting (*"Welcome, [Name]!"*) and a **Logout** button.
3. **Registration Page (`register.html`):**
   - Collects Donor Name, Email, Phone, Blood Group, City, and Password.
   - Stores the donor data in MongoDB and prompts user to log in.
