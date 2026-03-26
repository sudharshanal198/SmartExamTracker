import http from 'http';

const data = JSON.stringify({
  email: 'test5@gmail.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log('RESPONSE:', body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
