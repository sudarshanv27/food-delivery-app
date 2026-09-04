const axios = require('axios');

async function testSignup() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/signup', {
            full_name: 'Sudarshan V',
            email: 'vsudarshan652@gmail.com',
            phone: '1234567890',
            password: '123456'
        });
        console.log('Signup success:', response.data);
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

testSignup();