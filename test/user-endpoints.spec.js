const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const fixtures = require('./test_fixtures')
const supertest = require('supertest')
const { expect } = require('chai')

describe('User endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the tables', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE lodgelog_address, lodgelog_users RESTART IDENTITY CASCADE'))

  describe('POST /api/user', () => {

    context('User validation', () => {
      
      const testUsers = fixtures.makeUsersArray()

      beforeEach('insert user', () => {
        fixtures.seedUser(
          db,
          testUsers
        )
      })

    const requiredFields = ['username', 'password']

      requiredFields.forEach(field => {
        const signUpAttemptBody = {
          username: testUsers[0].username,
          password: testUsers[0].password
        }

        it(`responds with 400 when ${field} is missing`, () => {
          delete signUpAttemptBody[field]

          return supertest(app)
            .post('/api/user')
            .send(signUpAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            })
        })
      })
      
      it(`responds with 400 'Password must be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
          username: 'TestUser',
          password:  '1234567'
        }
        return supertest(app)
          .post('/api/user')
          .send(userShortPassword)
          .expect(400, {
            error: `Password must be longer than 8 characters`
          })
      })

      it(`responds with 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          username: 'TestUser',
          password: '1'.repeat(73)
        }
        return supertest(app)
         .post('/api/user')
         .send(userLongPassword)
         .expect(400, {
           error: `Password must be less than 72 characters`
         })
      })

      it(`it responds with 400 when password starts with spaces`, () => {
        const userPasswordSpacesStart = {
          username: 'TestUser',
          password: ' passwordspaces'
        }
        return supertest(app)
          .post('/api/user')
          .send(userPasswordSpacesStart)
          .expect(400, {
            error: `Password must not start or end with empty spaces`
          })
      })

      it(`responds with 400 when password ends with spaces`, () => {
        const userPasswordSpacesEnd = {
          username: 'TestUser',
          password: 'passwordspaces '
        }
        return supertest(app)
          .post('/api/user')
          .send(userPasswordSpacesEnd)
          .expect(400, {
            error: `Password must not start or end with empty spaces`
          })
      })

      it(`responds with 400 'Username already exists' when username isn't unique`, () => {
        const duplicateUser = {
          username: testUsers[0].username,
          password: 'testpassword'
        }
        return supertest(app)
          .post('/api/user')
          .send(duplicateUser)
          .expect(400, {
            error: `Username already exists`
          })
      })
    })

    context('Happy path', () => {
      it(`responds with 201, serialized user, storing bcryped password`, () => {
        const newUser = {
          username: 'TesUser',
          password: 'testpassword'
        }
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.username).to.eql(newUser.username)
            expect(res.body).to.not.have.property('password')
            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
            const actualDate = new Date(res.body.date_created).toLocaleString()
            expect(actualDate).to.eql(expectedDate)
          })
          .expect(res => {
            db
              .from('lodgelog_users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username)
                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                const actualDate = new Date(row.date_created).toLocaleString()
                expect(actualDate).to.eql(expectedDate)

                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true
              })
          })
      })
    })
  })
})