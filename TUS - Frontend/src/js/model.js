import { getJSON, validateInput } from './helper';
import { API_URL } from './config';

export const state = {
  curUser: { id: undefined, name: undefined, admin: false },
  curRaid: { name: undefined, reserves: [] },
};

export async function login(query, val) {
  const path = val ? 'login' : 'register';

  try {
    const { name, pin } = validateInput(query);

    const body = { name, pin };

    const res = await getJSON(`${API_URL}/api/v1/users/${path}`, 'POST', body);

    updateCurUser(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function fetchRaid(query) {
  try {
    const res = await getJSON(`${API_URL}/api/v1/raids/raid?raid=${query}`);

    updateCurRaid(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function incrementAttendance(query) {
  try {
    const res = await getJSON(`${API_URL}/api/v1/raids/bonus`, 'PATCH', query);

    if (!res.ok) throw new Error(res.message);

    await fetchRaid(query.raid);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function reserve(query) {
  try {
    const res = await getJSON(`${API_URL}/api/v1/raids/reserve`, 'POST', query);

    if (!res.ok) throw new Error(res.message);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function deleteReserve(query) {
  try {
    const res = await getJSON(
      `${API_URL}/api/v1/raids/reserve`,
      'DELETE',
      query
    );

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
