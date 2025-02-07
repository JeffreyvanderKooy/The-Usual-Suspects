import $ from 'jquery';
import { sortDate } from '../helper';
import { RAID_DATA } from '../config';

class tableView {
  _data; // eg curRaid

  constructor() {
    $('body').on('keyup', '#search', e => {
      if (!this._data) return;

      const query = $(e.target).val().toLowerCase();

      if (!query) return this.renderRows(this._data.rows);

      const results = this._data.rows.filter(row =>
        [row.item, row.name].join(' ').toLowerCase().includes(query)
      );

      this.renderRows(results);
    });
  }

  addHandlerRefresh(handler) {
    $('#raid-table').on('click', '#refresh', handler);
  }

  clearSearchInput() {
    $('#search').val('');
  }

  render(curRaid) {
    $('#raid-table').html('');

    this._data = curRaid;

    const markup = this._generateTableMarkup();

    $('#raid-table').get(0).insertAdjacentHTML('beforeend', markup);

    this._data.rows.sort(sortDate).forEach(this.addRow.bind(this));
  }

  loader(bool) {
    if (bool) {
      const markup = `<div class="loading">Loading&#8230;</div>`;
      $('#raid-table').html(markup);
    } else if (!bool) $('#raid-table .loading')?.remove();
  }

  renderRows(rows) {
    $('#raid-table tbody').html('');

    rows.sort(sortDate).forEach(this.addRow.bind(this));

    return this;
  }

  addRow(row) {
    const markup = this._generateRowMarkup(row);

    $('#raid-table tbody').get(0).insertAdjacentHTML('afterbegin', markup);
  }

  _generateTableMarkup() {
    return `
      ${
        RAID_DATA[this._data.raid].banned.length === 0
          ? `<div class="p-2 shadow  bg-success-subtle rounded border border-success fw-bold"><i class="bi bi-check2-all"></i> You may reserve loot from all bosses</div>`
          : `<div class="p-2 shadow  bg-danger-subtle rounded border border-danger fw-bold"><i class="bi bi-exclamation-lg"></i> Do not reserve loot from: ${RAID_DATA[
              this._data.raid
            ].banned.join(', ')}</div>`
      }   <div class="input-group w-50 shadow">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input id="search" type="text" class="form-control w-50" autocomplete="off" placeholder="search..." />
            <button class="btn btn-outline-secondary input-group-text d-flex align-items-center gap-1" id="refresh">Refresh <i class="bi bi-arrow-clockwise"></i></button>
          </div>

      <table class="table w-75 table-striped table-hover shadow rounded border">
        <thead>
          <tr>
            <th>Player</th>
            <th>Item</th>
            <th>Date</th>
            <th class="fs-5"><i class="bi bi-dice-6-fill"></i></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
   `;
  }

  _generateRowMarkup(data) {
    return `<tr data-player-id="${data.id}">
                <td>${data.name}</td>
                <td>${data.item}</td>
                <td>${data.formatted_date}</td>
                <td>${data.bonus * 10 || 0}</td>
            </tr>`;
  }
}

export default new tableView();
