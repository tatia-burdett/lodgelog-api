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
  }
}

module.exports = AddressService