const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
console.log("SERVER ENV:", process.env.RAZORPAY_KEY_ID);
console.log("SERVER SECRET:", process.env.RAZORPAY_KEY_SECRET);

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');


const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');



app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/kitchen', (req, res) => res.sendFile(path.join(__dirname, 'public', 'kitchen.html')));
app.get('/display', (req, res) => res.sendFile(path.join(__dirname, 'public', 'display.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Smart Canteen running on port ${PORT}`));

module.exports = app;