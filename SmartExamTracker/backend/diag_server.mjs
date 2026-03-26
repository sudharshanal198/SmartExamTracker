import express from 'express';
import bodyParser from 'body-parser';

import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  console.log("RECEIVED BODY:", req.body);
  
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Missing email or password", received: req.body });
  }

  res.status(201).json({ message: 'Success' });
});

app.listen(5001, () => {
    console.log("Diag server running on 5001");
});
