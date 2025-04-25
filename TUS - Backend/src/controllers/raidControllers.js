// # ________________________________IMPORTS...______________________________________ # //
const dbQuery = require('../database/dbQueries');

const { capitalize } = require('../utils/helper');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const { emitEvent } = require('./eventController');

// # ________________________________MIDDLEWARE______________________________________ # //

// Checks if given "raid" is supported
exports.validateRaid = (req, res, next) => {
  const raid = req.body.raid || req.query.raid; // Extract raids from payload

  // ALlowed raids to loop over
  const raidsAllowed = [
    'blackwing_lair',
    'emerald_sanctum',
    'molten_core',
    'ahn_qiraj',
  ];

  // Define message as empty var
  let message;

  // No raid found
  if (!raid) message = 'Please enter a valid raid.';

  // Raid is not supported
  else if (!raidsAllowed.includes(raid))
    message = 'Selected raid is not supported.';

  // Message is not undefined, throw an error containing the message
  if (message) return next(new appError(message, 400));

  // No error, next()
  next();
};

// # ________________________________RAID ROUTE HANDLERS______________________________________ # //

// Fetches all data for given raid
exports.fetchRaid = catchAsync(async (req, res) => {
  // 1. validate raid
  const raid = req.query.raid;

  // 2. get all items belonging to this raid
  const rows = await dbQuery.getItems(raid);

  // 3. response
  res.json({ ok: true, data: { raid, rows } });
});

// Increments or decrements the "bonus" field
exports.patchBonus = catchAsync(async (req, res, next) => {
  // 1. destructure req.body
  const { id, raid, bonus } = req.body;

  // 2. check for missing parameters
  if (!id) return next(new appError('Missing parameter: ID!', 400));
  if (bonus < 0 || isNaN(bonus))
    return next(new appError('Missing parameter: Bonus!', 400));

  // 3. update the "bonus" column in selected raid at id
  const { rows } = await dbQuery.incrementAttendance(id, raid, bonus);

  // No item couldnt be find with given ID
  if (rows.length === 0)
    return next(new appError(`No item found for given ID in ${raid}.`, 400));

  // 3A item patched, emit event to frontend for live updating
  emitEvent('itemPatch', {
    ...rows[0],
    raid,
    rows: await dbQuery.getItems(raid),
  });

  // 4. response
  res.status(201).json({ ok: true, data: rows });
});

// "Reserves" an item from given raid, inserting it into the database
exports.reserveItem = catchAsync(async (req, res, next) => {
  // 1. destructure req.body
  const { item, id, name, raid } = req.body;

  // 2. check for missing parameters
  if (!item) return next(new appError('Missing parameter: item!', 400));
  if (!id) return next(appError('Missing parameter: ID!', 400));
  if (!name) return next(new appError('Missing parameter: name!', 400));

  // 3. data to send to database
  const data = {
    item: capitalize(item),
    id,
    raid,
    name: capitalize(name),
  };

  // 4. submit item returning the submitted item
  const result = await dbQuery.submitItem(data);

  // 5. Emit Websocket event to frontend for live update
  emitEvent('itemReserve', {
    ...result[0],
    raid,
    rows: await dbQuery.getItems(raid),
  });

  // 6. Response
  res.status(201).json({ ok: true, data: result });
});

// Deletes a item from given raid
exports.deleteItem = catchAsync(async (req, res, next) => {
  // 1. get id from req.body
  const id = +req.body.id;

  // 2. validate the raid from req.body
  const raid = req.body.raid;

  // 3. data to send to DB
  const data = { id, raid };

  // 4. delete the item returning the deleted item, throws error if no item was found to delete
  const result = await dbQuery.deleteItem(data);
  if (!result) return next(new appError('No item found for given ID', 400));

  // 4A emit websocket event for live update to frontend
  emitEvent('itemDelete', { id, raid, rows: await dbQuery.getItems(raid) });

  // 5. response
  res.status(202).json({ ok: true, data: result });
});
