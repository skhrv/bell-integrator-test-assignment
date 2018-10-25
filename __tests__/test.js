import fs from 'fs';
import path from 'path';
import { html } from 'js-beautify';
import run from '../src/application';

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

const dateMock = new Date('Thu Oct 25 2018 14:00:22').valueOf();

const htmlOptions = {
  preserve_newlines: true,
  unformatted: [],
};

const fixuturesPath = path.join(__dirname, '__fixtures__');
const getTree = () => html(document.body.innerHTML, htmlOptions);
beforeAll(() => {
  const initHtml = fs.readFileSync(path.join(fixuturesPath, 'index.html')).toString();
  document.documentElement.innerHTML = initHtml;
  run(dateMock);
});

test('application', () => {
  expect(getTree()).toMatchSnapshot();
  const seat15 = document.querySelector('.seat-15');
  const submit = document.querySelector('.btn-submit');
  const selectDayFirstOption = document.querySelector('#selectDay option');

  seat15.click();
  submit.click();
  selectDayFirstOption.click();
  expect(localStorage.store).toHaveProperty('2018/10/25,16', '15');
  expect(getTree()).toMatchSnapshot();
});
