import $ from 'jquery';

class View {
  _parentElement;
  _data;

  render(data) {
    this._data = data || this._data;

    const markup = this._generateMarkup();

    this._insertHTML(markup);
  }

  _insertHTML(markup) {
    $(this._parentElement).html('');
    this._parentElement.get(0).insertAdjacentHTML('afterbegin', markup);
  }
}

export default View;
