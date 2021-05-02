const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const fixtures = require('./test_fixtures')

describe('Address Endpoints', function() {
  let db

  const {
    testUsers,
    testAddress
  } = fixtures.makeAddressFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destory)

  before('clean the address table', () => db('lodgelog_address').truncate())

  before('clean the users table', () => db('lodgelog_users').truncate())

  afterEach('cleanup address', () => db('lodgelog_address').truncate())

  afterEach('cleanup users', () => db('lodgelog_users').truncate())

  
})