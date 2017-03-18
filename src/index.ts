import './index.scss';

// Write your code here!

const element = document.createElement("div");
element.innerHTML = require<string>('./example.tmpl');
document.body.appendChild(element);
