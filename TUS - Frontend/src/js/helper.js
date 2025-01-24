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

  return data;
}

export function capitalize(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}

export function sortDate(a, b) {
  [a, b] = [a, b].map(item => {
    const [date, time] = item.formatted_date.replaceAll(' ', '').split(',');
    const [dd, mm, yy] = date.split('/');
    return new Date(`${mm}/${dd}/${yy}, ${time}`);
  });

  return b - a;
}
