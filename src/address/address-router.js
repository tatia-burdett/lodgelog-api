const path = require('path')
const express = require('express')
const AddressService = require('./address-service')
const { requireAuth } = require('../middleware/basic-auth')
const UserService = require('../user/user-service')

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
  userid: address.userid
})

addressRouter
  .route('/')
  // .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    AddressService.getAllAddresses(knexInstance)
      .then(address => {
        res.json(address.map(serializeAddress))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { from_date, to_date, street_address, unit, city, abb_state, zipcode, current, userid} = req.body
    const newAddress = { from_date, to_date, street_address, unit , city, abb_state, zipcode, current, userid }
    const requiredFields = { from_date, street_address, city, abb_state, zipcode, userid }

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        })
      }
    }

    AddressService.inserAddress(
      req.app.get('db'),
      newAddress
    )
      .then(address => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${address.id}`))
          .json(serializeAddress(address))
      })
      .catch(next)
  })

addressRouter
  .route('/:userid')
  // .all(requireAuth)
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    console.log(req.params.userid)
    AddressService.getAddressForUsers(
      knexInstance,
      req.params.userid
    )
      .then(user => {
        console.log(user)
        res.json(user)
      })
      .catch(next)
  })

addressRouter.route('/:id')
  .all(requireAuth)
  .all((req, res, next) => {
    AddressService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(address => {
        if (!address) {
          return res.status(404).json({
            error: { message: `Address doesn't exist` }
          })
        }
        res.address = address
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeAddress(res.address))
  })
  .delete((req, res, next) => {
    AddressService.deleteAddress(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { from_date, to_date, street_address, unit, city, abb_state, zipcode, current } = req.body
    const addressToUpdate = { from_date, to_date, street_address, unit, city, abb_state, zipcode, current }

    const numberOfValues = Object.values(addressToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain a 'from_date', 'to_date", 'street_address', 'unit', 'city', 'abb_state', 'zipcode', or 'current'` }
      })
    }
    AddressService.updateAddress(
      req.app.get('db'),
      req.params.id,
      addressToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = addressRouter