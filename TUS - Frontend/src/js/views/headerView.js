import $ from 'jquery';
import View from './view';
import { capitalize } from '../helper';

class HeaderView extends View {
  _parentElement = $('header');

  constructor() {
    super();
  }

  // triggered when clicked on "Change User" button
  addHandlerLogout(handler, view) {
    $('body').on('click', '#logout', () =>
      handler.call(view, 'Change Character')
    );
  }

  // triggered when clicked on a raid button
  addHandlerFetchRaid(handler) {
    $('body').on('click', '.raid-button', e => {
      if ($(e.target).hasClass('active')) return;

      this._switchActive(e);

      const raid = $(e.target).data('raid');

      handler(raid);
    });
  }

  _generateMarkup() {
    return `<nav
      class="navbar bg-info-subtle border-body shadow-lg p-3 text-white position-relative"
      data-bs-theme="dark"
    >
      <h1 class="">${capitalize(this._data.name)}</h1>

      <div class="d-flex gap-3">
      <button class="btn raid-button bg-secondary-subtle fs-5 ${
        this._data.raid === 'molten_core' && 'active'
      }" data-raid="molten_core">
        Molten Core
      </button>
      <button class="btn raid-button bg-secondary-subtle fs-5 ${
        this._data.raid === 'blackwing_lair' && 'active'
      }" data-raid="blackwing_lair">
        Blackwing Lair
      </button>
      <button class="btn raid-button bg-secondary-subtle fs-5 ${
        this._data.raid === 'emerald_sanctum' && 'active'
      }" data-raid="emerald_sanctum">
        Emerald Sanctum
      </button>
       <button class="btn raid-button bg-secondary-subtle fs-5 ${
         this._data.raid === 'ahn_qiraj' && 'active'
       }" data-raid="ahn_qiraj">
        Temple of Ahn'Qiraj
      </button>
    </div>
      <h5>
        <button class="btn bg-secondary-subtle fs-5" id="logout">
          Change Character
          <i class="bi bi-person"></i>
        </button>
      </h5>
    </nav>
   

    <nav
      class="navbar border-body d-flex justify-content-evenly shadow-lg pt-3"
      
    >
      <div class="d-flex gap-3 align-items-center">
      <label for="reserve" class="fw-bold">Item: </label>
        <input id="reserve" type="text" autocomplete="off" class="form-control border" placeholder="none" />
        <button class="btn btn-outline-dark" id="submitReserve" disabled>Reserve</button>
        <button type="button" id="deleteReserve" disabled class="btn btn-outline-dark">
                <i class="bi bi-trash3-fill"></i>
              </button>
      </div>

      <div class="d-flex gap-3 align-items-center fs-4">
        <p class="mb-0" id="bonus-roll">0</p>
        <i class="bi bi-dice-6-fill"></i>
      </div>

       <div class="d-flex gap-3 d-flex align-items-center">
       <label for="attendance" class="fw-bold">Attendance: </label>
        <input id="attendance" type="number" class="form-control pointer-events-none border" value="0" min="0" step="1" readonly />
        <button class="btn btn-outline-dark submitAttendance" data-operator="+" disabled>+1</button>
        <button class="btn btn-outline-dark submitAttendance" data-operator="-" disabled>-1</button>
      </div>
    </nav>
`;
  }

  _switchActive(e) {
    $('.active').removeClass('active');
    $(e.target).addClass('active');
  }

  _renderCredentials() {
    return `<div class="d-flex align-items-center gap-2 fst-italic">
      <a class="fs-1 text-white" role="button" href="https://github.com/JeffreyvanderKooy">
        <i class="bi bi-github"></i>
      </a>
      <p class="m-0 p-0">Created by Jeffrey van der Kooy™</p></div>`;
  }
}

export default new HeaderView();
