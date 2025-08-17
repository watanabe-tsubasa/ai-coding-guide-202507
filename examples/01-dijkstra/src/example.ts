import { Graph } from './graph';
import { dijkstra } from './dijkstra';

// 1. Create a graph instance
const japan = new Graph();

// 2. Add cities (nodes)
const cities = ['Tokyo', 'Osaka', 'Nagoya', 'Fukuoka', 'Sendai'];
cities.forEach(city => japan.addNode(city));

// 3. Add routes (edges) with distances in km
japan.addEdge('Tokyo', 'Nagoya', 350);
japan.addEdge('Tokyo', 'Sendai', 350);
japan.addEdge('Tokyo', 'Osaka', 500);
japan.addEdge('Nagoya', 'Osaka', 150);
japan.addEdge('Nagoya', 'Sendai', 600);
japan.addEdge('Osaka', 'Fukuoka', 600);

// 4. Define the start city
const startCity = 'Tokyo';

console.log(`Calculating shortest paths from ${startCity}...
`);

// 5. Calculate and display the shortest path to each city
cities.forEach(endCity => {
  if (endCity === startCity) {
    return;
  }

  const { distances, path } = dijkstra(japan, startCity, endCity);
  
  if (path.length > 0) {
    const distance = distances[endCity];
    const route = path.join(' -> ');
    console.log(`- Path to ${endCity}:`);
    console.log(`  Route: ${route}`);
    console.log(`  Distance: ${distance} km
`);
  } else {
    console.log(`- Path to ${endCity}: Unreachable
`);
  }
});
