// polyfilling
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as model from './model';

import loginView from './views/loginView';
import headerView from './views/headerView';
import modalView from './views/modalView';
import reserveView from './views/reserveView';
import tableView from './views/tableView';

import { HEADER_DELAY_MS } from './config';

async function controlSubmit(val) {
  try {
    modalView.loader(true);

    // get info from the View
    const { handler, ...rest } = loginView.submit(val);

    // call the right handler (registering or logging in)
    const res = handler ? await model.login(rest) : await model.register(rest);

    if (!res.ok) throw new Error(res.message);

    // small succes message
    modalView.succes();

    // render the page
    setTimeout(() => headerView.render(model.state.curUser), HEADER_DELAY_MS);
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
    // fetches the data for given raid
    const res = await model.fetchRaid(query);

    if (!res.ok) throw new Error(res.message);
    console.log(model.state.curRaid);

    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
    tableView.render(model.state.curRaid);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
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
    tableView.render(model.state.curRaid);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    modalView.loader(false);
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

    modalView.succes();
    reserveView.setPlaceholders(model.state.curRaid, model.state.curUser);
    tableView.render(model.state.curRaid);
  } catch (err) {
    modalView.error(err.message);
    console.error(err);
  } finally {
    modalView.loader(false);
  }
}

(async function init() {
  // adding event handlers
  loginView.addHandlerSubmit(controlSubmit);
  headerView.addHandlerLogout(loginView.render, loginView);
  headerView.addHandlerFetchRaid(controlFetchRaid);
  reserveView.addHandlerReserve(controlReserve);
  reserveView.addHandlerAttendance(controlAttendance);

  loginView.render();
})();
