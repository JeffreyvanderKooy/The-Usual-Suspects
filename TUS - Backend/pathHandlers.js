const dbQuery = require('./database/dbQueries');

const {
  capitalize,
  validateName,
  validatePin,
  validateRaid,
} = require('./helper');

async function fetchUsers(req, res) {
  try {
    // 1. retrieve all users form DB
    const users = await dbQuery.getUsers();

    // 2. response
    res.json({ ok: true, data: users });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function loginUser(req, res) {
  try {
    // 1. validate name and pin
    const name = validateName(req.body.name);
    const pin = validatePin(req.body.pin);

    // 2. get the user
    const user = await dbQuery.getUser(name, pin);

    // 3. response
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function registerUser(req, res) {
  try {
    // 1. validate name and pin
    const name = validateName(req.body.name);
    const pin = validatePin(req.body.pin);

    // 2. insert a new user returning the user
    const user = await dbQuery.insertUser(name, pin);

    // 3. response
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function fetchRaid(req, res) {
  try {
    // 1. validate raid
    const raid = validateRaid(req.query.raid);

    // 2. get all items belonging to this raid
    const rows = await dbQuery.getItems(raid);

    // 3. response
    res.json({ ok: true, data: { raid, rows } });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function patchBonus(req, res) {
  try {
    // 1. destructure req.body
    const { id, raid, bonus } = req.body;

    // 2. check for missing parameters
    if (!id) throw new Error('Missing parameter: ID!');
    if (bonus < 0) throw new Error('Missing parameter: Bonus!');

    // 3. update the "bonus" column in selected raid at id
    const result = await dbQuery.incrementAttendance(id, raid, bonus);

    // 4. response
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function reserveItem(req, res) {
  try {
    // 1. destructure req.body
    const { item, id, name } = req.body;

    // 2. validate the raid input
    const raid = validateRaid(req.body.raid);

    // 3. check for missing parameters
    if (!item) throw new Error('Missing parameter: item!');
    if (!id) throw new Error('Missing parameter: ID!');
    if (!name) throw new Error('Missing parameter: name!');

    // 4. data to send to database
    const data = {
      item: capitalize(item),
      id,
      raid,
      name: capitalize(name),
    };

    // 5. submit item returning the submitted item
    const result = await dbQuery.submitItem(data);

    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function deleteItem(req, res) {
  try {
    // 1. get id from req.body
    const id = +req.body.id;

    // 2. validate the raid from req.body
    const raid = validateRaid(req.body.raid);

    // 3. data to send to DB
    const data = { id, raid };

    // 4. delete the item returning the deleted item
    const result = await dbQuery.deleteItem(data);

    // 5. response
    res.status(202).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = {
  loginUser,
  registerUser,
  fetchRaid,
  fetchUsers,
  reserveItem,
  deleteItem,
  patchBonus,
};
