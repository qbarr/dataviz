import './style.css'
import './parts/webgl.js'
import data from "./parts/datas.json"
console.log(data[0].fields);
for (const [key, value] of Object.entries(data[0].fields)) {
    console.log(`${key}: ${value}`);
    let li = document.createElement("li");
    li.innerText = key + " : " + value
    document.querySelector('.datas').appendChild(li)
  }

