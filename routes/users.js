const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Use model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Password do not match' });
  }
  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at leat 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exist
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        // Generate an apiKey
        const apiKey = uuidv4();

        const newUser = new User({ name, email, password, apiKey });

        // Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            // Set apiKey to hashed
            newUser.password = hash;

            console.log(newUser);
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash('success_msg', 'You are now registered and can login');
                res.redirect('/users/login');
              })
              .catch((err) => console.log('err'));
          })
        );
      }
    });
  }
});

module.exports = router;
