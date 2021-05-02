const path = require('path')
const express = require('express')
const AddressService = require('./address-service')

const addressRouter = express.Router()
const jsonParser = express.json()

const serializeAddress = address => ({
  id: address.id,
  from_date: address.from_date,
  to_date: address.to_date,
  street_address: address.street_address,
  unit: address.unit,
  city: address.city,
  abb_state: address.abb_state,
  zipcode: address.zipcode,
  current: address.current,
  userId: address.userId
})

addressRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    AddressService.getAllAddresses(knexInstance)
      .then(address => {
        res.json(address.map(serializeAddress))
      })
      .catch(next)
  })

module.exports = addressRouter