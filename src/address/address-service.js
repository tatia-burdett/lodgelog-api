const AddressService = {
  getAllAddresses(knex) {
    return knex.select('*').from('lodgelog_address')
  },

  inserAddress(knex, newAddress) {
    return knex
      .insert(newAddress)
      .into('lodgelog_address')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex
      .from('lodgelog_address')
      .select('*')
      .where('id', id)
      .first()
  },

  deleteAddress(knex, id) {
    return knex('lodgelog_address')
      .where({ id })
      .delete()
  },

  updateAddress(knex, id, newAddressFields) {
    return knex('lodgelog_address')
      .where({ id })
      .update(newAddressFields)
  },

  getAddressForUsers(knex, id) {
    return knex
      .from('lodgelog_users AS usr')
      .select('*')
      .where('usr.id', id)
      .rightJoin(
        'lodgelog_address AS add',
        'usr.id',
        'add.userid'
      )
      .groupBy('usr.id', 'add.id')
  }
}

module.exports = AddressService