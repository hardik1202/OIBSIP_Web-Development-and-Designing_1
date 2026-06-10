// Calculator - JavaScript
// Student mini project (no eval used)

var expression = "0";
var lastAnswer = 0;
var memory = 0;
var hasMemory = false;
var angleMode = "DEG"; // DEG or RAD
var historyData = [];

var screen = document.getElementById("screen");
var resultText = document.getElementById("resultText");
var errorText = document.getElementById("errorText");
var memoryText = document.getElementById("memoryText");

// load saved data when page opens
window.onload = function () {
  loadTheme();
  loadHistory();
  updateScreen();
};

// all calculator buttons
var allButtons = document.querySelectorAll(".btn");
for (var i = 0; i < allButtons.length; i++) {
  allButtons[i].onclick = function () {
    handleButton(this.getAttribute("data-val"));
  };
}

document.getElementById("btnDegRad").onclick = toggleDegRad;
document.getElementById("btnTheme").onclick = toggleTheme;
document.getElementById("btnHistory").onclick = openHistory;
document.getElementById("btnCloseHistory").onclick = closeHistory;
document.getElementById("btnClearHistory").onclick = clearAllHistory;

// keyboard support
document.onkeydown = function (e) {
  var key = e.key;

  if (key >= "0" && key <= "9") {
    handleButton(key);
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    handleButton(key);
  } else if (key === "(" || key === ")") {
    handleButton(key);
  } else if (key === ".") {
    handleButton(".");
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    handleButton("=");
  } else if (key === "Backspace") {
    handleButton("DEL");
  } else if (key === "Escape") {
    handleButton("AC");
  }
};

// main button handler
function handleButton(val) {
  errorText.innerText = "";

  if (val === "AC") {
    expression = "0";
    resultText.innerText = "";
    updateScreen();
    return;
  }

  if (val === "DEL") {
    if (expression.length <= 1) {
      expression = "0";
    } else {
      expression = expression.slice(0, -1);
    }
    resultText.innerText = "";
    updateScreen();
    return;
  }

  if (val === "=") {
    calculateAnswer();
    return;
  }

  if (val === "+-") {
    toggleSign();
    return;
  }

  if (val === "Ans") {
    addToExpression(String(lastAnswer));
    return;
  }

  if (val === "rand") {
    addToExpression(String(Math.random()));
    return;
  }

  // memory buttons
  if (val === "MC") {
    memory = 0;
    hasMemory = false;
    memoryText.innerText = "";
    return;
  }
  if (val === "MR") {
    expression = String(memory);
    updateScreen();
    return;
  }
  if (val === "MS") {
    memory = getNumberFromScreen();
    hasMemory = true;
    memoryText.innerText = "M";
    return;
  }
  if (val === "M+") {
    memory = memory + getNumberFromScreen();
    hasMemory = true;
    memoryText.innerText = "M";
    return;
  }
  if (val === "M-") {
    memory = memory - getNumberFromScreen();
    hasMemory = true;
    memoryText.innerText = "M";
    return;
  }

  // power buttons like x²
  if (val === "^2" || val === "^3") {
    addToExpression(val);
    return;
  }

  addToExpression(val);
}

function addToExpression(val) {
  if (expression === "0" && val !== "." && val !== "(" && val.indexOf("sin") === -1) {
    if (val === "+" || val === "-" || val === "*" || val === "/" || val === "%" || val === "^") {
      expression = "0" + val;
    } else {
      expression = val;
    }
  } else {
    expression = expression + val;
  }
  updateScreen();
}

function updateScreen() {
  screen.value = expression;
}

function toggleSign() {
  var num = getNumberFromScreen();
  expression = String(num * -1);
  updateScreen();
}

function getNumberFromScreen() {
  var n = parseFloat(expression);
  if (isNaN(n)) {
    return 0;
  }
  return n;
}

// convert angle for sin cos tan
function useAngle(x) {
  if (angleMode === "DEG") {
    return x * Math.PI / 180;
  }
  return x;
}

function backAngle(x) {
  if (angleMode === "DEG") {
    return x * 180 / Math.PI;
  }
  return x;
}

