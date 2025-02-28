export async function getJSON(url, method = 'GET', body) {
  const res = await fetch(url, {
    method: method, // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Specify content type
    },
    credentials: 'include',
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await res.json();

  // Incase API limit is reached
  if (data.error) throw new Error(data.error);

  return data;
}

export function capitalize(str) {
  return str
    .toLowerCase()
    .replaceAll('_', ' ')
    .split(' ')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}

export function sortDate(a, b) {
  [a, b] = [a, b].map(item => {
    const [date, time] = item.formatted_date.replaceAll(' ', '').split(',');
    const [dd, mm, yy] = date.split('/');
    return new Date(`${mm}/${dd}/${yy}, ${time}`);
  });

  return a - b;
}

export function validateInput(query) {
  try {
    const { name, pin } = query;

    if (!name) throw new Error('Please enter your ingame name.');
    if (name.split(' ').length > 1)
      throw new Error('Username must be one word.');
    if (name.split('').some(i => isFinite(i)))
      throw new Error('Username may not contain numbers.');
    if (!pin) throw new Error('Please enter your pin.');
    if (!isFinite(+pin)) throw new Error('Only numbers are allowed for pin.');
    if (pin.toString().trim().length !== 4)
      throw new Error('Pin must be 4 characters long.');

    return { name: name.toLowerCase().trim(), pin };
  } catch (error) {
    throw error;
  }
}
