var knex = require('knex')( {
    client: 'mysql2',
    connection: {
      host : 'localhost',
      user : 'admin',
      password : 'password',
      database : 'api_users'
    }
  } );

module.exports = knex
