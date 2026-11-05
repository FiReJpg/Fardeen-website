// Authoring helper only. The website uses the generated SVG without a build step.
// Geometry: us-atlas 3 / U.S. Census Bureau, 2017. See assets/us-map-LICENSE.txt.
import { readFile, writeFile } from 'node:fs/promises';

const topology = JSON.parse(await readFile(new URL('../assets/us-states-albers.json', import.meta.url), 'utf8'));
const { scale, translate } = topology.transform;
const arcs = topology.arcs.map(arc => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
});
function ringPath(indices) {
  const points = indices.flatMap((index, position) => {
    const points = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
    return position ? points.slice(1) : points;
  });
  return points.map(([x,y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + 'Z';
}
const states = topology.objects.states.geometries.filter(state => !['02', '15', '72'].includes(String(state.id).padStart(2, '0')));
const paths = states.map(state => {
  const polygons = state.type === 'Polygon' ? [state.arcs] : state.arcs;
  return `<path d="${polygons.flatMap(polygon => polygon.map(ringPath)).join('')}"/>`;
}).join('\n');
await writeFile(new URL('../assets/us-dispatch-map.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 975 610"><title>Contiguous United States dispatch map</title><g fill="#d4ee6a" fill-opacity=".055" stroke="#e8f4d6" stroke-opacity=".3" stroke-width=".7" stroke-linejoin="round">${paths}</g></svg>\n`);

// Match us-atlas' Albers USA projection for the route endpoints.
const rad = Math.PI / 180;
const n = (Math.sin(29.5 * rad) + Math.sin(45.5 * rad)) / 2;
const c = 1 + Math.sin(29.5 * rad) * (2 * n - Math.sin(29.5 * rad));
function raw(lon, lat) {
  const rho = Math.sqrt(c - 2 * n * Math.sin(lat * rad)) / n;
  return [rho * Math.sin(lon * rad * n), rho * Math.cos(lon * rad * n)];
}
const center = raw(-.6, 38.7);
const cities = { losAngeles: [-118.24,34.05], dallas: [-96.8,32.78], chicago: [-87.63,41.88], atlanta: [-84.39,33.75], newYork: [-74.01,40.71], seattle: [-122.33,47.61] };
console.log(JSON.stringify(Object.fromEntries(Object.entries(cities).map(([name,[lon,lat]]) => {
  const p = raw(lon + 96, lat);
  return [name,[+(487.5 + 1300 * (p[0] - center[0])).toFixed(1), +(305 + 1300 * (p[1] - center[1])).toFixed(1)]];
})), null, 2));
