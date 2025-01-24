import { getJSON } from './helper';
import { API_URL } from './config';

export const state = {
  curUser: { id: undefined, name: undefined, admin: false },
  curRaid: { name: undefined, reserves: [] },
};

export async function login(query) {
  try {
    const { name, pin } = query;

    if (!name) throw new Error('Please enter your ingame name.');
    if (!pin) throw new Error('Please enter your pin');
    if (pin.toString().length !== 4)
      throw new Error('Pin must be 4 characters long.');

    const body = { name, pin };

    const res = await getJSON(`${API_URL}/login`, 'POST', body);

    updateCurUser(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function register(query) {
  try {
    const { name, pin } = query;

    if (!name) throw new Error('Please enter your ingame name.');
    if (!pin) throw new Error('Please enter your pin');
    if (pin.toString().length !== 4)
      throw new Error('Pin must be 4 characters long.');

    const body = { name, pin };

    const res = await getJSON(`${API_URL}/register`, 'POST', body);

    updateCurUser(res.data[0]);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function fetchRaid(query) {
  try {
    const res = await getJSON(`${API_URL}/raid?raid=${query}`);

    updateCurRaid(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function incrementAttendance(query) {
  try {
    const res = await getJSON(`${API_URL}/bonus`, 'POST', query);

    await fetchRaid(query.raid);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function reserve(query) {
  try {
    const res = await getJSON(`${API_URL}/reserve`, 'POST', query);

    if (!res.ok) throw new Error(res.message);

    return res;
  } catch (err) {
    throw err;
  }
}

function updateCurUser(newUser) {
  state.curUser = newUser;
}

function updateCurRaid(newRaid) {
  state.curRaid = newRaid;
}
