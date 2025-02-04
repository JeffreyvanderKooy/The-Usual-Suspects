function capitalize(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}

function validateName(name) {
  if (!name) return 'Please enter your ingame name.';
  if (name.split(' ').length > 1) return 'Username must be one word.';
  if (name.split('').some(i => isFinite(i)))
    return 'Username may not contain numbers.';
}
function validatePin(pin) {
  if (!pin) return 'Please enter your pin.';
  if (!isFinite(+pin)) return 'Only numbers are allowed for pin.';
  if (pin.toString().trim().length !== 4)
    return 'Pin must be 4 characters long.';
}

function validateRaid(raid) {
  if (!raid) throw new Error('Please enter a valid raid.');

  const raidsAllowed = ['blackwing_lair', 'emerald_sanctum', 'molten_core'];

  if (!raidsAllowed.includes(raid))
    throw new Error('Selected raid is not supported.');

  return raid;
}

module.exports = { validateName, validatePin, validateRaid, capitalize };
