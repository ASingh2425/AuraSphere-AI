import { describe, it, expect } from 'vitest';
import { STADIUM_SECTIONS, GATES, TRANSPORT_SERVICES, SUSTAINABILITY_BADGES } from './mockData';

describe('Stadium Mock Data Telemetry Tests', () => {
  it('should verify that stadium seating stands are correctly configured', () => {
    expect(STADIUM_SECTIONS).toBeDefined();
    expect(Object.keys(STADIUM_SECTIONS).length).toBe(20); // 10 lower tier, 10 upper tier stands
    
    // Check Section 104 properties
    const sec104 = STADIUM_SECTIONS['104'];
    expect(sec104).toBeDefined();
    expect(sec104.tier).toBe('Lower');
    expect(sec104.capacity).toBe(600);
    expect(sec104.occupancy).toBeGreaterThan(0.9);
    expect(sec104.wheelchairSeats).toBeDefined();
  });

  it('should verify gate wait metrics are correctly configured', () => {
    expect(GATES).toBeDefined();
    expect(Object.keys(GATES).length).toBe(4); // Gates A, B, C, D
    
    // Gate B (expected to be slow/congested)
    const gateB = GATES['B'];
    expect(gateB).toBeDefined();
    expect(gateB.waitTime).toBe(28);
    expect(gateB.status).toBe('Congested');
  });

  it('should verify transit and sustainability configurations', () => {
    expect(TRANSPORT_SERVICES).toBeDefined();
    expect(TRANSPORT_SERVICES.length).toBeGreaterThan(0);
    
    expect(SUSTAINABILITY_BADGES).toBeDefined();
    expect(SUSTAINABILITY_BADGES.length).toBe(4);
    expect(SUSTAINABILITY_BADGES[0].points).toBe(50);
  });
});
