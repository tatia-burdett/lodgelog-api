const UserService = {
  getAllUsers(knex) {
    return knex.select('*').from('lodgelog_users')
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('lodgelog_users')
      .returning('*')
      .then(rows => {
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

  getAddressForUsers(knex, userid) {
    return knex
      .from('lodgelog_address AS add')
      .select('*')
      .where('add.userid', userid)
      .leftJoin(
        'lodgelog_users AS usr',
        'add.userid',
        'usr.id'
      )
      .groupBy('add.id', 'usr.id')
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