const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const { use } = require('passport');

module.exports = function(passport){
    //Local Strategy
    passport.use(new LocalStrategy(async function(username, password, done) {
        try {
            // Match Username
            let query = { username: username };
            const user = await User.findOne(query);
            if (!user) {
                return done(null, false, { message: 'No user found' });
            }

            // Match Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Wrong password' });
            }
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function(id, done) {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}
