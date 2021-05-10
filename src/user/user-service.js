const bcrypt = require('bcryptjs')
const xss = require('xss')

const UserService = {
  getAllUsers(knex) {
    return knex.select('*').from('lodgelog_users')
  },

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

  deleteUser(knex, id) {
    return knex('lodgelog_users')
      .where({ id })
      .delete()
  },

  validatePassword(password) {
    if (password.length < 3) {
      return 'Password must be longer than 3 characters'
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
  },

  getById(knex, id) {
    return knex
      .from('lodgelog_users')
      .select('*')
      .where('id', id)
      .first()
  },

  getAddressForUsers(knex, userid) {
    return knex
      .from('lodgelog_address AS add')
      .select('*')
      .where('add.userId', userid)
      .leftJoin(
        'lodgelog_users AS usr',
        'add.userId',
        'usr.id'
      )
      .groupBy('add.id', 'usr.id')
  },

  serializeUserAddress(address) {
    return {
      id: address.id,
      from_date: address.from_date,
      to_date: address.to_date,
      street_address: address.street_address,
      unit: address.unit,
      city: address.city,
      abb_state: address.abb_state,
      zipcode: address.zipcode,
      current: address.current,
      userId: address.userid
    }
  }
}

module.exports = UserService