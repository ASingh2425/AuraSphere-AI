import { describe, it, expect } from 'vitest';
import { 
  processLocalFanQuery, 
  processLocalOpsQuery, 
  getGeminiKey, 
  setGeminiKey 
} from './aiEngine';

describe('AuraSphere AI Cognitive Parser Tests', () => {
  it('should verify local fan query semantic parsing & WebGL hooks', () => {
    // Accessibility query
    const resAcc = processLocalFanQuery("where is wheelchair access?");
    expect(resAcc.text).toMatch(/Gates A, C, and D|Puertas A, C y D/i);
    expect(resAcc.action).toEqual({ type: 'HIGHLIGHT_ACCESSIBILITY', details: 'Show accessible elevators and gates' });

    // Section queries
    const resSec = processLocalFanQuery("where is Section 104?");
    expect(resSec.text).toContain("Section 104");
    expect(resSec.action).toEqual({ type: 'FOCUS_SECTION', sectionId: '104' });

    // Concession queries
    const resFood = processLocalFanQuery("Is there vegetarian or vegan food?");
    expect(resFood.text).toContain("Green Pitch Bowls");
    expect(resFood.action).toEqual({ type: 'HIGHLIGHT_FACILITIES', facility: 'food' });
  });

  it('should verify operational SOP simulation checklists & broadcast scripts', () => {
    // Congestion response
    const resCong = processLocalOpsQuery("Gate B is congested");
    expect(resCong.reasoning).toBeDefined();
    expect(resCong.reasoning.length).toBeGreaterThan(0);
    expect(resCong.actionItem.type).toBe('RESOLVE_CONGESTION');
    expect(resCong.actionItem.broadcastText).toMatch(/Gate B/i);

    // Evacuation response
    const resEvac = processLocalOpsQuery("Evacuate East Stand");
    expect(resEvac.actionItem.type).toBe('SIMULATE_EVACUATION');
    expect(resEvac.actionItem.recommendations.length).toBeGreaterThan(0);
    expect(resEvac.actionItem.broadcastText).toMatch(/emergency/i);
  });

  it('should verify Gemini API Key getter and setter persistence', () => {
    setGeminiKey("test_fake_key_value_123");
    expect(getGeminiKey()).toBe("test_fake_key_value_123");
    
    // Clear key
    setGeminiKey("");
    expect(getGeminiKey()).toBe("");
  });
});
