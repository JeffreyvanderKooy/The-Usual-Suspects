// # ________________________________IMPORTS...______________________________________ # //
import { getJSON, validateInput } from '../helper';
import { API_URL } from '../config';
import { capitalize } from '../helper';

// # ________________________________GLOBAL STATE TO USE ACROSS APPLICATION______________________________________ # //

export const state = {
  curUser: { id: undefined, name: undefined, admin: false },
  curRaid: { name: undefined, rows: [] },
};

// # ________________________________MODEL FUNCTIONS______________________________________ # //


/**
 * 
 * @param {Object} query Object containing "name" and "pin"
 * @param {Boolean} val "true" for login attempt, "false" to register a new user 
 * @returns {Object} response object from backend
 */
export async function login(query, val) {
  // Define path
  const path = val ? 'login' : 'register';

  try {
    // Validate input
    const { name, pin } = validateInput(query);

    // Define payload
    const body = { name, pin };

    // Send payload
    const res = await getJSON(`${API_URL}/api/v1/users/${path}`, 'POST', body);

    // Error occured on backen, bubble up the error
    if (!res.ok) throw new Error(res.message);

    // Update the current user in the state
    updateCurUser(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

/**
 * 
 * @param {String} query Raid to fetch
 * @returns {Array<Object>} Response object from backend, array containg all items for given raid 
 */
export async function fetchRaid(query) {
  try {
    // Query backend
    const res = await getJSON(`${API_URL}/api/v1/raids/raid?raid=${query}`);

    // Error occured, bubble up the error
    if (!res.ok) throw new Error(res.message);

    // Update current raid in state
    updateCurRaid(res.data);

    return res;
  } catch (err) {
    throw err;
  }
}

/**
 * @description Attempts to log in the user with stored cookie
 * @returns {Object} Object containg logged in users data
 */
export async function tryLoginUser() {
  try {
    // Send cookie to backend
    const res = await getJSON(`${API_URL}/api/v1/users/login/cookie`);

    // Error occured, bubble up the error
    if (!res.ok) throw new Error(res.message);

    // Update the current user in the state
    updateCurUser(res.data.user);

    return res.data.user;
  } catch (err) {
    throw err;
  }
}

/**
 * 
 * @param {Object} query 
 * @returns {Object} response object from backend
 * @description Patches the attendance for current raid
 */
export async function incrementAttendance(query) {
  try {
    // Send response to server
    const res = await getJSON(`${API_URL}/api/v1/raids/bonus`, 'PATCH', query);

    // Error occured on backen, bubble up the error
    if (!res.ok) throw new Error(res.message);

    // Fetch items again for new raid, now including the updated info
    await fetchRaid(query.raid);

    return res;
  } catch (err) {
    throw err;
  }
}

/**
 * @description Reserves an item for current raid
 * @param {Object} query 
 * @returns {Object} Response object from backend
 */
export async function reserve(query) {
  try {
    // Send payload
    const res = await getJSON(`${API_URL}/api/v1/raids/reserve`, 'POST', query);

    // Error occured, bubble up the error
    if (!res.ok) throw new Error(res.message);

    return res;
  } catch (err) {
    throw err;
  }
}

/**
 * @description Makes a delete request to the server for given item
 * @param {Object} query 
 * @returns {Object} Response object from backend
 */
export async function deleteReserve(query) {
  try {
    // Send payload
    const res = await getJSON(
      `${API_URL}/api/v1/raids/reserve`,
      'DELETE',
      query
    );

    // Error occured, bubble up the error
    if (!res.ok) throw new Error(res.message);

    return res;
  } catch (err) {
    throw err;
  }
}

/**
 * @description Logs out the current user
 * @returns {Object} response object from server
 */
export async function logoutCurUser() {
  try {
    const res = await getJSON(`${API_URL}/api/v1/users/logout`);
    return res;
  } catch (err) {
    throw err;
  }
}

// Handlers for updating the global state
export function updateCurUser(newUser) {
  newUser.name = capitalize(newUser.name);
  state.curUser = newUser;
}
export function updateCurRaid(newRaid) {
  state.curRaid = newRaid;
}
