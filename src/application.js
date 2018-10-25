import WatchJS from 'melanke-watchjs';
import dateFns from 'date-fns';
import '@babel/polyfill';
import { renderSelectDays, chooseCurrentSession, renderSeats } from './render';

const state = {
  reserve: {
    enable: true,
  },
  time: {
    dateNow: null,
    currentDay: null,
    currentSession: null,
  },
  seats: {
    reserved: [],
    selected: [],
  },
};

const initialSeats = () => {
  const reserved = localStorage[`${state.time.currentDay},${state.time.currentSession}`];
  if (reserved === undefined) {
    state.seats.reserved = [];
  } else {
    state.seats.reserved = reserved.split(',');
  }
  state.seats.selected = [];
};

export default (dateNow) => {
  state.time.dateNow = dateNow;
  const presentDay = dateFns.format(dateNow, 'YYYY/MM/DD');
  const presentHour = dateFns.getHours(dateNow);
  const canReserve = (date, hour) => dateFns.isAfter(date, presentDay)
  || (hour > presentHour && dateFns.isEqual(date, presentDay));

  const initialTime = () => {
    if (presentHour >= 20) {
      const nextDay = dateFns.addDays(presentDay, 1);
      state.time.currentDay = dateFns.format(nextDay, 'YYYY/MM/DD');
      state.time.currentSession = 10;
    } else if (presentHour < 10) {
      state.time.currentDay = presentDay;
      state.time.currentSession = 10;
    } else {
      state.time.currentDay = presentDay;
      state.time.currentSession = presentHour % 2 === 0 ? presentHour + 2 : presentHour + 1;
    }
  };

  const presentDateField = document.querySelector('.current-date');
  presentDateField.textContent = presentDay;

  initialTime();

  const selectSession = document.querySelector('#selectSession');
  chooseCurrentSession(selectSession, state);

  const selectDay = document.querySelector('#selectDay');
  renderSelectDays(selectDay, state);

  const seats = Array.from(document.querySelectorAll('.seat'));
  initialSeats();
  renderSeats(seats, state);
  selectDay.addEventListener('change', (e) => {
    const { value } = e.target;
    state.time.currentDay = value;
    state.reserve.enable = canReserve(state.time.currentDay, state.time.currentSession);
  });
  selectSession.addEventListener('change', (e) => {
    const { value } = e.target;
    state.time.currentSession = value;
    state.reserve.enable = canReserve(state.time.currentDay, state.time.currentSession);
  });
  seats.forEach(seat => seat.addEventListener('click', (e) => {
    if (state.reserve.enable && e.target.classList.contains('select')) {
      e.target.classList.remove('select');
      const index = state.seats.selected.indexOf(e.target.dataset.value);
      state.seats.selected.splice(index, 1);
    } else if (state.reserve.enable) {
      e.target.classList.add('select');
      state.seats.selected.push(e.target.dataset.value);
    }
  }));

  const submit = document.querySelector('.btn-submit');
  submit.addEventListener('click', () => {
    state.seats.reserved = [...state.seats.selected, ...state.seats.reserved];
    localStorage.setItem([state.time.currentDay, state.time.currentSession], state.seats.reserved);
    state.seats.reserved.forEach((i) => {
      document.querySelector(`.seat-${i}`).classList.add('reserved');
    });
    state.seats.selected = [];
  });
  WatchJS.watch(state, 'reserve', () => {
    if (state.reserve.enable) {
      submit.removeAttribute('disabled');
      seats.forEach(seat => seat.classList.remove('disable'));
    } else {
      submit.setAttribute('disabled', '');
      seats.forEach(seat => seat.classList.add('disable'));
    }
  });
  WatchJS.watch(state, 'time', () => {
    state.reserve.enable = canReserve(state.time.currentDay, state.time.currentSession);
    initialSeats();
    renderSeats(seats, state);
  });
};

