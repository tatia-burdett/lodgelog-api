const path = require('path')
const express = require('express')
const UserService = require('./user-service')
const { requireAuth } = require('../middleware/basic-auth')

const userRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
  id: user.id,
  username: user.username,
  password: user.password,
  date_created: user.date_created
})

userRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UserService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser))
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
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

userRouter
  .route('/:id/address')
  .all(requireAuth)
  .all((req, res, next) => {
    UserService.getById(
      req.app.get('db'),
      req.params.userId
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    UserService.getAddressForUsers(
      req.app.get('db'),
      req.params.id
    )
      .then(address => {
        res.json(address.map(UserService.serializeUserAddress))
      })
      .catch(next)
  })

module.exports = userRouter