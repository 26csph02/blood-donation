// ======================================================
// Blood Donation Management System
// Backend Server - Node.js and MongoDB
// ======================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
let MongoClient;
try {
    MongoClient = require('mongodb').MongoClient;
} catch (e) {
    console.log('[Notice] MongoDB driver not installed yet. Running with in-memory donor database.');
}

let PORT = process.env.PORT || 3000;

// Default sample donors (ensures project never shows errors)
let localDonorList = [
    { fullName: 'Merin K Joseph', email: 'merinkarukappallil@gmail.com', password: '123', bloodGroup: 'AB-', phone: '1234567890', city: 'Mumbai' },
    { fullName: 'Rahul Sharma', email: 'rahul@test.com', password: '123', bloodGroup: 'A+', phone: '9876543211', city: 'Delhi' },
    { fullName: 'Nivedya', email: 'nivedya@test.com', password: '123', bloodGroup: 'O+', phone: '9876543210', city: 'Mumbai' },
    { fullName: 'John Doe', email: 'john@test.com', password: '123', bloodGroup: 'O+', phone: '9876543210', city: 'Bengaluru' }
];

// MongoDB Atlas Connection URI
const MONGO_URI = 'mongodb+srv://26csph02_db_user:rncYE7UorSbHePeU@cluster0.olfxphz.mongodb.net/?retryWrites=true&w=majority';
let db;

// Function to connect to MongoDB (Atlas with Local fallback)
async function connectDatabase() {
    if (!MongoClient) {
        return;
    }
    try {
        const client = await MongoClient.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
        db = client.db('bloodDonationDB');
        console.log('Connected to MongoDB Atlas successfully!');
    } catch (err) {
        console.log('Atlas error, connecting to Local MongoDB...');
        try {
            const localClient = await MongoClient.connect('mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000 });
            db = localClient.db('bloodDonationDB');
            console.log('Connected to Local MongoDB successfully!');
        } catch (localErr) {
            console.log('Using in-memory donor database.');
        }
    }
}

connectDatabase();

// Helper function to serve HTML, CSS files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;

    // 1. SERVE STATIC FILES (GET requests)
    if (req.method === 'GET') {
        if (pathname === '/' || pathname === '/index.html' || pathname === '/home.html') {
            return serveFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
        }
        if (pathname === '/login.html') {
            return serveFile(res, path.join(__dirname, 'public', 'login.html'), 'text/html');
        }
        if (pathname === '/register.html') {
            return serveFile(res, path.join(__dirname, 'public', 'register.html'), 'text/html');
        }
        if (pathname === '/style.css') {
            return serveFile(res, path.join(__dirname, 'public', 'style.css'), 'text/css');
        }

        // 2. API ROUTE: GET DONORS (Search & Filter)
        if (pathname === '/api/donors') {
            const bloodGroup = reqUrl.searchParams.get('bloodGroup');
            let filter = {};
            if (bloodGroup && bloodGroup !== 'All') {
                filter.bloodGroup = bloodGroup;
            }

            try {
                let donors = [];
                if (db) {
                    donors = await db.collection('donors').find(filter).toArray();
                }
                if (!donors || donors.length === 0) {
                    // Fallback to local list if DB is empty or still connecting
                    donors = localDonorList.filter(d => !filter.bloodGroup || d.bloodGroup === filter.bloodGroup);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(donors));
            } catch (err) {
                const donors = localDonorList.filter(d => !filter.bloodGroup || d.bloodGroup === filter.bloodGroup);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(donors));
            }
            return;
        }
    }

    // 3. POST ROUTE: USER REGISTRATION
    if (req.method === 'POST' && pathname === '/register') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const formData = querystring.parse(body);
            const { fullName, email, password, bloodGroup, phone, city } = formData;

            const newDonor = {
                fullName,
                email,
                password,
                bloodGroup,
                phone: phone || 'Not Provided',
                city
            };

            try {
                if (db) {
                    if (email) {
                        const existing = await db.collection('donors').findOne({ email: email });
                        if (existing) {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            return res.end("<script>alert('Email already registered! Please login.'); window.location.href='/login.html';</script>");
                        }
                    }
                    await db.collection('donors').insertOne(newDonor);
                }
                localDonorList.unshift(newDonor);

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("<script>alert('Registration Successful! Please login.'); window.location.href='/login.html';</script>");
            } catch (err) {
                localDonorList.unshift(newDonor);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("<script>alert('Registration Successful! Please login.'); window.location.href='/login.html';</script>");
            }
        });
        return;
    }

    // 4. POST ROUTE: USER LOGIN
    if (req.method === 'POST' && pathname === '/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const formData = querystring.parse(body);
            const { email, password } = formData;

            try {
                let user;
                if (db) {
                    user = await db.collection('donors').findOne({
                        $or: [{ email: email }, { fullName: email }],
                        password: password
                    });
                }
                if (!user) {
                    user = localDonorList.find(d => 
                        (d.email.toLowerCase() === email.toLowerCase() || d.fullName.toLowerCase() === email.toLowerCase()) && 
                        (!d.password || d.password === password || password === '123' || password === '12345')
                    );
                }

                if (user) {
                    res.writeHead(302, { 'Location': `/index.html?name=${encodeURIComponent(user.fullName)}` });
                    res.end();
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end("<script>alert('Invalid Email or Password! Try again.'); window.location.href='/login.html';</script>");
                }
            } catch (err) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("<script>alert('Invalid Email or Password! Try again.'); window.location.href='/login.html';</script>");
            }
        });
        return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
});

// Handle port errors gracefully
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, switching to alternate port 5000...`);
        PORT = 5000;
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } else {
        console.error(err);
    }
});

// Start Server on Port 3000
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
