const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 5555;

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('status', {  });
});

app.get('/musicDash', (req, res) => {
    res.render('musicStatus',{  });
});

// app.get('/login', (req, res) => {
//     res.render('login');
// });

// app.get('/auth/discord', passport.authenticate('discord'));
// app.get('/auth/discord/callback', passport.authenticate('discord', {
//     failureRedirect: '/login'
// }), (req, res) => {
//     res.redirect('/admin');
// });

// app.get('/logout', (req, res) => {
//     req.logout(() => {
//         res.redirect('/');
//     });
// });

// // Admin page for toggling maintenance mode
// app.get('/admin', adminOnly, (req, res) => {
//     res.render('admin', { maintenanceMode, maintenanceEndTime });
// });

// // Set maintenance end time
// app.post('/admin/set-maintenance-end', adminOnly, (req, res) => {
//     const { endTime } = req.body;
//     maintenanceEndTime = new Date(endTime);
//     maintenanceMode = true;
//     io.emit('maintenanceUpdate', { maintenanceMode, maintenanceEndTime });
//     res.json({ success: true });
// });

// app.post('/admin/toggle-maintenance', adminOnly, (req, res) => {
//     maintenanceMode = !maintenanceMode;
//     if (!maintenanceMode) maintenanceEndTime = null;
//     io.emit('maintenanceUpdate', { maintenanceMode, maintenanceEndTime });
//     res.json({ maintenanceMode });
// });

// Start server
server.listen(PORT, () => {
    console.log(`Dashboard server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
