const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware to parse form data and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML/CSS files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// 1. Connect to MongoDB (MongoDB Atlas with fallback to local)
const ATLAS_URI = 'mongodb+srv://26csph02_db_user:rncYE7UorSbHePeU@cluster0.olfxphz.mongodb.net/bloodDonationDB?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/bloodDonationDB';
const MONGODB_URI = process.env.MONGODB_URI || ATLAS_URI;

let activeConnection = 'Connecting...';

mongoose.connect(MONGODB_URI)
    .then(() => {
        activeConnection = MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB';
        console.log(`Connected to ${activeConnection} successfully!`);
    })
    .catch((err) => {
        console.error('MongoDB Atlas connection error:', err.message);
        console.log('Attempting connection to local MongoDB...');
        mongoose.connect(LOCAL_URI)
            .then(() => {
                activeConnection = 'Local MongoDB (Fallback)';
                console.log('Connected to Local MongoDB successfully!');
            })
            .catch(localErr => {
                activeConnection = 'Disconnected';
                console.error('Local MongoDB connection error:', localErr.message);
            });
    });

// 2. Define a Donor Schema & Model
const donorSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    city: { type: String, required: true },
    password: { type: String, required: true }
});

const Donor = mongoose.model('Donor', donorSchema);

// 3. API Route for Registering a Donor
app.post('/register', async (req, res) => {
    try {
        const { fullName, bloodGroup, city, password } = req.body;
        
        // Create and save new donor to MongoDB
        const newDonor = new Donor({ fullName, bloodGroup, city, password });
        await newDonor.save();

        // Redirect back to login page after successful registration
        res.redirect('/index.html');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering donor.");
    }
});

// 4. API Route to Fetch/Search Donors for the Dashboard
app.get('/api/donors', async (req, res) => {
    try {
        const { bloodGroup, city, search } = req.query;
        let query = {};
        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (city) query.city = new RegExp(city, 'i');
        if (search) {
            query.$or = [
                { fullName: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') }
            ];
        }

        const donors = await Donor.find(query).sort({ _id: -1 });
        res.json(donors);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching donors.");
    }
});

// 5. API Route for MongoDB Database Stats
app.get('/api/stats', async (req, res) => {
    try {
        const total = await Donor.countDocuments();
        const groupCounts = await Donor.aggregate([
            { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
        ]);
        res.json({
            database: 'bloodDonationDB',
            collection: 'donors',
            totalDonors: total,
            groupCounts: groupCounts,
            connectionType: activeConnection,
            status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching database stats." });
    }
});

// 6. API Route to Delete a Donor Record
app.delete('/api/donors/:id', async (req, res) => {
    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Donor deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete donor." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly at http://localhost:${PORT}`);
});
