/**
 * author: Carlos E Alford @webshuriken
 * version: 1.1
 * created: 11-11-2022
 * updated: 28-05-2023
 */

var leftOperand = '', rightOperand = '', total = 0, operator;
// switch to track where operand  will be stored
var storeInLeftOperand = true;

// query display element
var display = document.querySelector('.calc-screen-value');
var displayLimit = 14;

// active calculator theme
var activeTheme = 'calc-theme-1';

// can we use cookies
const calculatorCookies = {
  allowed: false
}

/**
 * @description updates the html with calculator values
 * @param {string} value - value to update the display with
 */
function updateDisplay(value) {
  display.textContent = value;
}

/**
 * @description Formats the calculation result to make sure it fits display limit
 */
function prepareResultForScreen() {
  // TODO: SNEAKY BASTARD, here the total is becoming a full stop when its a negative number
  // separate whole and decimal numbers. decimals will loose any trailing zeros.
  const re = /(-?\d*)\.?([^0]{0,4})/;
  let [wholeMatch,wholeNumbers, decimalNumbers] = String(total).match(re);
  // removes the decimal point at the end of the first match
  if (String(wholeNumbers).indexOf('.') != -1) {
    wholeNumbers = wholeNumbers.substring(0,1);
  }
  if (wholeNumbers.length > displayLimit) {
    total = 'Number too large';
  }else if (wholeNumbers.length == displayLimit || decimalNumbers.trim().length == 0) {
    total = wholeNumbers;
  }else {
    total = `${wholeNumbers}.${decimalNumbers}`;
  }
}

/**
 * @description stores the number pressed by user
 * @param {string} value - the number pressed
 */
function storeOperand(value) {
  if (storeInLeftOperand) {
    leftOperand += value;
    updateDisplay(leftOperand);
  }else{
    rightOperand += value;
    updateDisplay(rightOperand);
  }
}

/**
 * @description Decides what to action to perform depending on operator
 * @param {string} op - name of operator 
 */
function actOnOperator(op) {
  switch (op) {
    case 'reset':
      leftOperand = '';
      rightOperand = '';
      operator = '';
      total = 0;
      storeInLeftOperand = true;
      updateDisplay(total);
      break;
    case 'del':
      if (storeInLeftOperand) {
        leftOperand = leftOperand.substring(0, leftOperand.length - 1);
        updateDisplay(leftOperand);
      }else{
        rightOperand = rightOperand.substring(0, rightOperand.length - 1);
        updateDisplay(rightOperand);
      }
      break;
    case '=':
      if (rightOperand != '') {
        calculateTotal();
        prepareResultForScreen();
        updateDisplay(total);
      }
      break;
    default:
      // track the operator +, -, / or * and stop storing input in the left hand operand
      if (storeInLeftOperand) {
        storeInLeftOperand = false;
      }else if(rightOperand != '') {
        calculateTotal();
      }
      operator = op;
      updateDisplay(rightOperand);
  }
}

/**
 * @description Takes left/right operands and performs operation, storing the result
 */
function calculateTotal() {
  switch (operator) {
    case '+':
      total = Number(leftOperand) + Number(rightOperand)
      break;
    case '-':
      total = Number(leftOperand) - Number(rightOperand);
      break;
    case '*':
      total = Number(leftOperand) * Number(rightOperand);
      break;
    case '/':
      total = Number(leftOperand) / Number(rightOperand);
      break;
    default:
      console.error("You have fallen through the switch statement");
  }
  // 4 decimal places is enough precision for this project
  if ((total % 1) != 0) {
    total = total.toFixed(4);
  }
  // reset operand variables for next calculation
  leftOperand = String(total);
  rightOperand = '';
}

/**
 * @description checks which type of buttons was pressed and forwards to function to deal with
 * @param {object} e - event object
 */
function calcButtonPressed(e) {
  switch (e.target.dataset.type) {
    case 'operand':
      storeOperand(e.target.dataset.btn);
      break;
    case 'operator':
      actOnOperator(e.target.dataset.btn)
      break;
    default:
      console.error("Fallen through the calcButtonPressed function. Logic error.");
  }
}

// keypad listener
var calcKeypad = document.querySelector('.calc-keypad');
calcKeypad.addEventListener('click', function buttonPressed(e) {
  if (e.target.dataset.type) {
    calcButtonPressed(e)
  }
});

// THEME FUNCTIONALITY

// theme slider listener
var themeSlider = document.querySelector('#themeSelectorRange');
themeSlider.addEventListener('change', function getSliderValue(e) {
  let theme = e.target.value == '0' 
    ? 'calc-theme-1' 
    : e.target.value == '50' 
      ? 'calc-theme-2' 
      : 'calc-theme-3';
    
  updateCalcTheme(theme)
});

/**
 * @description updates the to latest theme by user selection or at load time
 * @param {string} theme - the calculator theme name/number 
 */
function updateCalcTheme(theme, atLoadInit = false) {
  let calculator = document.querySelector('.site-main');

  // remove active theme
  calculator.classList.toggle(activeTheme);
  activeTheme = theme;
  // add selected theme
  calculator.classList.toggle(theme);

  // only run at load time, sets the theme slider to the right position
  if (atLoadInit) {
    let themeID = theme.substring(theme.length - 1);
    let value = themeID == 1 ? 0 : themeID == 2 ? 50 : 100;
    themeSlider.value = value;
  }
  if (calculatorCookies.allowed) {
    updateStorageSettings();
  }
}

/**
 * @description updates localStorage with the latest theme value
 */
function updateStorageSettings() {
  localStorage.setItem('calculator-app', activeTheme);
}

/**
 * @description check for the availability of localStorage
 * @returns boolean
 */
function storageAvailable() {
  let storage = window.localStorage;
  try {
    let test = 'are_you_available';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch(e) {
    console.error('localstorage: ', e.message);
    return false;
  }
}

/**
 * @description add the listeners to the cookie panel
 */
function setupCookingPanel() {
  const cookiesPanel = document.querySelector('.cookie-panel');
  cookiesPanel.style.display = "flex";
  const cookieBtns = document.querySelectorAll('.cookie-buttons');

  return new Promise(resolve => {
    // we only need it to check the response from user
    function userResponse(event) {
      const response = event.target.dataset.cookieButton;
      if (response == 'accept') {
        updateStorageSettings();
        calculatorCookies.allowed = true;
      }
      if (response == 'decline') {
        console.log("User have chosen NO COOKIES");
      }
      // resolve the promise when a user selects an option
      resolve({cookieBtns, userResponse, cookiesPanel});
    }
    // set button listeners
    cookieBtns.forEach(button => {
      button.addEventListener('click', userResponse);
    });
  });
}

/**
 * @description load all settings for the calculator
 */
(async function initCalculatorSetup() {
  // before worrying about asking for permission and cookies, make sure we can use localstorage
  if (storageAvailable) {
    // have we setup localstorage already?
    const themeSettings = localStorage.getItem('calculator-app');
    // when localstorage doesnt exist lets display the cookie panel
    if (!themeSettings) {
      const userCookies = setupCookingPanel();
      userCookies.then(({cookieBtns, userResponse, cookiesPanel}) => {
        // remove event listeners
        cookieBtns.forEach(btn => {
          btn.removeEventListener('click', userResponse);
        });
        // remove cookie panel from vision
        cookiesPanel.style.display = "none";
      })
    }else{
      calculatorCookies.allowed = true;
      // if it settings are available use them
      updateCalcTheme(themeSettings, true);
    }
  }
})()
