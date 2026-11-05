// ======================================================
// Blood Donation Mini Project
// Built with pure Node.js and MongoDB (No Express framework)
// ======================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

const PORT = 3000;

// MongoDB Atlas Connection URI
const MONGO_URI = 'mongodb+srv://26csph02_db_user:rncYE7UorSbHePeU@cluster0.olfxphz.mongodb.net/?retryWrites=true&w=majority';
let db;

// Connect to MongoDB Database
MongoClient.connect(MONGO_URI)
    .then((client) => {
        db = client.db('bloodDonationDB');
        console.log('Connected to MongoDB Atlas successfully!');
    })
    .catch((err) => {
        console.log('Atlas error, trying local MongoDB:', err.message);
        MongoClient.connect('mongodb://127.0.0.1:27017')
            .then((client) => {
                db = client.db('bloodDonationDB');
                console.log('Connected to Local MongoDB!');
            })
            .catch((e) => console.log('Database error:', e.message));
    });

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
const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;

    // 1. SERVE STATIC FILES (GET requests)
    if (req.method === 'GET') {
        if (pathname === '/' || pathname === '/index.html') {
            return serveFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
        }
        if (pathname === '/register.html') {
            return serveFile(res, path.join(__dirname, 'public', 'register.html'), 'text/html');
        }
        if (pathname === '/home.html') {
            return serveFile(res, path.join(__dirname, 'public', 'home.html'), 'text/html');
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

            if (!db) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify([]));
            }

            db.collection('donors').find(filter).toArray()
                .then((donors) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(donors));
                })
                .catch((err) => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                });
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

            try {
                // Check if email already registered
                if (email) {
                    const existing = await db.collection('donors').findOne({ email: email });
                    if (existing) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        return res.end("<script>alert('Email already registered! Please login.'); window.location.href='/index.html';</script>");
                    }
                }

                // Insert new donor into MongoDB
                await db.collection('donors').insertOne({
                    fullName,
                    email,
                    password,
                    bloodGroup,
                    phone: phone || 'Not Provided',
                    city
                });

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("<script>alert('Registration Successful! Please login.'); window.location.href='/index.html';</script>");
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error registering user: ' + err.message);
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
                // Check credentials in database
                const user = await db.collection('donors').findOne({
                    $or: [{ email: email }, { fullName: email }],
                    password: password
                });

                if (user) {
                    // Login success -> redirect to home page
                    res.writeHead(302, { 'Location': `/home.html?name=${encodeURIComponent(user.fullName)}` });
                    res.end();
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end("<script>alert('Invalid Email or Password! Try again.'); window.location.href='/index.html';</script>");
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error during login: ' + err.message);
            }
        });
        return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
});

// Start Server on Port 3000
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
