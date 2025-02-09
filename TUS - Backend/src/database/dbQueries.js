const db = require('./db');
const appError = require('../helpers/appError');

async function incrementAttendance(id, raid, bonus) {
  // update the "bonus" column where id's match
  const query = `
                  UPDATE ${raid}
                  SET bonus = $1
                  WHERE id = $2;
                  `;
  const values = [bonus, id];

  try {
    await db.query(query, values);

    // select updated item
    const res = await db.query(
      `SELECT id, 
        name, 
        item, 
        TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date,
        bonus FROM ${raid} WHERE id = $1;`,
      [id]
    );
    return res;
  } catch (err) {
    throw err;
  }
}

async function deleteItem(data) {
  const { raid, id } = data;

  // delete from given raid where id's match
  const query = `
                    DELETE FROM ${raid}
                    WHERE id = $1;
                    `;

  const values = [id];

  try {
    const { rowCount } = await db.query(query, values);

    return rowCount;
  } catch (err) {
    throw err;
  }
}

// submit a item to reserve to database
async function submitItem(data) {
  const { id, item, name, raid } = data;

  // see if there is a item reserved already for this user
  const { rows } = await db.query(`SELECT * FROM ${raid} WHERE id = $1`, [id]);

  // if there is an item delete it from the database
  if (rows.length > 0)
    await db.query(`DELETE FROM ${raid} WHERE id = $1`, [id]);

  // insert new item into databse
  const query = ` 
      INSERT INTO ${raid} (id, item, name)
      VALUES ($1, $2, $3)
       RETURNING id, name, item, TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date;
    `;

  const values = [id, item, name];

  try {
    const { rows } = await db.query(query, values);
    return rows;
  } catch (err) {
    throw err;
  }
}

// get items for given raid from database
async function getItems(raid) {
  // retrieves all items from database for given raid
  const query = `
      SELECT 
        id, 
        name, 
        item, 
        TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date,
        bonus
      FROM ${raid};
    `;

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
}

// Fetches all users from database
async function getUsers() {
  // select all the users returning everything except their PIN
  const query = 'SELECT id, name, admin FROM users;';

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
}

// fetches a single user from database
async function getUser(name, pin) {
  // get the user info for given name
  const query = `
      SELECT id, name, admin, pin FROM users
      WHERE name = $1;
    `;

  const values = [name]; // Use parameterized queries to prevent SQL injection

  try {
    const res = await db.query(query, values);

    // get user from DB response
    const [user] = res.rows;

    // check if user exists
    if (!user)
      throw new appError('No user found! Have you made an account yet?', 400);
    // check if pins match
    if (user.pin != pin) throw new appError('Wrong pin!', 400);

    return user;
  } catch (err) {
    throw err;
  }
}

// inserts a new user into the database
async function insertUser(name, pin) {
  // check if there already is a user with this name
  const { rows: user } = await db.query('SELECT * FROM users WHERE name = $1', [
    name,
  ]);

  // if so throw error
  if (user.length > 0)
    throw new appError(
      'An account with this character name already exists!',
      400
    );

  // add new user into database
  const query = `
      INSERT INTO users (name, pin)
      VALUES ($1, $2)
      RETURNING id, name;
    `;
  const values = [name, pin];

  try {
    const res = await db.query(query, values);
    const [user] = res.rows;
    return user;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  incrementAttendance,
  deleteItem,
  submitItem,
  getItems,
  getUsers,
  getUser,
  insertUser,
};
