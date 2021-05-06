const path = require('path')
const express = require('express')
const UserService = require('./user-service')

const userRouter = express.Router()
const jsonParser = express.json()

userRouter
  .post('/', jsonParser, (req, res, next) => {
    const { password, username } = req.body
    const newUser = { password, username}

    for (const [key, value] of Object.keys(newUser)) {
      if (!value) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
      }
    }

    const passwordError = UserService.validatePassword(password)

    if (passwordError) {
      return res.status(400).json({ error: passwordError })
    }

    UserService.hasUserWithUsername(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUsername => {
        if (hasUserWithUsername) {
          return res.status(400).json({
            error: 'Username already exists'
          })
        }
        return UserService.hashPassword(password) 
          .then(hashedPassword => {
            const newUser = {
              username,
              password: hashedPassword,
              date_created: 'now()'
            }

            return UserService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UserService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

module.exports = userRouter