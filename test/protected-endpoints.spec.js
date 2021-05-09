const knex = require('knex')
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

  const protectedEndpoints = [
    {
      name: 'GET'
    }
  ]
})