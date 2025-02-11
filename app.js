// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);
// const PORT = process.env.PORT || 5555;

// // Set up view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'public')));

// // Routes
// app.get('/', (req, res) => {
//     res.render('status', {  });
// });

// app.get('/musicDash', (req, res) => {
//     res.render('musicStatus',{  });
// });


// app.get('/dashboard', (req, res) => {
//     res.render('comingSoon',{  });
// });

// // Start server
// server.listen(PORT, () => {
//     console.log(`Dashboard server is running on port ${PORT}`);
//     console.log(`http://localhost:${PORT}`);
// });

// app.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5555;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const UPTIMEROBOT_API_KEY = process.env.UPTIMEAPI;
const UPTIMEROBOT_API_URL = 'https://api.uptimerobot.com/v2/getMonitors';

// All Services Page
app.get('/', async (req, res) => {
  try {
    const response = await axios.post(UPTIMEROBOT_API_URL, {
      api_key: UPTIMEROBOT_API_KEY,
      format: 'json',
      logs: 1,
    });
    const monitors = response.data.monitors;
    res.render('newUptimeStatusPage', { monitors });
  } catch (error) {
    console.error('Error fetching UptimeRobot data:', error);
    res.render('newUptimeStatusPage', { monitors: [] });
  }
});

// Up Services Page
app.get('/up', async (req, res) => {
  try {
    const response = await axios.post(UPTIMEROBOT_API_URL, {
      api_key: UPTIMEROBOT_API_KEY,
      format: 'json',
      logs: 1,
    });
    // Filter monitors with status === 2 (Up)
    const monitors = response.data.monitors.filter(monitor => monitor.status === 2);
    res.render('upServices', { monitors });
  } catch (error) {
    console.error('Error fetching UptimeRobot data:', error);
    res.render('upServices', { monitors: [] });
  }
});

// Down Services Page
app.get('/down', async (req, res) => {
  try {
    const response = await axios.post(UPTIMEROBOT_API_URL, {
      api_key: UPTIMEROBOT_API_KEY,
      format: 'json',
      logs: 1,
    });
    // Filter monitors with status !== 2 (Down)
    const monitors = response.data.monitors.filter(monitor => monitor.status !== 2);
    res.render('downServices', { monitors });
  } catch (error) {
    console.error('Error fetching UptimeRobot data:', error);
    res.render('downServices', { monitors: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
