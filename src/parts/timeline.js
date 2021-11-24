import { getDatas } from "./datas";


function displayDatas() {
    const datas = getDatas()
    const timeline = document.querySelector('.hours')
    
    datas.forEach((data,i)=> {
        const li = document.createElement("li");
        li.innerText = data.hour
        timeline.appendChild(li) 
    })
}



export {displayDatas}
