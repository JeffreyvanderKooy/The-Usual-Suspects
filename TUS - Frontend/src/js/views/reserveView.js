import $ from 'jquery';
import modalView from './modalView';
import { state } from '../model';

class reserveView {
  _data;
  _handler;

  addHandlerReserve(handler) {
    $('body').on('click', '#submitReserve', async e => {
      const curItem = $('#reserve').attr('placeholder');
      const item = $('#reserve').val().toLowerCase();

      if (curItem == 'none' && !item)
        return modalView.error('Please enter an item.');
      if (!state.curRaid.raid)
        return modalView.error('You must select a raid to reserve an item');

      const confirm = await modalView.confirm();

      $('#reserve').val('');

      if (!confirm) return;
      if (!item) return modalView.error('You must enter an item.');
      if (isFinite(+item))
        return modalView.error('Item may not consist of only numbers.');

      handler(item);
    });
  }

  addHandlerAttendance(handler) {
    $('body').on('click', '#submitAttendance', e =>
      handler($('#attendance').val())
    );

    $('body').on('click', '#submitAttendancePlus', e => {
      let curBonus = state.curRaid.rows.find(
        row => row.id == state.curUser.id
      ).bonus;

      handler(++curBonus);
    });
  }

  setPlaceholders(curRaid, curUser) {
    const myItem = curRaid.rows.find(row => row.id == curUser.id);
    $('#reserve').attr('placeholder', myItem?.item || 'none');
    $('#attendance').val(myItem?.bonus || '0');
    $('#bonus-roll').text(myItem?.bonus * 10 || '0');
    this._toggleButtons();
  }

  _toggleButtons() {
    $('#submitAttendance').removeAttr('disabled');
    $('#submitReserve').removeAttr('disabled');
    $('#submitAttendancePlus').removeAttr('disabled');
  }
}

export default new reserveView();
