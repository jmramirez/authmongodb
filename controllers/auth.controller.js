const passport = require('passport')
const User = require('../models/user.model')
const errorHandler = require('../helpers/dbErrorHandler')
const jwt = require('express-jwt')
const config = require('./../config/config')



const login = async (req, res) => {
    passport.authenticate('local', (err, user, info) => {
        let token
        if(err) {
            return res
                .status(404)
                .json(err)
        }
        if(user){
            token = user.generateJwt()
            res.status(200)
                .json({ token })
        } else {
            res.status(401).json(info)
        }
    })(req, res)
}

const requireSignin = jwt({
    secret: config.jwtSecret,
    _userProperty: 'auth',
    algorithms: ['HS256']
})

const hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    if(!(authorized)) {
        return res.status('403').json({
            error: "User is not authorized"
        })
    }
    next()
}



module.exports = {
    login,
    requireSignin,
    hasAuthorization
}