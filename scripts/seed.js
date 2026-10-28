import { store } from '../apps/api/src/store.js';

console.log('🌱 [CivicAI] Seeding database with initial civic telemetry and incident records...');
const incidents = store.getAll();
console.log(`✅ [CivicAI] Seed completed successfully with ${incidents.length} incidents.`);
