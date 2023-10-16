'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2023-05-25T21:31:17.178Z',
    '2023-05-24T07:42:02.383Z',
    '2023-05-23T09:15:04.904Z',
    '2023-05-22T10:17:24.185Z',
    '2023-05-21T14:11:59.604Z',
    '2023-05-20T17:01:17.194Z',
    '2023-05-26T23:20:17.929Z',
    '2023-05-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-05-27T15:10:33.035Z',
    '2023-05-26T15:10:16.867Z',
    '2023-05-25T15:12:23.907Z',
    '2023-05-24T15:10:46.235Z',
    '2023-05-23T15:10:06.386Z',
    '2023-05-22T15:10:26.374Z',
    '2023-05-27T15:10:59.371Z',
    '2023-05-27T15:10:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

let accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentUserIndex;

let timerLoan;
let timerTransfer;
let intervalDate;
let intervalLogout;
let loginTime;

const numberItnl = (account) => new Intl.NumberFormat(account.locale, { style: 'currency', currency: account.currency });

const dateItnl = (account, isTimeavailable = false) => {
  return new Intl.DateTimeFormat(account.locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    minute: isTimeavailable ? 'numeric' : undefined,
    hour: isTimeavailable ? 'numeric' : undefined
  });
};



const calcCurrencyCurse = (from, to) => {
  if (from === 'USD' && to === 'EUR') return 0.93;
  else if (from === 'EUR' && to === 'USD') return 1.07;
};


const displayMovements = function (objUser, isSortedByTime = true) {
  let movements = objUser.movements.slice();
  let movementsDates = objUser.movementsDates.slice();
  if (isSortedByTime) {
    movements = movements.map((_, i) => movements[movementsDates.indexOf(movementsDates.slice().sort()[i])]);
    movementsDates = movementsDates.sort();
  }
  else {
    let list = movements.map((el, i) => ({ movements: el, movementsDates: movementsDates[i] }));
    list.sort((a, b) => a.movements - b.movements);
    list.forEach((el, i) => { movements[i] = el.movements; movementsDates[i] = el.movementsDates });
  };
  containerMovements.innerHTML = '';
  movements.forEach(function (mov, i) {
    let date = new Date() - new Date(movementsDates[i]);

    if (date < 60_000) date = `${Math.floor(date / 1000)} sec ago`;
    else if (date < 3_600_600) date = `${Math.floor(date / 60000)} min ago`;
    else if (date < 86_400_000) date = `${Math.floor(date / 3_600_000)} hrs ago`;
    else if (date < 259_200_000) date = `${Math.floor(date / 86_400_000)} days ago`;
    else date = dateItnl(objUser).format(new Date(movementsDates[i]));

    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${mov > 0 ? 'deposit' : 'withdrawal'}">${i + 1} ${mov > 0 ? 'deposit' : 'withdrawal'}</div>
      <div class="movements__date">${date}</div>
      <div class="movements__value">${numberItnl(accounts[currentUserIndex]).format(mov)}</div>
      </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const computingUIData = function (objUser) {
  displayMovements(objUser);

  labelDate.textContent = dateItnl(accounts[currentUserIndex], true).format(new Date());
  intervalDate = setInterval(function () { labelDate.textContent = dateItnl(accounts[currentUserIndex], true).format(new Date()); }, 60000);

  labelBalance.textContent = numberItnl(accounts[currentUserIndex]).format(objUser.movements.reduce((acc, mov) => acc + mov, 0));

  labelSumIn.textContent = numberItnl(accounts[currentUserIndex]).format(objUser.movements.filter(mov => mov > 0).reduce((acc, el) => acc + el, 0));
  labelSumOut.textContent = numberItnl(accounts[currentUserIndex]).format(-objUser.movements.filter(mov => mov < 0).reduce((acc, el) => acc + el, 0));
  labelSumInterest.textContent = numberItnl(accounts[currentUserIndex]).format(objUser.movements.map(el => el * objUser.interestRate / 100).filter(mov => mov >= 1).reduce((acc, mov) => acc + mov, 0));
};


const createUsernames = function () {
  accounts.forEach(cur => cur.username = cur.owner.toLowerCase().split(' ').map(el => el[0]).join(''));
};
createUsernames();





btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  if (accounts.some(acc => acc.username === inputLoginUsername.value && acc.pin == inputLoginPin.value)) {
    currentUserIndex = accounts.findIndex(acc => acc.username === inputLoginUsername.value);
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();

    loginTime = new Date();
    intervalLogout = setInterval(() => {
      labelTimer.textContent = Intl.DateTimeFormat(accounts[currentUserIndex].locale, { minute: 'numeric', second: 'numeric' }).format(+loginTime + 301_000 - new Date());
      if ((+loginTime + 301_000 - new Date()) < 1000) {
        clearInterval(intervalLogout);
        clearInterval(intervalDate);
        clearTimeout(timerLoan);
        clearTimeout(timerTransfer);
        currentUserIndex = undefined;
        labelWelcome.textContent = 'Log in to get started';
        containerApp.style.opacity = 0;
      }
    }, 1000);
    btnSort.innerHTML = '&downarrow; SORT BY AMOUNT';
    labelWelcome.textContent = `Welcome back, ${accounts[currentUserIndex].owner.split(' ')[0]}`;

    computingUIData(accounts[currentUserIndex]);

    containerApp.style.opacity = 100;

  }
  else {
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
    return;
  }
});


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  if (accounts.some(acc => acc.username === inputTransferTo.value)) {
    const transferAmount = (+inputTransferAmount.value).toFixed(2);
    const transferToAcc = accounts.find(acc => acc.username === inputTransferTo.value);
    if (transferAmount > 0 && transferAmount < accounts[currentUserIndex].movements.reduce((acc, mov) => acc + mov, 0) && transferToAcc.username !== accounts[currentUserIndex].username) {
      timerTransfer = setTimeout(function () {
        accounts[currentUserIndex].movements.push(-transferAmount);
        accounts[currentUserIndex].movementsDates.push(new Date().toISOString());
        transferToAcc.movements.push(transferAmount * calcCurrencyCurse(accounts[currentUserIndex].currency, transferToAcc.currency));
        transferToAcc.movementsDates.push(new Date().toISOString());
        computingUIData(accounts[currentUserIndex]);
      }, 3000);
    };

  };
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();
});


btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loan = Math.floor(inputLoanAmount.value);
  if (loan > 0 && accounts[currentUserIndex].movements.some(mov => mov > 0.1 * loan)) {
    timerLoan = setTimeout(function () {
      accounts[currentUserIndex].movements.push(+loan);
      accounts[currentUserIndex].movementsDates.push(new Date().toISOString());
      computingUIData(accounts[currentUserIndex]);
    }, 3000);
  };
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});


btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (accounts[currentUserIndex].username === inputCloseUsername.value && accounts[currentUserIndex].pin == inputClosePin.value) {
    clearInterval(intervalLogout);
    clearInterval(intervalDate);
    clearTimeout(timerLoan);
    clearTimeout(timerTransfer);
    accounts[currentUserIndex] = null;
    accounts = accounts.filter(acc => acc);
    currentUserIndex = undefined;
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
  };
  inputCloseUsername.value = '';
  inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
});


btnSort.addEventListener('click', function () {
  if (btnSort.textContent.includes('SORT BY AMOUNT')) {
    displayMovements(accounts[currentUserIndex], false);
    btnSort.innerHTML = '&downarrow; SORT BY TIME';
  }
  else {
    displayMovements(accounts[currentUserIndex], true);
    btnSort.innerHTML = '&downarrow; SORT BY AMOUNT';
  }
  btnSort.blur();
});

