const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../database/dbQueries');

// cookie expires in 90 days
const cookieExpiration = new Date(Date.now() + 90 * 24 * 60 * 1000);

// cookie options
const cookieOptions = {
  httpOnly: true,
  expires: cookieExpiration,
};

if (process.env.NODE_ENV === 'production') {
  cookieOptions.sameSite = 'None';
  cookieOptions.secure = true;
}

exports.cookieOptions = cookieOptions;

// returns signed token
const token = userId =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.token = token;

// returns decoded token
const decodeToken = async token => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new appError('Invalid Token.', 203);
  }
};

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
  res.cookie('jwt', token(user.id), cookieOptions);
  res.status(200).json({ ok: true, data: { user } });
});

exports.logout = (req, res) => {
  const options = { ...cookieOptions };
  delete options.expires;
  res.clearCookie('jwt', options);
  res.status(203).json({ ok: true });
};
