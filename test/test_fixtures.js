const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'Test User 1',
      password: 'password1',
      date_created: new Date().toISOString()
    },
    {
      id: 2,
      username: 'Test User 2',
      password: 'password2',
      date_created: new Date().toISOString()
    },
    {
      id: 3,
      username: 'Test User 3',
      password: 'password3',
      date_created: new Date().toISOString()
    },
    {
      id: 4,
      username: 'Test User 4',
      password: 'password4',
      date_created: new Date().toISOString()
    },
  ]
}

function makeAddressArray(users) {
  return [
    {
      id: 1,
      from_date: '2010-01-01T08:00:00.000Z',
      to_date: '2012-06-20T07:00:00.000Z',
      street_address: '123 Test St',
      unit: null,
      city: 'Testville',
      abb_state: 'AL',
      zipcode: 12345,
      current: false,
      userid: users[0].id
    },
    {
      id: 2,
      from_date: '2015-01-01T08:00:00.000Z',
      to_date: '2018-06-20T07:00:00.000Z',
      street_address: '234 Test Ave',
      unit: '15',
      city: 'Testville',
      abb_state: 'GA',
      zipcode: 23456,
      current: false,
      userid: users[1].id
    },
    {
      id: 3,
      from_date: '2018-01-01T08:00:00.000Z',
      to_date: null,
      street_address: '345 Test Blvd',
      unit: '3',
      city: 'Testville',
      abb_state: 'AK',
      zipcode: 34567,
      current: true,
      userid: users[2].id
    },
    {
      id: 4,
      from_date: '2020-01-01T08:00:00.000Z',
      to_date: null,
      street_address: '12 Test St',
      unit: '10',
      city: 'Testville',
      abb_state: 'FL',
      zipcode: 45678,
      current: true,
      userid: users[3].id
    },
    {
      id: 5,
      from_date: '2014-01-01T08:00:00.000Z',
      to_date: '2017-12-20T08:00:00.000Z',
      street_address: '138 Test Ave',
      unit: '28',
      city: 'Testville',
      abb_state: 'CA',
      zipcode: 56789,
      current: false,
      userid: users[2].id
    },
  ]
}

function makeAddressFixtures() {
  const testUsers = makeUsersArray()
  const testAddress = makeAddressArray(testUsers)
  return { testUsers, testAddress }
}

function seedUser(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('lodgelog_users').insert(preppedUsers)
    .then(() =>
      db.raw(
        `SELECT setval('blogful_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

module.exports = {
  makeUsersArray,
  makeAddressArray,
  makeAddressFixtures,
  seedUser
}