const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const fixtures = require('./test_fixtures')

describe('Protected endpoints', () => {
  let db

  before('Make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the tables', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  const testUsers = fixtures.makeUsersArray()

  const protectedEndpoints = [
    {
      name: 'GET /api/address/user/:userid',
      path: '/api/address/user/1',
      method: supertest(app).get
    },
    {
      name: 'POST /api/auth/refresh',
      path: '/api/auth/refresh',
      method: supertest(app).post
    }
  ]

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {

      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' })
      })

      it(`responds with 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'
        return endpoint.method(endpoint.path)
          .set('Authorization', fixtures.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized request' })
      })

      it(`responds with 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'invaliduser', id: 1 }
        return endpoint.method(endpoint.path)
          .set('Authorization', fixtures.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' })
      })
    })
  })
})