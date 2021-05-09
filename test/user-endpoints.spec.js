const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const fixtures = require('./test_fixtures')

describe('User endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  
})