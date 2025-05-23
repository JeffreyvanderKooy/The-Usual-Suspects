// # ________________________________GLOBAL ERROR HANDLER______________________________________ # //
function sendErrorDev(err, res) {
  if (err.isOperational)
    res.status(err.statusCode).json({ ok: false, message: err.message });
  else {
    console.error(err);

    res
      .status(500)
      .json({ ok: false, message: err.message, error: err, stack: err.stack });
  }
}

function sendErrorProd(err, res) {
  if (err.isOperational)
    res.status(err.statusCode).json({ ok: false, message: err.message });
  else {
    console.error(err);

    res
      .status(500)
      .json({
        ok: false,
        message: 'Oops! Something went wrong, please try again later.',
      });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') sendErrorProd(err, res);
};
