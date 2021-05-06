const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router()
const jsonParser = express.json()

authRouter
  .post('/login', jsonParser, (req, res, next) => {
    const { username, password } = req.body
    const loginUser = { username, password }

    for (const [key, value] of Object.entries(loginUser))
      if (!value) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
      }

      
  })