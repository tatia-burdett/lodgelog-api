const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const fixtures = require('./test_fixtures')
const supertest = require('supertest')


describe('Auth endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy)

  before('clean the table', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  describe.only('POST /api/auth/login', () => {
    const testUsers = fixtures.makeUsersArray()

    beforeEach('insert user', () => {
      fixtures.seedUser(
        db,
        testUsers
      )
    })

    const requiredFields = ['username', 'password']

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: testUsers[0].username,
        password: testUsers[0].password
      }

      it (`responds with 400 when '${field}' is missing`, () => {
        delete loginAttemptBody[field]

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          })
      })
    })

    it(`responds with 400 and 'invalid username or password' when bad username`, () => {
      const invalidUser = { username: 'invalid', password: 'existy' }
      return supertest(app)
        .post('/api/auth/login')
        .send(invalidUser)
        .expect(400, {
          error: `Incorrect username or password`
        })
    })

    it(`responds with 400 and 'invalid username or password' when bas password`, () => {
      const invalidUser = { username: testUsers[0].username, password: 'incorrect' }
      return supertest(app)
        .post('/api/auth/login')
        .send(invalidUser)
        .expect(400, {
          error: `Incorrect username or password`
        })
    })
  })
})