// polyfilling
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as model from '../models/model';

import loginView from '../views/loginView';
import headerView from '../views/headerView';
import modalView from '../views/modalView';
import reserveView from '../views/reserveView';
import tableView from '../views/tableView';

import { HEADER_DELAY_MS } from '../config';

import socket from '../websocket/websocket';

async function controlSubmit(val) {
  try {
    modalView.loader(true);

    // get info from the View
    const { handler, ...rest } = loginView.submit(val);

    // call the right handler (registering or logging in)
    const res = await model.login(rest, handler);

    if (!res.ok) throw new Error(res.message);

    // small succes message
    modalView.succes();

    // render the page
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
    // rerenders the login modal with a message
    loginView.render(error.message);
    console.error(error);
  } finally {
    modalView.loader(false);
  }
}

async function controlFetchRaid(query) {
  try {
    tableView.loader(true);

    // fetches the data for given raid
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

async function controlReserve(item) {
  const { name, id } = model.state.curUser;
  const { raid } = model.state.curRaid;

  const query = { name, id, raid, item };

  try {
    modalView.loader(true);

    await model.reserve(query);
    await model.fetchRaid(raid);

    modalView.succes();
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    modalView.loader(false);
  }
}

async function controlDelete() {
  const { id } = model.state.curUser;
  const { raid } = model.state.curRaid;

  const query = { id, raid };

  try {
    const res = await model.deleteReserve(query);

    if (!res.ok) throw new Error(res.message);

    await model.fetchRaid(raid);

    modalView.succes();
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  }
}

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

    modalView.succes();
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    modalView.loader(false);
  }
}

async function controlLogout() {
  try {
    const res = await model.logoutCurUser();

    if (!res.ok) throw new Error(res.message);

    loginView.render();
  } catch (error) {
    console.error(err);
    modalView.error(err.message);
  }
}

async function controlRefreshTable() {
  try {
    await model.fetchRaid(model.state.curRaid.raid);

    tableView.renderRows(model.state.curRaid.rows).clearSearchInput();
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  }
}

function controlSearchAndRender(rows = model.state.curRaid.rows) {
  tableView.searchAndRender(rows);
}

function addHandlerSocket(socket) {
  socket.on('itemReserve', controlSocketUpdate);
  socket.on('itemDelete', controlSocketUpdate);
  socket.on('itemPatch', controlSocketUpdate);
}

function controlSocketUpdate(data) {
  if (data.raid === model.state.curRaid.raid) controlSearchAndRender(data.rows);
}

(async function init() {
  // adding event handlers
  loginView.addHandlerSubmit(controlSubmit);
  headerView.addHandlerLogout(controlLogout);
  headerView.addHandlerFetchRaid(controlFetchRaid);
  reserveView.addHandlerReserve(controlReserve);
  reserveView.addHandlerDelete(controlDelete);
  reserveView.addHandlerAttendance(controlAttendance);
  tableView.addHandlerRefresh(controlRefreshTable);
  tableView.addHandlerSearch(controlSearchAndRender);

  socket.on('connect', () => addHandlerSocket(socket));

  model
    .tryLoginUser()
    .then(_ => headerView.render(model.state.curUser))
    .catch(err => {
      console.log(err);
      loginView.render();
    });
})();
