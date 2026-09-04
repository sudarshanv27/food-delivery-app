const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running!' });
});

app.post('/api/auth/signup', (req, res) => {
    console.log('Signup request received:', req.body);
    res.json({ 
        success: true, 
        token: 'test-token',
        user: { id: '1', name: req.body.full_name, email: req.body.email }
    });
});

app.post('/api/auth/login', (req, res) => {
    console.log('Login request received:', req.body);
    res.json({ 
        success: true, 
        token: 'test-token',
        user: { id: '1', name: 'Test User', email: req.body.email }
    });
});

app.get('/api/restaurants/nearby', (req, res) => {
    res.json({
        success: true,
        restaurants: [
            { restaurant_id: '1', name: 'Pizza Paradise', description: 'Best pizza', address: '123 Main St', avg_rating: 4.5, delivery_fee: 2.99 },
            { restaurant_id: '2', name: 'Burger King', description: 'Juicy burgers', address: '456 Oak Ave', avg_rating: 4.2, delivery_fee: 1.99 }
        ]
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`   POST /api/auth/signup`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET /api/restaurants/nearby`);
    console.log(`   GET /health`);
});