import { getJSON, validateInput } from '../helper';
import { API_URL } from '../config';
import socket from '../websocket/websocket';

export const state = {
  curUser: { id: undefined, name: undefined, admin: false },
  curRaid: { name: undefined, rows: [] },
};

export async function login(query, val) {
  const path = val ? 'login' : 'register';

  try {
    const { name, pin } = validateInput(query);

    const body = { name, pin };

    const res = await getJSON(`${API_URL}/api/v1/users/${path}`, 'POST', body);

    if (!res.ok) throw new Error(res.message);

    updateCurUser(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function fetchRaid(query) {
  try {
    const res = await getJSON(`${API_URL}/api/v1/raids/raid?raid=${query}`);

    if (!res.ok) throw new Error(res.message);

    updateCurRaid(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

export async function tryLoginUser() {
  try {
    const res = await getJSON(`${API_URL}/api/v1/users/login/cookie`);

    if (!res.ok) throw new Error(res.message);

    updateCurUser(res.data.user);

    return res.data.user;
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

export async function logoutCurUser() {
  try {
    const res = await getJSON(`${API_URL}/api/v1/users/logout`);
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
