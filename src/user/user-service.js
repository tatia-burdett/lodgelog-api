const bcrypt = require('bcryptjs')
const xss = require('xss')

const UserService = {
  hasUserWithUsername(knex, username) {
    return knex('lodgelog_users')
      .where({ username })
      .first()
      .then(user => !!user)
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('lodgelog_users')
      .returning('*')
      .then(([user]) => user)
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    return null
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },

  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
      date_created: new Date(user.date_created)
    }
  }
}

module.exports = UserService