const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisfy = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
  });

  exports.logout = (req, res) => {
      req.logout();
      req.flash('success', 'You are now logged out! 👋')
      res.redirect('/');
  }

  exports.isLoggedIn = (req, res, next) => {
      //first check if the user is authenticated
      if (req.isAuthenticated()) {
          next();//carry on.  THey are logged in
          return
      }
      req.flash('error', 'Oops you must be logged in to do that!');
      res.redirect('/login');
  }

  exports.forgot = async (req, res) => {
      //See if user exists
      const user = await User.findOne({ email: req.body.email })
      if(!user) {
          req.flash('error', 'No account with that email exists')
          return res.redirect('/login')
      }
      //If user reset tokens and expiry on their account
      user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordExpires = Date.now() + 3600000; //1 hour to reset from now
      await user.save();
      //Send them an email with the token
      const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
      await mail.send({
          user,
          subject: 'Password Reset',
          resetURL,
          filename: 'password-reset',
      })
      req.flash('success', `You have been emailed a password reset link. `)
      //redirect to login page
      res.redirect('/login')
  }

  exports.reset = async (req, res) => {
      const user = await User.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) {
          req.flash('error', 'Password reset is invalid or has expired')
          return res.redirect('/login');
      }
      //if there is a user, show the reset password form
      res.render('reset', { title: 'Reset your Password' });
  }

  exports.confirmedPasswords = (req, res, next ) => {
    if(req.body.password === req.body['password-confirm']) {
        next(); //keep going
        return;
    }
    req.flash('error', 'Passwrods do not match!');
    res.redirect('back');
  }

  exports.update = async (req, res ) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired')
        return res.redirect('/login');
    }

    const setPassword = promisfy(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', '🙌Nice! Your Passwrod has been reset! You are now logged in!');
    res.redirect('/');
  }