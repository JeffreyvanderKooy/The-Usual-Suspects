import $ from 'jquery';
import View from './view';
import swal from 'sweetalert';

class LoginView {
  _submitHandler;

  constructor() {
    $('#pinInput').on('input', this._validatePin.bind(this));
  }

  addHandlerSubmit(handler) {
    this._submitHandler = handler;
  }

  submit(val) {
    const name = $('#nameInput').val().toLowerCase();
    const pin = $('#pinInput').val();

    return { name, pin, handler: val };
  }

  render(message) {
    const content = document.createElement('div');

    const markup = `<div class="d-flex justify-content-center flex-column gap-3 w-75">
                        <input id="nameInput" type="text" class="form-control  text-center" placeholder="name" />
                        <input id="pinInput" type="text" pattern="\d{1,4}"  placeholder="****" maxlength="4" class="form-control text-center " />
                    </div>`;

    $(content).html(markup).addClass('login');

    swal({
      className: message ? 'bg-warning-subtle' : 'bg-light',
      title: message || 'Welcome to the Usual Suspects',
      content: content,
      buttons: {
        cancel: {
          text: 'Register', // Button for "Register"
          value: false, // Resolves to false
          visible: true,
          className: 'swal-button--register', // Optional custom class
        },
        confirm: {
          text: 'Login', // Button for "Login"
          value: true, // Resolves to true
          visible: true,
          className: 'swal-button--login', // Optional custom class
        },
      },
    }).then(val => this._submitHandler(val));
  }

  // avoids input being longer then 4 characters
  _validatePin() {
    const input = this._pinInput.val();

    if (input.length <= 4) return;

    this._pinInput.val(input.slice(0, 3));
  }
}

export default new LoginView();
