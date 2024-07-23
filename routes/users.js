const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//Bring in user Model
let User = require('../models/user');

//Register Form
router.get('/register',function(req,res){
    res.render('register');
}); 

//Register Process
router.post('/register', async function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
  
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(password);
  
    const errors = req.validationErrors();
  
    if (errors) {
      res.render('register', {
        errors: errors
      });
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
  
        const newUser = new User({
          name: name,
          email: email,
          username: username,
          password: hash
        });
  
        await newUser.save();
        req.flash('success', 'You are now registered and can log in');
        res.redirect('/users/login');
      } catch (err) {
        console.error(err);
        // Handle the error, e.g., send an error response or redirect to an error page
      }
    }
  });
  
//Login form
router.get('/login',function(req,res){
    res.render('login'); 
});

//  Login process
router.post('/login', function(req,res,next){
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req,res,next);
});

//Logout process
router.get('/logout', function(req, res) {
  req.logOut(function(err) {
    if (err) {
      console.error(err);
    }
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
  });
});


module.exports = router;