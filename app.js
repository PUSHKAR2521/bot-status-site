const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 8888;

let botStatus = {
    status: 'Offline',
    uptime: 'N/A',
    cpuUsage: 'N/A',
    memoryUsage: 'N/A',
};

let maintenanceMode = false;
let maintenanceEndTime = null;
let statusTimeout;

// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Initialize Passport and use session with it
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with Discord Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify'],
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Middleware to check if user is admin
function adminOnly(req, res, next) {
    const adminIds = process.env.ADMIN_IDS.split(',');
    if (req.isAuthenticated() && adminIds.includes(req.user.id)) {
        return next();
    }
    res.redirect('/login');
}

// Socket.io connection and bot status logic
io.on('connection', (socket) => {
    console.log('Dashboard client connected');

    // Send initial bot status and maintenance settings to newly connected clients
    socket.emit('statusUpdate', botStatus);
    socket.emit('maintenanceUpdate', { maintenanceMode, maintenanceEndTime });

    socket.on('statusUpdate', (data) => {
        botStatus = data;
        botStatus.status = '🟢 All Systems operational';

        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            botStatus.status = '🔴 System having issue';
            botStatus.uptime = 'N/A';
            botStatus.cpuUsage = 'N/A';
            botStatus.memoryUsage = 'N/A';
            io.emit('statusUpdate', botStatus);
        }, 300000); // 5 minutes in milliseconds
    });
});

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('status', { botStatus, maintenanceMode, maintenanceEndTime });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/admin');
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Admin page for toggling maintenance mode
app.get('/admin', adminOnly, (req, res) => {
    res.render('admin', { maintenanceMode, maintenanceEndTime });
});

// Set maintenance end time
app.post('/admin/set-maintenance-end', adminOnly, (req, res) => {
    const { endTime } = req.body;
    maintenanceEndTime = new Date(endTime);
    maintenanceMode = true;
    io.emit('maintenanceUpdate', { maintenanceMode, maintenanceEndTime });
    res.json({ success: true });
});

app.post('/admin/toggle-maintenance', adminOnly, (req, res) => {
    maintenanceMode = !maintenanceMode;
    if (!maintenanceMode) maintenanceEndTime = null;
    io.emit('maintenanceUpdate', { maintenanceMode, maintenanceEndTime });
    res.json({ maintenanceMode });
});

// Start server
server.listen(PORT, () => {
    console.log(`Dashboard server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
