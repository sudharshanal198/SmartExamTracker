import fetch from 'node-fetch';

async function testApi() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fetchuser@gmail.com', password: 'password123' })
    });
    
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testApi();
