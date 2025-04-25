// Polyfills for compatibility
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Bootstrap dependencies
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

// App modules
import * as model from '../models/model';

import loginView from '../views/loginView';
import headerView from '../views/headerView';
import modalView from '../views/modalView';
import reserveView from '../views/reserveView';
import tableView from '../views/tableView';

import { HEADER_DELAY_MS, LOGOUT_DELAY_MS } from '../config';
import socket from '../websocket/websocket';

/**
 * Handles login or registration submission.
 * @param {Object} val - The form data from the login view.
 */
async function controlSubmit(val) {
  try {
    modalView.loader(true);

    // Get login/register handler and form data
    const { handler, ...rest } = loginView.submit(val);

    // Perform login or registration
    const res = await model.login(rest, handler);
    if (!res.ok) throw new Error(res.message);

    // Show welcome message
    modalView.succes(`Welcome ${model.state.curUser.name}`);

    // Delay header rendering slightly for UX
    setTimeout(() => {
      headerView.render({
        ...model.state.curUser,
        raid: model.state.curRaid.raid,
      });

      if (model.state.curRaid.raid) {
        reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
        tableView.render(model.state.curRaid);
      }
    }, HEADER_DELAY_MS);
  } catch (error) {
    loginView.render(error.message); // Show error in login modal
    console.error(error);
  } finally {
    modalView.loader(false);
  }
}

/**
 * Fetches raid data based on a query string and renders the table view.
 * @param {string} query - Raid identifier.
 */
async function controlFetchRaid(query) {
  try {
    tableView.loader(true);

    const res = await model.fetchRaid(query);
    if (!res.ok) throw new Error(res.message);

    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
    tableView.render(model.state.curRaid);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    tableView.loader(false);
  }
}

/**
 * Handles reserving an item for the current user.
 * @param {string} item - Item to reserve.
 */
async function controlReserve(item) {
  const { name, id } = model.state.curUser;
  const { raid } = model.state.curRaid;

  const query = { name, id, raid, item };

  try {
    modalView.loader(true);

    await model.reserve(query);
    await model.fetchRaid(raid);

    modalView.succes('Item reserved!');
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    modalView.loader(false);
  }
}

/**
 * Handles deletion of a reserved item.
 */
async function controlDelete() {
  const { id } = model.state.curUser;
  const { raid } = model.state.curRaid;

  const query = { id, raid };

  try {
    const res = await model.deleteReserve(query);
    if (!res.ok) throw new Error(res.message);

    await model.fetchRaid(raid);

    modalView.succes(`Item succesfully deleted.`);
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  }
}

/**
 * Updates attendance bonus for current user.
 * @param {number} attendance - Bonus amount to add.
 */
async function controlAttendance(attendance) {
  if (attendance < 0) return modalView.error();

  const { raid } = model.state.curRaid;
  const { id } = model.state.curUser;
  const query = { raid, id, bonus: attendance };

  try {
    modalView.loader(true);

    const res = await model.incrementAttendance(query);
    if (!res.ok) throw new Error(res.message);

    await model.fetchRaid(raid);

    modalView.succes('Attendance updated!');
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    modalView.loader(false);
  }
}

/**
 * Logs out the current user.
 */
async function controlLogout() {
  try {
    const res = await model.logoutCurUser();
    if (!res.ok) throw new Error(res.message);

    modalView.succes('Succesfully logged out.');
    setTimeout(() => loginView.render(), LOGOUT_DELAY_MS);
  } catch (error) {
    console.error(err);
    modalView.error(err.message);
  }
}

/**
 * Refreshes the table view by refetching raid data.
 */
async function controlRefreshTable() {
  try {
    await model.fetchRaid(model.state.curRaid.raid);

    tableView.renderRows(model.state.curRaid.rows).clearSearchInput();
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  }
}

/**
 * Performs a search and re-renders the table with filtered rows.
 * @param {Array} rows - Raid table rows (optional).
 */
function controlSearchAndRender(rows = model.state.curRaid.rows) {
  tableView.searchAndRender(rows);
}

/**
 * Adds websocket listeners for raid item updates.
 * @param {Object} socket - Socket.io connection.
 */
function addHandlerSocket(socket) {
  socket.on('itemReserve', controlSocketUpdate);
  socket.on('itemDelete', controlSocketUpdate);
  socket.on('itemPatch', controlSocketUpdate);
}

/**
 * Updates raid data from socket event.
 * @param {Object} data - Updated raid data.
 */
function controlSocketUpdate(data) {
  if (data.raid === model.state.curRaid.raid) {
    model.updateCurRaid({ rows: data.rows, raid: model.state.curRaid.raid });
    controlSearchAndRender(data.rows);
  }
}

// Initialize app
(async function init() {
  // Attach event handlers to views
  loginView.addHandlerSubmit(controlSubmit);
  headerView.addHandlerLogout(controlLogout);
  headerView.addHandlerFetchRaid(controlFetchRaid);
  reserveView.addHandlerReserve(controlReserve);
  reserveView.addHandlerDelete(controlDelete);
  reserveView.addHandlerAttendance(controlAttendance);
  tableView.addHandlerRefresh(controlRefreshTable);
  tableView.addHandlerSearch(controlSearchAndRender);

  socket.on('connect', () => addHandlerSocket(socket));

  // Try auto-login
  model
    .tryLoginUser()
    .then(_ => {
      headerView.render(model.state.curUser);
      modalView.succes(`Welcome ${model.state.curUser.name}`);
    })
    .catch(_ => loginView.render())
    .finally(_ => modalView.loader(false));
})();
