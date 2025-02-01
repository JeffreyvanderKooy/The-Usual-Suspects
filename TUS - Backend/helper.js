function capitalize(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}

function validateName(name) {
  if (!name) throw new Error('Please enter your ingame name.');
  if (name.split(' ').length > 1) throw new Error('Username must be one word.');
  if (name.split('').some(i => isFinite(i)))
    throw new Error('Username may not contain numbers.');

  return name.toLowerCase().trim();
}
function validatePin(pin) {
  if (!pin) throw new Error('Please enter your pin.');
  if (!isFinite(+pin)) throw new Error('Only numbers are allowed for pin.');
  if (pin.toString().trim().length !== 4)
    throw new Error('Pin must be 4 characters long.');

  return pin;
}

function validateRaid(raid) {
  if (!raid) throw new Error('Please enter a valid raid.');

  const raidsAllowed = ['blackwing_lair', 'emerald_sanctum', 'molten_core'];

  if (!raidsAllowed.includes(raid))
    throw new Error('Selected raid is not supported.');

  return raid;
}

module.exports = { validateName, validatePin, validateRaid, capitalize };
