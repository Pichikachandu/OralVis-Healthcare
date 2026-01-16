const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user (patient or admin)
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ msg: 'Name is required' });
    }
    let patientID;
    if (role === 'patient') {
      // Generate unique Patient ID (e.g., ORALVIS-123456)
      let isUnique = false;
      while (!isUnique) {
        const randomId = Math.floor(100000 + Math.random() * 900000);
        patientID = `ORALVIS-${randomId}`;
        const existing = await User.findOne({ patientID });
        if (!existing) isUnique = true;
      }
    }
    const user = new User({ name, email, password, role, patientID });
    await user.save();
    res.status(201).json({ msg: 'User registered successfully', patientID });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    res.status(400).json({ msg: err.message });
  }
};

// Login existing user
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      patientID: user.patientID,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Logout endpoint (client should clear stored token)
const logout = (req, res) => {
  res.json({ msg: 'Logout successful (client should remove token)' });
};

// Verify token and return fresh user data (excluding password)
const verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { register, login, logout, verify };