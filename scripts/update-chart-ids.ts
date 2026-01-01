/**
 * chart_idを「曲名_難易度_譜面定数」形式に統一するスクリプト
 * 
 * 実行方法: npx tsx scripts/update-chart-ids.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Chart {
  chart_id: string;
  title: string;
  difficulty: string;
  const_value: number;
  match_config: {
    csv_difficulty: string;
    csv_level: string;
    order: number;
  } | null;
}

const chartsPath = path.join(__dirname, '..', 'src', 'data', 'charts.json');

// Read charts.json
const chartsData = fs.readFileSync(chartsPath, 'utf-8');
const charts: Chart[] = JSON.parse(chartsData);

console.log(`Processing ${charts.length} charts...`);

// Track changes
let changedCount = 0;
const duplicateCheck = new Map<string, number>();

// Update chart_ids
const updatedCharts = charts.map((chart) => {
  // Generate new chart_id: title_difficulty_constValue (always with .0 decimal)
  const newChartId = `${chart.title}_${chart.difficulty}_${chart.const_value.toFixed(1)}`;
  
  // Check for duplicates
  const existing = duplicateCheck.get(newChartId);
  if (existing !== undefined) {
    console.error(`⚠️ DUPLICATE FOUND: "${newChartId}" appears multiple times!`);
    duplicateCheck.set(newChartId, existing + 1);
  } else {
    duplicateCheck.set(newChartId, 1);
  }
  
  if (chart.chart_id !== newChartId) {
    console.log(`Changed: "${chart.chart_id}" → "${newChartId}"`);
    changedCount++;
  }
  
  return {
    ...chart,
    chart_id: newChartId,
  };
});

// Report duplicates
const duplicates = Array.from(duplicateCheck.entries()).filter(([, count]) => count > 1);
if (duplicates.length > 0) {
  console.error('\n❌ DUPLICATES FOUND! Not saving changes.');
  console.error('The following chart_ids have duplicates:');
  duplicates.forEach(([id, count]) => {
    console.error(`  - "${id}" (${count} times)`);
  });
  process.exit(1);
}

// Write back to charts.json
fs.writeFileSync(chartsPath, JSON.stringify(updatedCharts, null, 2) + '\n', 'utf-8');

console.log(`\n✅ Successfully updated ${changedCount} chart_ids.`);
console.log(`Total charts: ${charts.length}`);
