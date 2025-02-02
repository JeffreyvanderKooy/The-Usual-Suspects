const dbQuery = require('../database/dbQueries');

const { capitalize } = require('../helper');

exports.validateRaid = (req, res, next) => {
  const raid = req.body.raid || req.query.raid;
  const raidsAllowed = ['blackwing_lair', 'emerald_sanctum', 'molten_core'];
  let message;

  if (!raid) message = 'Please enter a valid raid.';
  else if (!raidsAllowed.includes(raid))
    message = 'Selected raid is not supported.';

  if (message) return res.status(400).json({ ok: false, message });

  next();
};

exports.fetchRaid = async (req, res) => {
  try {
    // 1. validate raid
    const raid = req.query.raid;

    // 2. get all items belonging to this raid
    const rows = await dbQuery.getItems(raid);

    // 3. response
    res.json({ ok: true, data: { raid, rows } });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.patchBonus = async (req, res) => {
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
};

exports.reserveItem = async (req, res) => {
  try {
    // 1. destructure req.body
    const { item, id, name, raid } = req.body;

    // 2. check for missing parameters
    if (!item) throw new Error('Missing parameter: item!');
    if (!id) throw new Error('Missing parameter: ID!');
    if (!name) throw new Error('Missing parameter: name!');

    // 3. data to send to database
    const data = {
      item: capitalize(item),
      id,
      raid,
      name: capitalize(name),
    };

    // 4. submit item returning the submitted item
    const result = await dbQuery.submitItem(data);

    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    // 1. get id from req.body
    const id = +req.body.id;

    // 2. validate the raid from req.body
    const raid = req.body.raid;

    // 3. data to send to DB
    const data = { id, raid };

    // 4. delete the item returning the deleted item
    const result = await dbQuery.deleteItem(data);

    // 5. response
    res.status(202).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
