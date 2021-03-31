import { csvParse, autoType } from 'd3-dsv';
import * as d3 from 'd3';

export function setColors(themes, theme) {
  for (let color in themes[theme]) {
    document.documentElement.style.setProperty('--' + color, themes[theme][color]);
  }
}

export async function getData(url) {
  let response = await fetch(url);
  let string = await response.text();
	let data = await csvParse(string, autoType);
  return data;
}

function unroll(rollup, keys, label = "value", p = {}) {
  return Array.from(rollup, ([key, value]) => 
    value instanceof Map  
      ? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key } ))
      : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
  ).flat();
}


export function reducer(variable){ 
  return ( variable==="Visites" ||variable==="Pacients") ?  d3.sum :  d3.mean
}

export function rollUnroll(data, reducer, keys, value) {
  const rolled = d3.rollup(data, reducer, ...keys.map(k => d => d[k]));
  return unroll(rolled, keys, value);
}