import _ from 'lodash';
import React  from'react';
import { createPortal } from 'react-dom';
import { IHeaderParams } from './BaseHeader';

import { BarChart, Bar, 
	 //Tooltip,
	 //Legend,
	 //Cell, XAxis, YAxis, CartesianGrid, , ResponsiveContainer,
	   } from 'recharts';
import { Tooltip } from './RechartTooltip';
import { isNumOrStr, ValueType } from './RechartExtra';
//import { ICellRendererParams } from 'ag-grid-community';

export interface ICustomHeaderParams extends IHeaderParams {
  menuIcon: string;
  histogram?: number[]
}


function defaultFormatter<TValue extends ValueType>(value: TValue) {
  return _.isArray(value) && isNumOrStr(value[0]) && isNumOrStr(value[1]) ? (value.join(' ~ ') as TValue) : value;
}


export const bakedData = [
  {
    name: 'Page A',    population: 4000,
  },
  {
    name: 'Page B',
    population: 3000,
  },
  {
    name: 'Page C',
    population: 2000,
  },
  {
    name: 'Page D',
    population: 2780,
  },
  {
    name: 'Page E',
    population: 1890,
  },
];

export const makeData = (histogram: number[]) => {
  const accum = [];
  for (let i = 0; i < histogram.length; i++) {
    accum.push({
      name:`${i+1}/${histogram.length}`,
      population: histogram[i]
    })
  }
  console.log("accum", accum)
  return accum;

}



const formatter = (value:any, name:any, props:any) => {
  //console.log("formatter", value, name, props)
  return [value, props.payload.name]
}

/*
function App() {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <button ref={setAnchor}>Button</button>
      <Tooltip anchor={anchor} />
    </>
  );
}
*/


export function getOffset(el:any) {
  console.log("el", el);
  /*
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
  */
}

export function FloatingTooltip({items, x, y}:any) {
  console.log("x",x, "y", y);
  const offset = 30;
  const renderedItems = items.map(
	(name:string, value:number|string) => {
	  return (<React.Fragment>
	    <dt>{name}</dt><dd>{value}</dd>
	    </React.Fragment>)
	}
      )
  return (
    createPortal(
      <div className="floating-tooltip"
      style={{"position":"absolute", "top":y+offset, "left":x+offset}}>
      <dl>
      {renderedItems}
       </dl>
      </div>,
      document.body)
  );
}

export const ToolTipAdapter = (args:any) => {
  const { active, formatter, payload, label } = args;
  console.log("label", label);
  //console.log("args", args, formatter);
  //console.log("coordinate, box", args.coordinate, args.box);
    //console.log("payload", payload)
    //const anchor = useRef(null);

  if (active && payload && payload.length) {


  const renderContent2 = () => {
    //const items = (itemSorter ? _.sortBy(payload, itemSorter) : payload).map((entry, i) => {
    const items = payload.map((entry:any, i:number) => {
        if (entry.type === 'none') {
          return null;
        }

        const finalFormatter = entry.formatter || formatter || defaultFormatter;
        const { value, name } = entry;
        let finalValue: React.ReactNode = value;
        let finalName: React.ReactNode = name;
        if (finalFormatter && finalValue != null && finalName != null) {
          const formatted = finalFormatter(value, name, entry, i, payload);
          if (Array.isArray(formatted)) {
            [finalValue, finalName] = formatted;
          } else {
            finalValue = formatted;
          }
        }

      return [finalName, finalValue];
    })
    return items;
  };
    /*
        <p className="label">{`${label} : ${payload[0].value}`}</p>
        <p className="intro">{label}</p>
        <p className="desc">Anything you want can be displayed here.</p>


      */
    return (
      <div className="custom-tooltip">
	<FloatingTooltip items={renderContent2()}  x={args.box.x} y={args.box.y} />
      	</div>
    );
  }

  return null;
};

//export const HistogramCell   = ({histogram}: {histogram:any}) => {
export const HistogramCell   = (props:any) => {
  
  if( props == undefined || props.value == undefined) {
    return <span></span>
  }
  const histogram = props.value.histogram;
  return (<div className="histogram-component"> 
    <BarChart  width={100} height={25} barGap={1} data={histogram} >
         <defs>
            <pattern id="star" width="10" height="10" patternUnits="userSpaceOnUse">
              <polygon points="0,0 2,5 0,10 5,8 10,10 8,5 10,0 5,2" />
            </pattern>
            <pattern id="stripe" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2" height="4" fill="red" />

            </pattern>
    <pattern id="circles" width="4" height="4" patternUnits="userSpaceOnUse" >
    <circle
	  data-color="outline"  stroke="#FFF"   cx=".5" cy=".5" r="1.5">
    </circle>
    </pattern>


    <pattern id="checkers" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
       <rect  x="0" width="2" height="2" y="0" ></rect>
       <rect  x="2" width="2" height="2" y="2"></rect>
    </pattern>
    

    <pattern id="leafs" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="translate(1, 1) rotate(0) skewX(0)">
    <svg width="5" height="5" viewBox="0 0 100 100">
    <g fill="#141414" opacity="1">
    <path d="M99.9557 99.9557C45.4895 98.3748 1.6248 54.5101 0.0439453 0.0439453C54.5101 1.6248 98.3748 45.4895 99.9557 99.9557Z">
    </path>
    </g>
    </svg>
    </pattern>

    </defs>
    <Bar dataKey="population" stroke="#000" fill="gray"           stackId="stack" />
    <Bar dataKey="true"       stroke="#000" fill="#000"           stackId="stack" />
    <Bar dataKey="false"      stroke="#000" fill="#fff"           stackId="stack" />
    <Bar dataKey="cat_pop"    stroke="gray" fill="url(#circles)"  stackId="stack" />
    <Bar dataKey="unique"     stroke="#000" fill="url(#checkers)" stackId="stack"/>
    <Bar dataKey="longtail"   stroke="#000" fill="url(#leafs)"    stackId="stack"/>
    <Bar dataKey="NA"                       fill="url(#stripe)"   stackId="stack"/>
    
    <Tooltip  formatter={formatter} labelStyle={{"display":"None"}}
	  wrapperStyle={{"zIndex":  999991 }}
          contentStyle={{"color":"black"}}
	  content={<ToolTipAdapter/>} 
	  offset={20}
	  allowEscapeViewBox={{x:true}}
/>
    </BarChart>
    </div>
    );
}

