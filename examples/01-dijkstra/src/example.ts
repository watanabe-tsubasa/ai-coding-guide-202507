import { Graph } from './graph';
import { dijkstra } from './dijkstra';

// 都市間の最短経路を求める例
const cityGraph = new Graph();

// 都市を追加
const cities = ['東京', '大阪', '名古屋', '福岡', '仙台'];
cities.forEach(city => cityGraph.addNode(city));

// 都市間の距離（km）を設定
cityGraph.addEdge('東京', '名古屋', 350);
cityGraph.addEdge('東京', '仙台', 350);
cityGraph.addEdge('名古屋', '大阪', 150);
cityGraph.addEdge('大阪', '福岡', 480);
cityGraph.addEdge('名古屋', '福岡', 640);
cityGraph.addEdge('東京', '大阪', 500); // 直行ルート

// 東京から各都市への最短経路を計算
const shortestPaths = dijkstra(cityGraph, '東京');

console.log('東京から各都市への最短経路:');
console.log('=====================================');

for (const [city, { distance, path }] of shortestPaths) {
  if (city !== '東京') {
    if (distance === Infinity) {
      console.log(`${city}: 到達不可能`);
    } else {
      console.log(`${city}: ${distance}km`);
      console.log(`  経路: ${path.join(' → ')}`);
    }
  }
}

// 実行方法: npx tsx src/example.ts