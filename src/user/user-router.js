const path = require('path')
const express = require('express')
const UserService = require('./user-service')

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

module.exports = userRouter