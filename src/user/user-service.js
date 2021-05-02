const UserService = {
  getAllUsers(knex) {
    return knex.select('*').from('lodgelog_users')
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('lodgelog_users')
      .returning('*')
      .then(row => {
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex
      .from('lodgelog_users')
      .select('*')
      .where('id', id)
      .first()
  },

  deleteUser(knex, id) {
    return knex('lodgelog_users')
      .where({ id })
      .delete()
  },

  updateUser(knex, id, newUserFields) {
    return knex('lodgelog_users')
      .where({ id })
      .update(newUserFields)
  }
}

module.exports = UserService