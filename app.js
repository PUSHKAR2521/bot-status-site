const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
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


app.get('/dashboard', (req, res) => {
    res.render('comingSoon',{  });
});

// Start server
server.listen(PORT, () => {
    console.log(`Dashboard server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
