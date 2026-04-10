// ============================================================
//  server.js  –  Simple Node.js + Express Demo Server
//  PURPOSE  : Shows you understand Node.js backend concepts.
//             This is a SEPARATE demo from Flask.
//             Run: node server.js  (on port 3000)
//  INSTALL  : npm install express
// ============================================================

const express = require('express');
const app     = express();
const PORT    = 3000;

// Middleware: parse JSON body in POST requests
app.use(express.json());

// ── Dummy in-memory "database" (just an array) ──
// In the real project, Flask handles .npy file storage.
const registeredUsers = [
  { id: 1, name: 'Rahul',  frames: 30 },
  { id: 2, name: 'Priya',  frames: 25 },
];

// ── GET / : Home route ──
app.get('/', (req, res) => {
  res.send('<h1>Node.js Demo Server Running! 🚀</h1><p>Visit /users for API demo</p>');
});

// ── GET /users : Return all registered users as JSON ──
app.get('/users', (req, res) => {
  res.json({
    success : true,
    count   : registeredUsers.length,
    users   : registeredUsers
  });
});

// ── GET /users/:name : Get one user by name ──
app.get('/users/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const user = registeredUsers.find(u => u.name.toLowerCase() === name);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// ── POST /register : Add a new user ──
app.post('/register', (req, res) => {
  const { name, frames } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  const newUser = { id: registeredUsers.length + 1, name, frames: frames || 0 };
  registeredUsers.push(newUser);
  res.status(201).json({ success: true, user: newUser });
});

// ── DELETE /users/:name : Remove a user ──
app.delete('/users/:name', (req, res) => {
  const name  = req.params.name.toLowerCase();
  const index = registeredUsers.findIndex(u => u.name.toLowerCase() === name);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const removed = registeredUsers.splice(index, 1);
  res.json({ success: true, removed: removed[0] });
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`✅ Node.js demo server running at http://localhost:${PORT}`);
  console.log(`   GET  /users          → list all users`);
  console.log(`   GET  /users/:name    → get one user`);
  console.log(`   POST /register       → add a user`);
  console.log(`   DELETE /users/:name  → remove a user`);
});
