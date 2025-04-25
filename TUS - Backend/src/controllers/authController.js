// # ________________________________IMPORTS...______________________________________ # //
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../database/dbQueries');

// # ________________________________COOKIE CONFIG______________________________________ # //

/**
 * @description Returns a JS object containg cookie options
 * @returns {Object} Cookieoptions with expiration date set from 90 days from now
 */
const cookieOptions = () => {
  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  };

  // Production settings
  if (process.env.NODE_ENV === 'production') {
    options.sameSite = 'None';
    options.secure = true;
  }

  return options;
};

exports.cookieOptions = cookieOptions;

// # ________________________________JWT TOKEN CONFIG______________________________________ # //

/**
 * 
 * @param {String} userId 
 * @returns {Object<token>} Signed JWT token
 */
const token = userId =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.token = token;


/**
 * 
 * @param {Object<token>} Token 
 * @returns {Object} Decoded JWT token
 */
const decodeToken = async token => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new appError('Invalid Token.', 203);
  }
};

// # ________________________________AUTHENTICATION HANDLERS______________________________________ # //

// Logs the user in automatically if there is a cookie containg a JWT
exports.loginCookie = catchAsync(async (req, res, next) => {
  // 1. Get JWT token from request
  const { jwt } = req.cookies;

  if (!jwt) return next(new appError('Please login.', 203));

  // 2. verifiy token
  const { userId } = await decodeToken(jwt);

  // 3. get the user with the id
  const user = await getUserById(userId);

  if (!user) throw new appError('No user found with given ID!', 404);

  // send refresh cookie to the user
  res.cookie('jwt', token(user.id), cookieOptions());
  res.status(200).json({ ok: true, data: { user } });
});

// Logs the user out by deleting their cookie
exports.logout = (req, res) => {
  const options = { ...cookieOptions };
  delete options.expires;
  res.clearCookie('jwt', options);
  res.status(203).json({ ok: true });
};
