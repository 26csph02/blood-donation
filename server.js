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

// 1. Database URIs
const ATLAS_URI = 'mongodb+srv://26csph02_db_user:rncYE7UorSbHePeU@cluster0.olfxphz.mongodb.net/bloodDonationDB?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/bloodDonationDB';

let activeConnection = 'Connecting...';

// 2. Define Schemas & Models
const donorSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    city: { type: String, required: true },
    password: { type: String, required: true }
});
const Donor = mongoose.model('Donor', donorSchema);

const donationSchema = new mongoose.Schema({
    donorName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, default: 1 },
    hospitalOrCamp: { type: String, required: true },
    city: { type: String, required: true },
    donationDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Completed' }
});
const BloodDonation = mongoose.model('BloodDonation', donationSchema, 'blood_donations');

// 3. Connect to Database with automatic Atlas promotion & sync
async function syncLocalToAtlas() {
    try {
        const atlasConn = await mongoose.createConnection(ATLAS_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log('>>> Connected to MongoDB Atlas! Syncing local records... <<<');
        const AtlasDonor = atlasConn.model('Donor', donorSchema);
        const localDonors = await Donor.find();
        for (const d of localDonors) {
            await AtlasDonor.updateOne({ _id: d._id }, { $set: d.toObject() }, { upsert: true });
        }
        console.log(`>>> Synced ${localDonors.length} donors to MongoDB Atlas Cloud Explorer! <<<`);
        await atlasConn.close();
        
        // Reconnect main mongoose to Atlas
        await mongoose.disconnect();
        await mongoose.connect(ATLAS_URI);
        activeConnection = 'MongoDB Atlas (Cloud)';
        console.log('>>> Server is now fully connected to MongoDB Atlas Cloud! <<<');
    } catch (err) {
        // Atlas still not accessible
    }
}

async function initDB() {
    try {
        console.log('Attempting connection to MongoDB Atlas...');
        await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 5000 });
        activeConnection = 'MongoDB Atlas (Cloud)';
        console.log('Connected to MongoDB Atlas Cloud successfully!');
    } catch (err) {
        console.warn('MongoDB Atlas connection pending IP whitelist:', err.message);
        console.log('Using Local MongoDB as active fallback...');
        try {
            await mongoose.connect(LOCAL_URI);
            activeConnection = 'Local MongoDB (Fallback)';
            console.log('Connected to Local MongoDB successfully!');
        } catch (localErr) {
            activeConnection = 'Disconnected';
            console.error('Local MongoDB connection error:', localErr.message);
        }
        // Poll Atlas every 10 seconds to auto-connect and sync once IP is whitelisted
        const intervalId = setInterval(async () => {
            if (activeConnection === 'MongoDB Atlas (Cloud)') {
                clearInterval(intervalId);
                return;
            }
            await syncLocalToAtlas();
        }, 10000);
    }
}

initDB();

// 4. API Route for Registering a Donor
app.post('/register', async (req, res) => {
    try {
        const { fullName, bloodGroup, city, password } = req.body;
        const newDonor = new Donor({ fullName, bloodGroup, city, password });
        await newDonor.save();
        res.redirect('/index.html');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering donor.");
    }
});

// 5. API Route to Fetch/Search Donors for the Dashboard
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

// 6. API Routes for Blood Donations
app.get('/api/donations', async (req, res) => {
    try {
        const donations = await BloodDonation.find().sort({ donationDate: -1 });
        res.json(donations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching blood donations." });
    }
});

app.post('/api/donations', async (req, res) => {
    try {
        const { donorName, bloodGroup, units, hospitalOrCamp, city, status } = req.body;
        const newDonation = new BloodDonation({
            donorName,
            bloodGroup,
            units: Number(units) || 1,
            hospitalOrCamp,
            city,
            status: status || 'Completed',
            donationDate: new Date()
        });
        await newDonation.save();
        res.json({ success: true, donation: newDonation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error saving blood donation." });
    }
});

app.delete('/api/donations/:id', async (req, res) => {
    try {
        await BloodDonation.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Blood donation record deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete blood donation." });
    }
});

// 7. API Route for Database Stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const totalDonations = await BloodDonation.countDocuments();
        const groupCounts = await Donor.aggregate([
            { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
        ]);
        res.json({
            database: 'bloodDonationDB',
            collections: ['donors', 'blood_donations'],
            totalDonors,
            totalDonations,
            groupCounts,
            connectionType: activeConnection,
            status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching database stats." });
    }
});

// 8. API Route to Delete a Donor Record
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
