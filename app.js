const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
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

let statusTimeout;

io.on('connection', (socket) => {
    console.log('Dashboard client connected');

    // Reset the timeout whenever a status update is received
    socket.on('statusUpdate', (data) => {
        botStatus = data;
        botStatus.status = '🟢 All Systems operational';

        // Reset the timeout for marking the bot as offline
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            botStatus.status = '🔴 System having issue';
            botStatus.uptime = 'N/A';
            botStatus.cpuUsage = 'N/A';
            botStatus.memoryUsage = 'N/A';
            io.emit('statusUpdate', botStatus); // Notify clients of the offline status
        }, 1000); // 5 minutes
    });

    // Send initial bot status to newly connected clients
    socket.emit('statusUpdate', botStatus);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('status', { botStatus });
});

server.listen(PORT, () => {
    console.log(`Dashboard server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
