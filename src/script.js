import './style.css'
import {displayDatas} from './parts/timeline.js'
import {addEventTemp, getDatas} from './parts/datas.js'
displayDatas()
addEventTemp()
import './parts/test.js'
 

/*   let chartConfig = {
    type: 'ring',
    globals: {
      fontFamily: 'Lato',
      fontWeight: '100'
    },
    backgroundColor: '#282E3D',
    plot: {
      valueBox: {
        type: 'first',
        text: '<span style=\'font-size:60px;\'>402</span><br>Total Nodes',
        connected: false,
        fontColor: '#fff',
        fontSize: '40px',
        placement: 'center',
        rules: [
          {
            rule: '%v > 50',
            visible: false
          }
        ],
        visible: true
      },
      animation: {
        delay: 0,
        effect: 'ANIMATION_EXPAND_VERTICAL',
        method: 'ANIMATION_LINEAR',
        sequence: 'ANIMATION_BY_PLOT',
        speed: '600'
      },
      detach: false,
      hoverState: {
        visible: false
      },
      refAngle: 270,
      slice: 175
    },
    plotarea: {
      margin: '0% 0% 0% 0%'
    },
    tooltip: {
      visible: false
    },
    series: [
      {
        values: [25],
        backgroundColor: '#FDFD47',
        borderColor: '#282E3D',
        borderWidth: '2px',
        shadow: false
      },
      {
        values: [75],
        backgroundColor: '#35D884',
        borderColor: '#282E3D',
        borderWidth: '2px',
        shadow: false
      }
    ]
  };
  
  zingchart.render({
    id: 'myChart',
    data: chartConfig,
    hideprogresslogo: true,
    height: '100%',
    width: '100%',
  }); */