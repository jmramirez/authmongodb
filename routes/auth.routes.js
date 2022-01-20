const express = require('express')
const authCtrl = require('../controllers/auth.controller')

const router = express.Router()

router.post('/auth/login', authCtrl.login)

module.exports = router
