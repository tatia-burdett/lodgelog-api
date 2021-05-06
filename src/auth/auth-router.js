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
    
    AuthService.getUserWithUsername(
      req.app.get('db'),
      loginUser.username
    )
    .then(dbUser => {
      if (!dbUser) {
        return res.status(400).json({
          error: 'Incorrect username or password'
        })
      }

      return AuthService.comparePasswords(loginUser.password, dbUser.password)
        .then(compareMatch => {
          if (!compareMatch) {
            return res.status(400).json({
              error: 'Incorrect username or password'
            })
          }
          const sub = dbUser.username
          const payload = { id: dbUser.id}
          res.send({
            authToken: AuthService.createJwt(sub, payload)
          })
        })
    })
    .catch(next)
  })

authRouter
  .post('/refresh', requireAuth, (req, res, next) => {
    const sub = req.user.username
    const payload = { id: req.user.id }
    res.send({
      authToken: AuthService.createJwt(sub, payload)
    })
  })

module.exports = authRouter