const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { jwtSecret } =require('./../config/config')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: 'Email is required',
        uniqueCaseInsensitive: true
    },
    hashed_password: {
      type: String,
      required: "Password is required"
    },
    salt: String
})

userSchema
    .virtual('password')
    .set(function (password){
        this._password = password
        this.salt = crypto.randomBytes(16).toString('hex')
        this.hashed_password = this.setPassword(password)
    })
    .get(function () {
        return this._password
    })

userSchema.path('hashed_password').validate(function (v) {
    if(this._password && this._password.length < 6) {
        this.invalidate('password', 'Password must be at least 6 characters.')
    }
    if(this.isNew && !this._password) {
        this.invalidate('password', 'Password is again required')
    }
}, null)

userSchema.methods = {
    validPassword: function (password) {
        const hash = crypto
            .createHmac('sha1', this.salt).update(password).digest('hex')
        return this.hashed_password === hash
    },
    setPassword: function (password) {
      if(!password) return ''
      try {
          return crypto
              .createHmac('sha1', this.salt)
              .update(password)
              .digest('hex')
      } catch (err) {
          return ''
      }
    }
}

userSchema.methods.generateJwt = function () {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(expiry.getTime() / 1000, 10),
    }, jwtSecret)
}

userSchema.plugin(uniqueValidator, { message: 'There is already an user with that {PATH}'})

module.exports =  mongoose.model('User', userSchema)