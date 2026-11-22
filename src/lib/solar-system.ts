// JPL Table 1, valid 1800–2050, in the J2000 ecliptic frame.
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
type Elements = readonly [
  eccentricity: number, inclination: number, meanLongitude: number,
  perihelionLongitude: number, ascendingNode: number,
];

interface Orbit {
  name: string;
  elements: Elements;
  rates: Elements;
  axis: number; // Semi-major axis in AU and its rate in AU per Julian century.
  axisRate: number;
}

const orbits: Orbit[] = [
  { name: 'Mercury', axis: 0.38709927, axisRate: 0.00000037,
    elements: [0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
    rates: [0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081] },
  { name: 'Venus', axis: 0.72333566, axisRate: 0.00000390,
    elements: [0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
    rates: [-0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418] },
  { name: 'Earth', axis: 1.00000261, axisRate: 0.00000562,
    elements: [0.01671123, -0.00001531, 100.46457166, 102.93768193, 0],
    rates: [-0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0] },
  { name: 'Mars', axis: 1.52371034, axisRate: 0.00001847,
    elements: [0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rates: [0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343] },
  { name: 'Jupiter', axis: 5.20288700, axisRate: -0.00011607,
    elements: [0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rates: [-0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106] },
  { name: 'Saturn', axis: 9.53667594, axisRate: -0.00125060,
    elements: [0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rates: [-0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794] },
  { name: 'Uranus', axis: 19.18916464, axisRate: -0.00196176,
    elements: [0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
    rates: [-0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589] },
  { name: 'Neptune', axis: 30.06992276, axisRate: 0.00026291,
    elements: [0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
    rates: [0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664] },
];

const rad = Math.PI / 180;
const j2000 = Date.UTC(2000, 0, 1, 12);
const century = 36525 * 86400000;

function coordinatesAt(orbit: Orbit, centuries: number) {
  const [e, inclination, longitude, perihelion, node] = orbit.elements.map(
    (value, index) => value + orbit.rates[index] * centuries,
  );
  const meanAnomaly = ((longitude - perihelion) % 360) * rad;
  let eccentricAnomaly = meanAnomaly;
  // Fixed iteration count converges for all eight planetary eccentricities.
  for (let i = 0; i < 5; i++) {
    eccentricAnomaly -= (eccentricAnomaly - e * Math.sin(eccentricAnomaly) - meanAnomaly)
      / (1 - e * Math.cos(eccentricAnomaly));
  }
  const axis = orbit.axis + orbit.axisRate * centuries;
  const orbitalX = axis * (Math.cos(eccentricAnomaly) - e);
  const orbitalY = axis * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);
  const perihelionAngle = (perihelion - node) * rad;
  const nodeX = Math.cos(perihelionAngle) * orbitalX - Math.sin(perihelionAngle) * orbitalY;
  const nodeY = Math.sin(perihelionAngle) * orbitalX + Math.cos(perihelionAngle) * orbitalY;
  const projectedY = Math.cos(inclination * rad) * nodeY;
  return {
    x: Math.cos(node * rad) * nodeX - Math.sin(node * rad) * projectedY,
    y: Math.sin(node * rad) * nodeX + Math.cos(node * rad) * projectedY,
    z: Math.sin(inclination * rad) * nodeY,
  };
}

function longitude(x: number, y: number) {
  return (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);
}

// Earth-relative J2000 ecliptic coordinates in degrees and AU for the timeline sky.
export function skyBodiesAt(date: Date) {
  const centuries = (date.valueOf() - j2000) / century;
  const planets = orbits.map(orbit => ({ name: orbit.name, ...coordinatesAt(orbit, centuries) }));
  const earth = planets[2];
  return [{ name: 'Sun', x: 0, y: 0, z: 0 }, ...planets.filter(body => body !== earth)].map(body => {
    const x = body.x - earth.x;
    const y = body.y - earth.y;
    const z = body.z - earth.z;
    return {
      name: body.name, longitude: longitude(x, y) / rad,
      latitude: Math.atan2(z, Math.hypot(x, y)) / rad, distance: Math.hypot(x, y, z),
    };
  });
}
