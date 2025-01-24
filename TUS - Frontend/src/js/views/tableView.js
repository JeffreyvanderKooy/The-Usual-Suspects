import $ from 'jquery';
import { sortDate } from '../helper';

class tableView {
  _data; // eg curRaid

  render(curRaid) {
    $('#raid-table')?.remove();

    this._data = curRaid;

    const markup = this._generateTableMarkup();

    $('body').get(0).insertAdjacentHTML('beforeend', markup);

    this._data.rows.sort(sortDate).forEach(this._addRow.bind(this));
  }

  _addRow(row) {
    const markup = this._generateRowMarkup(row);

    $('#raid-table tbody').get(0).insertAdjacentHTML('beforeend', markup);
  }

  _generateTableMarkup() {
    return `<div class="d-flex justify-content-center m-3" id="raid-table">
      <table class="table w-75 table-striped table-hover">
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
    </div>`;
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
