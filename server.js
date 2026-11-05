// ==========================================
// Blood Donation Mini Project - server.js
// Technologies: Node.js, Express, MongoDB (Mongoose)
// ==========================================

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static HTML, CSS, JS files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Atlas Connection URL
const MONGO_URI = 'mongodb+srv://26csph02_db_user:rncYE7UorSbHePeU@cluster0.olfxphz.mongodb.net/bloodDonationDB?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/bloodDonationDB';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully!'))
    .catch((err) => {
        console.log('Atlas error, falling back to Local MongoDB:', err.message);
        mongoose.connect(LOCAL_URI)
            .then(() => console.log('Connected to Local MongoDB!'))
            .catch((e) => console.log('MongoDB connection error:', e.message));
    });

// Define Donor Schema
const donorSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    phone: { type: String, default: 'Not Provided' },
    city: { type: String, required: true }
});

const Donor = mongoose.model('Donor', donorSchema);

// ------------------------------------------
// 1. ROUTE: User Registration
// ------------------------------------------
app.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, bloodGroup, phone, city } = req.body;

        // Check if user already exists
        if (email) {
            const existing = await Donor.findOne({ email });
            if (existing) {
                return res.send("<script>alert('Email already registered! Please login.'); window.location.href='/index.html';</script>");
            }
        }

        // Create new donor
        const newDonor = new Donor({ fullName, email, password, bloodGroup, phone, city });
        await newDonor.save();

        res.send("<script>alert('Registration Successful! Please login.'); window.location.href='/index.html';</script>");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering donor: " + err.message);
    }
});

// ------------------------------------------
// 2. ROUTE: User Login
// ------------------------------------------
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Search user by email (or username) and password
        const user = await Donor.findOne({
            $or: [{ email: email }, { fullName: email }],
            password: password
        });

        if (user) {
            // Login success - redirect to home page with user name
            res.redirect(`/home.html?name=${encodeURIComponent(user.fullName)}`);
        } else {
            // Login failed
            res.send("<script>alert('Invalid Email or Password! Try again.'); window.location.href='/index.html';</script>");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Login error: " + err.message);
    }
});

// ------------------------------------------
// 3. ROUTE: Fetch Donors List (with filter)
// ------------------------------------------
app.get('/api/donors', async (req, res) => {
    try {
        const { bloodGroup } = req.query;
        let filter = {};

        if (bloodGroup && bloodGroup !== 'All') {
            filter.bloodGroup = bloodGroup;
        }

        const donors = await Donor.find(filter).select('-password');
        res.json(donors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch donors." });
    }
});

// ------------------------------------------
// Start Server
// ------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running smoothly at http://localhost:${PORT}`);
});
