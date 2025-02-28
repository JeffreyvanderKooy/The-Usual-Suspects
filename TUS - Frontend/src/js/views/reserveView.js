import $ from 'jquery';
import modalView from './modalView';
import { state } from '../models/model';

class reserveView {
  _data;
  _handler;

  addHandlerReserve(handler) {
    $('body').on('click', '#submitReserve', async e => {
      const item = $('#reserve').val().toLowerCase();

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
    $('body').on('click', '.submitAttendance', e => {
      let curBonus = state.curRaid.rows.find(
        row => row.id == state.curUser.id
      ).bonus;

      const operator = $(e.target).data('operator');

      handler(eval(`${curBonus}${operator}1`));
    });
  }

  addHandlerDelete(handler) {
    $('body').on('click', '#deleteReserve', async e => {
      const confirm = await modalView.confirm();

      if (confirm) handler();
    });
  }

  setPlaceholders(curRaid, curUser) {
    console.log(curUser);
    const myItem = curRaid.rows.find(row => row.id == curUser.id);
    $('#reserve').attr('placeholder', myItem?.item || 'none');
    $('#attendance').val(myItem?.bonus || '0');
    $('#bonus-roll').text(myItem?.bonus * 10 || '0');
    this._toggleButtons();
  }

  _toggleButtons() {
    $('.submitAttendance').each((_, btn) => $(btn).removeAttr('disabled'));
    $('#submitReserve').removeAttr('disabled');
    $('#deleteReserve').removeAttr('disabled');
    $('#reserve').addClass('border-secondary');
    $('#attendance').addClass('border-secondary');
  }
}

export default new reserveView();
