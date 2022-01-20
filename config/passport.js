const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user.model')

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username})
            if(!user || !user.validPassword(password)) {
                return done(null, false, {
                    message: 'There was a problem logging in. Check your email and password'
                })
            }
            return done(null, user,{ message: 'Logged In Successfully'})
        } catch (err) {
            return done(null, false, {statusCode: 400, message: err.message})
        }
    }
))