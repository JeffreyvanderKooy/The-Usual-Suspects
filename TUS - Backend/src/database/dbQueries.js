// # ________________________________IMPORTS...______________________________________ # //
const db = require('./db');
const appError = require('../utils/appError');

// # ________________________________DB QUERIES______________________________________ # //

/**
 * 
 * @param {String} id User ID
 * @param {String} raid Validated raid
 * @param {Number} bonus New bonus value to insert
 * @returns {Object} Response object from Database containing row that was updated
 * @description Updated the "attendance" of an users reserved item in given raid
 */
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

/**
 * 
 * @param {Object} data Object containing "raid" to remove from and userID 
 * @returns {Number} 1 if query was succesfully and item was deleted, 0 if no item was deleted
 * @description Removes an item from the given "raid"
 */
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

/**
 * 
 * @param {Object} data Object containg "id", "item", "name", "raid" 
 * @returns {Object} New row inserted into the database for given item
 * @description Inserts a new item in the given "raid" table
 */
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

/**
 * 
 * @param {String} raid Raid to select all items from 
 * @returns {Array<Object>} an array containing all reserved items
 */
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

/**
 * 
 * @returns {Array<Object>} Array containing all registered users
 */
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

/**
 * 
 * @param {String} name users name
 * @param {String} pin users pin
 * @returns {Object} Object containing users info
 */
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

/**
 * 
 * @param {String} name Users name
 * @param {String} pin Users pin
 * @returns {Object} Returns the new user
 */
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

/**
 * 
 * @param {String} id ID to search for
 * @returns {Object} A single user matching the ID, undefined if none
 */
async function getUserById(id) {
  const query = `
  SELECT id, name, admin FROM users
  WHERE id = $1;
  `;

  const values = [id];

  try {
    const res = await db.query(query, values);
    const [user] = res.rows;

    return user;
  } catch (err) {
    throw err;
  }
}

// Export the handlers...
module.exports = {
  incrementAttendance,
  deleteItem,
  submitItem,
  getItems,
  getUsers,
  getUser,
  insertUser,
  getUserById,
};
