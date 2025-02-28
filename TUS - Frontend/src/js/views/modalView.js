import swal from 'sweetalert';
import $ from 'jquery';
import { capitalize } from '../helper';

class modalView {
  warning(message = 'Oops! Something went wrong.') {
    swal({
      className: 'bg-warning-subtle',
      title: message,
      text: ' ',
      icon: 'warning',
      buttons: false,
    });
  }

  error(message = 'Oops! Something went wrong.') {
    swal({
      className: 'bg-danger-subtle',
      title: message,
      icon: 'error',
      text: ' ',
      buttons: false,
    });
  }

  succes(message = ' ') {
    swal({ icon: 'success', title: message });
  }

  loader(bool) {
    $('.loading').toggle(bool);
  }

  async confirm() {
    try {
      const val = await swal({
        title: `Are you sure?`,
        text: 'You will lose all your bonus roll points!',
        dangerMode: true,
        buttons: true,
        icon: 'warning',
        className: 'bg-warning-subtle',
      });

      return val;
    } catch (error) {
      return false;
    }
  }
}

export default new modalView();
