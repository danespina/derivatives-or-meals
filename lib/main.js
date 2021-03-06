const DOMNodeCollection = require('./dom_node_collection');

window.$l = function (el) {
  const fuctionsArray = [];
  if ( document.readyState === "complete" || document.readyState !== "loading" ){
    if (el instanceof HTMLElement){
      const htmlArray = [];
      htmlArray.push(el);
      return new DOMNodeCollection(htmlArray);
    } else if (typeof el === "string") {
      const nodeList = document.querySelectorAll(el);
      const nodeArray = Array.from(nodeList);
      return new DOMNodeCollection(nodeArray);
    } else if (el instanceof Function) {
      el();
    }
  } else {
    if (el instanceof Function) {
      fuctionsArray.push(el);
      document.addEventListener("DOMContentLoaded", () => {
        fuctionsArray.forEach( (fun) => {
          fun();
        });
      });
    }
  }
};

Function.prototype.extend = function (...args) {
  let hash = {};
  args.forEach( (el) => {
    Object.keys(el).forEach((key) => {
      hash[key] = el[key];
    });
  });
  return hash;
};

Function.prototype.ajax = function (arg) {
  let recommended = {
    method: "GET",
    url: "",
    data: {},
    contentType:'application/x-www-form-urlencoded; charset=UTF-8',
    dataType: 'json',
    success: () => {},
    error: () => {},
  };
  const both = this.extend(recommended, arg);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(both.method, both.url, true);
    xhr.onload = () => resolve(JSON.parse(xhr.response));
    xhr.onerror  = () => reject(xhr.statusText);
    xhr.send(JSON.stringify(both.data));
  });
};

function sendReq(e) {
  e.preventDefault();
  const ordList = window.$l('ol');
  window.$l.ajax({
    url: `https://newton.now.sh/derive/${e.currentTarget[0].value}`,
  }).then((data) => {
    ordList.append(`<li>${data.result}</li>`);
  });
}

function sendRecipeReq(e) {
  const mealLocation = window.$l('.meals-location');
  window.$l.ajax({
    url: `http://taco-randomizer.herokuapp.com/random/`,
  }).then((data) => {
    mealLocation.append(`<h2><a href=${data.base_layer.url} target="_blank">
      ${data.base_layer.name}
      </a>
      with <a href=${data.mixin.url} target="_blank">
      ${data.mixin.name}</a>,
      garnished with <a href=${data.condiment.url} target="_blank">
      ${data.condiment.name}</a>
      topped off with <a href=${data.seasoning.url} target="_blank">
      ${data.seasoning.name}</a>
      and wrapped in <a href=${data.shell.url} target="_blank">
      ${data.shell.name}</a></h2>`);
  });
}

// Derivatives on Meals
function addTerm(e) {
  const form = window.$l('.math-form');
  const mathUL = window.$l('.math-ul');
  const numInputs = mathUL.children().htmlArray.length;
  const newLI = document.createElement("li");
  const newLabel = document.createElement("label");
  const newInput = window.$l(document.createElement("input"));
  newInput.attr('type', 'text');
  newInput.attr('name', `input-${numInputs}`);
  const newSup = document.createElement("sup");
  newSup.append(`${numInputs}`);
  const labelNode = window.$l(newLabel);
  labelNode.append(newInput)
  labelNode.append('x')
  labelNode.append(newSup)
  labelNode.append(' +');
  window.$l(newLI).append(newLabel);
  mathUL.append(newLI);

  const button = window.$l('.add-term');
}

function takeDeriv(e) {
  e.preventDefault();
  let coeffs = [];
  let deriv = [];
  const results = window.$l('.deriv-results');
  const graphButton = window.$l('.graph-button');
  for (let i = 0; i < e.currentTarget.length; i++) {
    if (e.currentTarget[i].value !== 'Take Derivative') {
      coeffs.push(parseFloat(e.currentTarget[i].value) * (i - 1));
      deriv.push(`${parseFloat(e.currentTarget[i].value) * (i - 1)} ${(i > 2) ? `x<sup>${i - 2}</sup>` : ''}`);
    }
  }
  const derivString = deriv.slice(1).join(' + ');
  results.empty();
  results.append(`<h3 class="coeffs">${coeffs}</h3>`);
  results.append(`<h3 class="deriv-string">${derivString}</h3>`);
  graphButton.empty();
  graphButton.append(`<button class="make-graph">Make graph!</button>`);
  window.$l(addGraphListener);
}

function addDerivListener() {
  const form = window.$l('.math-form');
  form.on("submit", takeDeriv);
}

function makeGraph() {
  const form = window.$l('.graph-results');
  const coeffs = window.$l('.coeffs').html().innerHTML.split(',');
  let points = "";
  const x = [...Array(500).keys()];
  let y = new Array(500).fill(0);
  let yDisplay = new Array(500).fill(0);
  for (let i = 0; i < x.length; i++) {
    for (let j = 1; j < coeffs.length; j++) {
      y[i] += (parseFloat(coeffs[j]) * ((x[i] / 100) ** (j-1)));
    }
    yDisplay[i] = 500 - y[i];
    if (i !== x.length - 1) {
      points += `${x[i]},${yDisplay[i]} `;
    } else {
      points += `${x[i]},${yDisplay[i]}`;
    }
  }
  form.empty();
  form.append(`<svg width="500" height="500">
      <path d="M ${points}" stroke="black" strokeWidth="3" fill= "none" />
    </svg>`);
}

function addTermListener() {
  const button = window.$l('.add-term');
  button.on("click", addTerm);
}

function addGraphListener() {
  const button = window.$l('.make-graph');
  button.on("click", makeGraph);
}


function addMealListener() {
  const button = window.$l('.meals-button');
  button.on("click", sendRecipeReq);
}

window.$l(addMealListener);

window.$l(addTermListener);

window.$l(addDerivListener);
