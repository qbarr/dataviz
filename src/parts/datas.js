import data from "./datas.json"



let wantedHours = [8,10,12,14,16,18,20,22]
let datasGlobal = getDatas()

function addEventTemp() {
    const thermometre = document.querySelector('.thermometre')
    const {smallestTemp,highestTemp} = getSmallestAndHighest()
    document.querySelectorAll('.hours li').forEach((hour,i)=> {
        hour.addEventListener('click',()=> {
            //sconst hourInt= parseInt(hour.innerText)
            const dataAthour = getScaleMolecule(`${i+1}`)
            const diff =( highestTemp - dataAthour.temp) *10
            thermometre.style.height = `calc(80% - ${diff}%)`
        })
    })
}

function getDatas() {
    let datas = []
    Object.entries(data).forEach((elem,i)=> {
        const data = {
            CO2:null,
            NO:null,
            NO2:null,
            day:null,
            month:null,
            year:null,
            hour:null,
            temp:null
        }

        for (const [key, value] of Object.entries(elem[1].fields)) {
    
            if(key==="c2cha4") {
                data.CO2 = parseInt(value)
            } else if(key==="nocha4") {
                data.NO = parseInt(value)
            } else if(key==="n2cha4") {
                data.NO2 = parseInt(value) 
            } else if(key==="dateheure") {
                let dateheure = Date.parse(value)
                let date = new Date(dateheure)
                if(date.getDate()===14 && wantedHours.includes(date.getHours())) {
                    data.day = date.getDate(),
                    data.month = date.getMonth()+1
                    data.year = date.getFullYear()
                    data.hour = date.getHours()
                }
            } else if(key==="tcha4") {
                data.temp = parseFloat(value.replace(/,/g, '.'))
            }
        }
        if(data.day!==null) datas.push(data)


    })
    return datas.sort((a,b)=> a-b)
}

function getSmallestAndHighest() {
    let highestCO2=0,highestNO=0,highestNO2 = 0
    let smallestCO2=10000000,smallestNO=10000000,smallestNO2 = 10000000
    let highestTemp=0,smallestTemp=10000000
    const datas = getDatas()
    datas.forEach((data)=> {
        if(data.NO2>highestNO2) highestNO2 = data.NO2
        if(data.CO2>highestCO2) highestCO2 = data.CO2
        if(data.NO>highestNO) highestNO = data.NO
        if(data.temp>highestTemp) highestTemp = data.temp

        if(data.NO2<smallestNO2) smallestNO2 = data.NO2
        if(data.CO2<smallestCO2) smallestCO2 = data.CO2
        if(data.NO<smallestNO) smallestNO = data.NO
        if(data.temp<smallestTemp) smallestTemp = data.temp
    })
    console.log(smallestTemp,highestTemp);
    return {highestTemp,smallestTemp,smallestCO2,smallestNO2,smallestNO,highestCO2,highestNO,highestNO2}
}

function getDifference() {
    const highsAndSmalls = getSmallestAndHighest()
    return {
        diffCO2:(highsAndSmalls.highestCO2 - highsAndSmalls.smallestCO2),
        diffNO2:highsAndSmalls.highestNO2 - highsAndSmalls.smallestNO2,
        diffNO:highsAndSmalls.highestNO - highsAndSmalls.smallestNO,        
        diffTemp:highsAndSmalls.highestTemp - highsAndSmalls.smallestTemp    
    }
}

function getNormalizeScale() {
    const highsAndSmalls = getSmallestAndHighest()
    const datas = getDatas()
    let normalizeDatas = []
    datas.forEach((data)=> {
        console.log(data.temp,highsAndSmalls.highestTemp);

        const normalizeData={
            CO2:data.CO2/highsAndSmalls.highestCO2,
            NO2:data.NO2/highsAndSmalls.highestNO2,
            NO:data.NO/highsAndSmalls.highestNO,
            temp:normalize(data.temp,highsAndSmalls.highestTemp,highsAndSmalls.smallestTemp),
            hour:data.hour
        }
        normalizeDatas.push(normalizeData)
    })
    return normalizeDatas    
}

function normalize(val, max, min) { 
    return (val - min) / (max - min); 
}

function getScaleMolecule(position) {
    let scaleMolecule,normmalizeScaleFilter
    let normalizeScale = getNormalizeScale()
    console.log(normalizeScale[0].temp,normalizeScale[0].hour,position)
    switch(position) {
        case "1":
            console.log('coucou');
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[0])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[0])[0].temp
            }
            break;
        case "2":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[1])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[1])[0].temp
            }
            break;

        case "3":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[2])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[2])[0].temp

            }
            break;

        case "4":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[3])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[3])[0].temp

            }
            break;

        case "5":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[4])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[4])[0].temp

            }
            break;

        case "6":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[5])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[5])[0].temp

            }
            break;

        case "7":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[6])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[6])[0].temp

            }
            break;

        case "8":
            normmalizeScaleFilter = normalizeScale.filter(data => data.hour===wantedHours[7])[0]
            scaleMolecule =  {
                NO2:normmalizeScaleFilter.NO2,
                CO2:normmalizeScaleFilter.CO2,
                NO:normmalizeScaleFilter.NO,
                temp:datasGlobal.filter(data => data.hour===wantedHours[7])[0].temp
            }           

    }
    return scaleMolecule
}


export {getDatas,getSmallestAndHighest,getDifference,getNormalizeScale,getScaleMolecule,addEventTemp}