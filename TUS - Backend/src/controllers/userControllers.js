const dbQuery = require('../database/dbQueries');

const { validateName, validatePin } = require('../helpers/helper');
const catchAsync = require('../helpers/catchAsync');

exports.validateInfo = (req, res, next) => {
  // these functions return a error if it did not pass validation or return "false" if it did
  const err1 = validateName(req.body.name);
  const err2 = validatePin(req.body.pin);

  if (err1) return next(err1);
  if (err2) return next(err2);

  next();
};

exports.fetchUsers = catchAsync(async (req, res) => {
  // 1. retrieve all users form DB
  const users = await dbQuery.getUsers();

  // 2. response
  res.json({ ok: true, data: users });
});

exports.loginUser = catchAsync(async (req, res) => {
  // 1. desctructure req.body
  const { name, pin } = req.body;

  // 2. get the user
  const user = await dbQuery.getUser(name, pin);

  // 2A. remove pin from response data
  delete user.pin;

  // 3. response
  res.json({ ok: true, data: user });
});

exports.registerUser = catchAsync(async (req, res) => {
  // 1. desctructure req.body
  const { name, pin } = req.body;

  // 2. insert a new user returning the user
  const user = await dbQuery.insertUser(name, pin);

  // 2A. remove pin from response data
  delete user.pin;

  // 3. response
  res.json({ ok: true, data: user });
});
