const dbQuery = require('../database/dbQueries');

const { validateName, validatePin } = require('../helpers/helper');

exports.validateInfo = (req, res, next) => {
  const errorMessage1 = validateName(req.body.name);
  const errorMessage2 = validatePin(req.body.pin);

  if (errorMessage1 || errorMessage2)
    return res
      .status(400)
      .json({ ok: false, message: errorMessage1 || errorMessage2 });

  next();
};

exports.fetchUsers = async (req, res) => {
  try {
    // 1. retrieve all users form DB
    const users = await dbQuery.getUsers();

    // 2. response
    res.json({ ok: true, data: users });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    // 1. desctructure req.body
    const { name, pin } = req.body;

    // 2. get the user
    const user = await dbQuery.getUser(name, pin);

    // 3. response
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    // 1. desctructure req.body
    const { name, pin } = req.body;

    // 2. insert a new user returning the user
    const user = await dbQuery.insertUser(name, pin);

    // 3. response
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
