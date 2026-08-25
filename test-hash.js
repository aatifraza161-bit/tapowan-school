const { db: tursoClient } = require('./server/db');
const bcrypt = require('bcryptjs');

const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('testpassword', 10);
console.log('Hashed:', hash);
const match = bcrypt.compareSync('testpassword', hash);
console.log('Match:', match);