// factorial function
function factorial(n) {
  if (n < 0 || n != Math.floor(n)) {
    throw "Factorial needs whole number";
  }
  if (n > 170) {
    throw "Number too big for factorial";
  }
  var ans = 1;
  for (var i = 2; i <= n; i++) {
    ans = ans * i;
  }
  return ans;
}

// replace words with math before calculating
function prepareExpression(expr) {
  var s = expr;

  s = s.replace(/×/g, "*");
  s = s.replace(/÷/g, "/");

  // replace scientific functions with Math.xxx
  s = s.replace(/sin\(/g, "SIN(");
  s = s.replace(/cos\(/g, "COS(");
  s = s.replace(/tan\(/g, "TAN(");
  s = s.replace(/log\(/g, "LOG(");
  s = s.replace(/ln\(/g, "LN(");
  s = s.replace(/sqrt\(/g, "SQRT(");

  return s;
}

// safe calculate using our own parser (stack method)
function calculateAnswer() {
  var oldExpr = expression;

  try {
    var expr = prepareExpression(expression);
    var answer = solveExpression(expr);

    if (isNaN(answer) || answer === Infinity || answer === -Infinity) {
      throw "Invalid calculation";
    }

    // round to avoid long decimals
    answer = Math.round(answer * 1000000000000) / 1000000000000;

    lastAnswer = answer;
    resultText.innerText = "= " + answer;
    expression = String(answer);

    saveHistoryItem(oldExpr, answer);
    updateScreen();
    showHistoryList();
  } catch (err) {
    errorText.innerText = err;
    resultText.innerText = "";
  }
}

// simple expression solver using two stacks
function solveExpression(expr) {
  var tokens = makeTokens(expr);
  return evaluateTokens(tokens);
}

function makeTokens(expr) {
  var tokens = [];
  var i = 0;

  while (i < expr.length) {
    var ch = expr.charAt(i);

    // number
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      var numStr = "";
      while (i < expr.length && ((expr.charAt(i) >= "0" && expr.charAt(i) <= "9") || expr.charAt(i) === ".")) {
        numStr = numStr + expr.charAt(i);
        i++;
      }
      tokens.push({ type: "num", value: parseFloat(numStr) });
      continue;
    }

    // words like SIN, COS
    if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
      var word = "";
      while (i < expr.length && /[a-zA-Z]/.test(expr.charAt(i))) {
        word = word + expr.charAt(i);
        i++;
      }
      tokens.push({ type: "word", value: word });
      continue;
    }

    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "^" || ch === "!" || ch === "%") {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lp", value: "(" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "rp", value: ")" });
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

function applyOp(op, a, b) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") {
    if (b === 0) throw "Cannot divide by zero";
    return a / b;
  }
  if (op === "^") return Math.pow(a, b);
  if (op === "%") return a % b;
  return 0;
}

function doFunction(name, x) {
  if (name === "SIN") return Math.sin(useAngle(x));
  if (name === "COS") return Math.cos(useAngle(x));
  if (name === "TAN") return Math.tan(useAngle(x));
  if (name === "LOG") return Math.log10(x);
  if (name === "LN") return Math.log(x);
  if (name === "SQRT") return Math.sqrt(x);
  throw "Unknown function";
}

// convert infix tokens to result
function evaluateTokens(tokens) {
  var values = [];
  var ops = [];
  var lastWasOp = true;

  for (var t = 0; t < tokens.length; t++) {
    var token = tokens[t];

    if (token.type === "num") {
      values.push(token.value);
      lastWasOp = false;
    } else if (token.type === "word") {
      ops.push(token);
      lastWasOp = false;
    } else if (token.type === "lp") {
      ops.push(token);
      lastWasOp = true;
    } else if (token.type === "rp") {
      while (ops.length > 0 && ops[ops.length - 1].type !== "lp") {
        calcOneStep(values, ops);
      }
      if (ops.length > 0) ops.pop(); // remove (
      if (ops.length > 0 && ops[ops.length - 1].type === "word") {
        calcOneStep(values, ops);
      }
      lastWasOp = false;
    } else if (token.type === "op") {
      var op = token.value;

      // unary minus
      if (op === "-" && lastWasOp) {
        values.push(0);
      }

      // postfix factorial
      if (op === "!") {
        var v = values.pop();
        values.push(factorial(v));
        lastWasOp = false;
        continue;
      }

      while (ops.length > 0 && ops[ops.length - 1].type === "op") {
        var topOp = ops[ops.length - 1].value;
        if (precedence(topOp) > precedence(op)) {
          calcOneStep(values, ops);
        } else if (precedence(topOp) === precedence(op) && op !== "^") {
          calcOneStep(values, ops);
        } else {
          break;
        }
      }
      ops.push(token);
      lastWasOp = true;
    }
  }

  while (ops.length > 0) {
    calcOneStep(values, ops);
  }

  if (values.length !== 1) {
    throw "Wrong expression";
  }

  return values[0];
}

function precedence(op) {
  if (op === "^") return 3;
  if (op === "*" || op === "/" || op === "%") return 2;
  return 1;
}

function calcOneStep(values, ops) {
  var top = ops.pop();

  if (top.type === "word") {
    var x = values.pop();
    values.push(doFunction(top.value, x));
    return;
  }

  var b = values.pop();
  var a = values.pop();
  values.push(applyOp(top.value, a, b));
}

// DEG / RAD button
function toggleDegRad() {
  if (angleMode === "DEG") {
    angleMode = "RAD";
    document.getElementById("btnDegRad").innerText = "RAD";
  } else {
    angleMode = "DEG";
    document.getElementById("btnDegRad").innerText = "DEG";
  }
  localStorage.setItem("angleMode", angleMode);
}

// dark mode
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  var btn = document.getElementById("btnTheme");
  if (document.body.classList.contains("dark-mode")) {
    btn.innerText = "Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerText = "Dark Mode";
    localStorage.setItem("theme", "light");
  }
}

function loadTheme() {
  var saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("btnTheme").innerText = "Light Mode";
  }
  var savedAngle = localStorage.getItem("angleMode");
  if (savedAngle === "RAD") {
    angleMode = "RAD";
    document.getElementById("btnDegRad").innerText = "RAD";
  }
}

// history functions
function saveHistoryItem(expr, ans) {
  var item = {
    id: new Date().getTime(),
    expr: expr,
    ans: ans
  };
  historyData.unshift(item);
  if (historyData.length > 50) {
    historyData.pop();
  }
  localStorage.setItem("calcHistory", JSON.stringify(historyData));
}

function loadHistory() {
  var data = localStorage.getItem("calcHistory");
  if (data) {
    historyData = JSON.parse(data);
  }
  showHistoryList();
}

function showHistoryList() {
  var list = document.getElementById("historyList");
  var noHistory = document.getElementById("noHistory");
  list.innerHTML = "";

  if (historyData.length === 0) {
    noHistory.style.display = "block";
    return;
  }

  noHistory.style.display = "none";

  for (var i = 0; i < historyData.length; i++) {
  var li = document.createElement("li");
  li.innerHTML = historyData[i].expr + "<br>= " + historyData[i].ans;
  li.setAttribute("data-id", historyData[i].id);

  // click to use again
  li.onclick = function () {
    var id = this.getAttribute("data-id");
    useHistoryItem(id);
  };

  // delete button
  var delBtn = document.createElement("button");
  delBtn.className = "delete-btn";
  delBtn.innerText = "X";
  delBtn.onclick = function (e) {
    e.stopPropagation();
    var id = this.parentElement.getAttribute("data-id");
    deleteHistoryItem(id);
  };
  li.appendChild(delBtn);

  list.appendChild(li);
  }
}

function useHistoryItem(id) {
  for (var i = 0; i < historyData.length; i++) {
    if (historyData[i].id == id) {
      expression = historyData[i].expr;
      resultText.innerText = "= " + historyData[i].ans;
      lastAnswer = historyData[i].ans;
      updateScreen();
      closeHistory();
      break;
    }
  }
}

function deleteHistoryItem(id) {
  var newList = [];
  for (var i = 0; i < historyData.length; i++) {
    if (historyData[i].id != id) {
      newList.push(historyData[i]);
    }
  }
  historyData = newList;
  localStorage.setItem("calcHistory", JSON.stringify(historyData));
  showHistoryList();
}

function clearAllHistory() {
  historyData = [];
  localStorage.removeItem("calcHistory");
  showHistoryList();
}

function openHistory() {
  document.getElementById("historyBox").classList.add("show");
  showHistoryList();
}

function closeHistory() {
  document.getElementById("historyBox").classList.remove("show");
}
