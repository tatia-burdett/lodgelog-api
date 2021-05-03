const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const fixtures = require('./test_fixtures')

describe('Address Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destory)

  before('clean the table', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  describe(`GET /api/address`, () => {

    context(`Given no addresses`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get(`/api/address`)
          .expect(200, [])
      })
    })

    context(`Given there are addresses in the db`, () => {
      const testUsers = fixtures.makeUsersArray()
      const testAddress = fixtures.makeAddressArray(testUsers)

      beforeEach('insert addresses', () => {
        return db
          .into('lodgelog_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('lodgelog_address')
              .insert(testAddress)
          })
      })

      it('respond with 200 and all the addresses', () => {
        return supertest(app)
          .get('/api/address')
          .expect(200, testAddress)
      })
    })
  })
  
  describe(`GET /api/address/:id`, () => {
    
    context(`Given no address`, () => {
      it(`Responds with 404`, () => {
        const addressId = 123456
        return supertest(app)
          .get(`/api/address/${addressId}`)
          .expect(404, { error: { message: `Address doesn't exist` } })
      })
    })

    context(`Given there are address in the db`, () => {
      const testUsers = fixtures.makeUsersArray()
      const testAddress = fixtures.makeAddressArray(testUsers)

      beforeEach('insert addresses', () => {
        return db
          .into('lodgelog_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('lodgelog_address')
              .insert(testAddress)
          })
      })

      it(`responds with 200 and the specific address`, () => {
        const addressId = 2
        const expectedAddress = testAddress[addressId - 1]
        return supertest(app)
          .get(`/api/address/${addressId}`)
          .expect(200, expectedAddress)
      })
    })
  })

  describe(`POST /api/address`, () => {
    const testUsers = fixtures.makeUsersArray()

    beforeEach('insert users', () => {
      return db
        .into('lodgelog_users')
        .insert(testUsers)
    })

    it(`creates an address, responding with 201 and the new address`, () => {
      const newAddress = {
        from_date: '2010-01-01T08:00:00.000Z',
        to_date: '2012-06-20T07:00:00.000Z',
        street_address: '123 Test Blvd',
        unit: null,
        city: 'Testville',
        abb_state: 'TX',
        zipcode: 12345,
        current: false,
        userid: 4
      }

      return supertest(app)
        .post('/api/address')
        .send(newAddress)
        .expect(201)
        .expect(res => {
          expect(res.body.from_date).to.eql(newAddress.from_date)
          expect(res.body.to_date).to.eql(newAddress.to_date)
          expect(res.body.street_address).to.eql(newAddress.street_address)
          expect(res.body.unit).to.eql(newAddress.unit)
          expect(res.body.city).to.eql(newAddress.city)
          expect(res.body.abb_state).to.eql(newAddress.abb_state)
          expect(res.body.zipcode).to.eql(newAddress.zipcode)
          expect(res.body.current).to.eql(newAddress.current)
          expect(res.body.userid).to.eql(newAddress.userid)
          expect(res.headers.location).to.eql(`/api/address/${res.body.id}`)
          expect(res.body).to.have.property('id')
        })
        .then(res => {
          supertest(app)
            .get(`/api/address/${res.body.id}`)
            .expect(res.body)
        })
    })

    const requiredFields = ['from_date', 'street_address', 'city', 'abb_state', 'zipcode']

    requiredFields.forEach(field => {
      const newAddress = {
        from_date: '2010-01-01T08:00:00.000Z',
        street_address: '123 Test St',
        city: 'Testville',
        abb_state: 'KY',
        zipcode: 12345
      }

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newAddress[field]

        return supertest(app)
          .post(`/api/address`)
          .send(newAddress)
          .expect(400, {
            error: { message: `Missing ${field} in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/address/:id`, () => {
    
    context(`Given no address`, () => {
      it(`responds with 404`, () => {
        const addressId = 12345
        return supertest(app)
          .delete(`/api/address/${addressId}`)
          .expect(404, { error: { message: `Address doesn't exist` } })
      })
    })

    context(`Given there are addresses in the db`, () => {
      const testUsers = fixtures.makeUsersArray()
      const testAddress = fixtures.makeAddressArray(testUsers)

      beforeEach('insert address', () => {
        return db
          .into('lodgelog_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('lodgelog_address')
              .insert(testAddress)
          })
      })

      it(`responds with 204 and removes the address`, () => {
        const idToRemove = 2
        const expectedAddress = testAddress.filter(address => address.id !== idToRemove)
        return supertest(app)
          .delete(`/api/address/${idToRemove}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/address`)
              .expect(expectedAddress)
          })
      })
    })
  })

  describe(`PATCH /api/address/:id`, () => {

    context(`Given no addresses`, () => {
      it('responds with 404', () => {
        const addressId = 123456
        return supertest(app)
          .delete(`/api/address/${addressId}`)
          .expect(404, { error: { message: `Address doesn't exist` } })
      })
    })

    context(`Given there are address in the db`, () => {
      const testUsers = fixtures.makeUsersArray()
      const testAddress = fixtures.makeAddressArray(testUsers)

      beforeEach(`insert address`, () => {
        return db
          .into('lodgelog_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('lodgelog_address')
              .insert(testAddress)
          })
      })

      it('responds with 204 and updates the address', () => {
        const idToUpdate = 2
        const updateAddress = {
          from_date: '2018-01-01T08:00:00.000Z',
          to_date: '2020-01-01T08:00:00.000Z',
          street_address: '15 Updated St',
          unit: '19',
          city: 'Updatevill',
          abb_state: 'WY',
          zipcode: 98765,
          current: false
        }
        const expectedAddress = {
          ...testAddress[idToUpdate - 1],
          ...updateAddress
        }
        return supertest(app)
          .patch(`/api/address/${idToUpdate}`)
          .send(updateAddress)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/address/${idToUpdate}`)
              .expect(expectedAddress)
          })
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/address/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request body must contain a 'from_date', 'to_date", 'street_address', 'unit', 'city', 'abb_state', 'zipcode', or 'current'`}
          })
      })

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2
        const updateAddress = {
          street_address: '123 Updated St'
        }
        const expectedAddress = {
          ...testAddress[idToUpdate - 1],
          ...updateAddress
        }

        return supertest(app)
          .patch(`/api/address/${idToUpdate}`)
          .send({
            ...updateAddress,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/address/${idToUpdate}`)
              .expect(expectedAddress)
          })
      })
    })
  })
})