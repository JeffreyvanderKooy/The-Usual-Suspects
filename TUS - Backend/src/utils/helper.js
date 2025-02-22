const appError = require('./appError');

function capitalize(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}

function validateName(name) {
  let message;

  if (!name) message = 'Please enter your ingame name.';
  if (name.split(' ').length > 1) message = 'Username must be one word.';
  if (name.split('').some(i => isFinite(i)))
    message = 'Username may not contain numbers.';

  if (message) return new appError(message, 400);
  else return false;
}
function validatePin(pin) {
  let message;

  if (!isFinite(+pin)) message = 'Only numbers are allowed for a pin.';
  if (pin?.toString().trim().length !== 4)
    message = 'A pin must be 4 characters long.';
  if (!pin) message = 'Please enter a pin.';

  if (message) return new appError(message, 400);
  else return false;
}

function validateRaid(raid) {
  if (!raid) throw new appError('Please enter a valid raid.', 400);

  const raidsAllowed = [
    'blackwing_lair',
    'emerald_sanctum',
    'molten_core',
    'ahn_qiraj',
  ];

  if (!raidsAllowed.includes(raid))
    throw new appError('Selected raid is not supported.', 400);

  return raid;
}

module.exports = { validateName, validatePin, validateRaid, capitalize };
