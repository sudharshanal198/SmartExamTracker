const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({ email });
    } catch (dbErr) {
      console.error("DEBUG DB FIND ERROR: ", dbErr);
      return res.status(500).json({ error: "DB FIND FAIL", details: dbErr.message });
    }

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password
    });

    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    } catch(hashErr) {
       console.error("HASH ERR:", hashErr);
       return res.status(500).json({ error: "HASH_FAIL", details: hashErr.message });
    }

    try {
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (saveErr) {
       console.error("SAVE ERR:", saveErr);
       return res.status(500).json({ error: "SAVE_FAIL", stack: saveErr.stack, details: saveErr.message });
    }
  } catch (err) {
    console.error("DEBUG REGISTER ERROR OBJECT: ", JSON.stringify(err, null, 2));
    console.error("DEBUG REGISTER ERROR MESSAGE: ", err.message);
    res.status(500).json({ message: 'Registration failed', stack: err.stack, detail: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    if (!lastActive) {
      user.streak = 1;
    } else {
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    }
    user.lastActiveDate = new Date();
    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email: user.email, streak: user.streak, lastActiveDate: user.lastActiveDate } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
