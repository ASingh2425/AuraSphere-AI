import { describe, it, expect } from 'vitest';
import { 
  processLocalFanQuery, 
  processLocalOpsQuery, 
  getGeminiKey, 
  setGeminiKey,
  simulateStreamingResponse 
} from './aiEngine';

describe('AuraSphere AI Cognitive Parser Tests', () => {
  
  // 1. SEMANTIC FAN MATCHER TESTS
  describe('processLocalFanQuery (Fan Assist)', () => {
    it('should match wheelchair/accessibility keywords in multiple languages', () => {
      const keywords = ["wheelchair", "accessible", "disability", "silla de ruedas", "handicap"];
      keywords.forEach(kw => {
        const res = processLocalFanQuery(`Where can I find ${kw} access?`);
        expect(res.action.type).toBe('HIGHLIGHT_ACCESSIBILITY');
      });
    });

    it('should match section focus with regex (English/Spanish)', () => {
      const res1 = processLocalFanQuery("How do I get to section 104?");
      expect(res1.action).toEqual({ type: 'FOCUS_SECTION', sectionId: '104' });

      const res2 = processLocalFanQuery("Guiame a la sección 202, por favor");
      expect(res2.action).toEqual({ type: 'FOCUS_SECTION', sectionId: '202' });
    });

    it('should gracefully handle invalid sections', () => {
      const res = processLocalFanQuery("Take me to section 999");
      expect(res.action).toBeNull(); // Fallback action is null
    });

    it('should match specific gate codes', () => {
      const res = processLocalFanQuery("Where is gate C?");
      expect(res.action).toEqual({ type: 'FOCUS_GATE', gateId: 'C' });
      expect(res.text).toContain("Gate C");
    });

    it('should match generic gate questions', () => {
      const res = processLocalFanQuery("Tell me about the gates");
      expect(res.action.type).toBe('HIGHLIGHT_ALL_GATES');
    });

    it('should match water/drink stations', () => {
      const synonyms = ["water", "agua", "eau", "drink"];
      synonyms.forEach(syn => {
        const res = processLocalFanQuery(`I need some ${syn}`);
        expect(res.action).toEqual({ type: 'HIGHLIGHT_FACILITIES', facility: 'water' });
      });
    });

    it('should match food/vegan concessions', () => {
      const synonyms = ["food", "vegan", "vegetarian", "comida", "nourriture"];
      synonyms.forEach(syn => {
        const res = processLocalFanQuery(`Where is the ${syn}?`);
        expect(res.action).toEqual({ type: 'HIGHLIGHT_FACILITIES', facility: 'food' });
      });
    });

    it('should match metro/transit queries', () => {
      const synonyms = ["metro", "bus", "transit", "train", "transport"];
      synonyms.forEach(syn => {
        const res = processLocalFanQuery(`What is the nearest ${syn}?`);
        expect(res.action.type).toBe('FOCUS_TRANSPORT');
      });
    });

    it('should match sustainability/eco carbon queries', () => {
      const synonyms = ["carbon", "sustainability", "recycle", "points", "eco"];
      synonyms.forEach(syn => {
        const res = processLocalFanQuery(`How do I earn ${syn} rewards?`);
        expect(res.action).toEqual({ type: 'HIGHLIGHT_FACILITIES', facility: 'recycle' });
      });
    });

    it('should return default fallback response for unknown prompts', () => {
      const res = processLocalFanQuery("Hello AuraSphere!");
      expect(res.action).toBeNull();
      expect(res.text).toContain("Welcome to AuraSphere AI");
    });
  });

  // 2. SEMANTIC OPS MATCHER TESTS
  describe('processLocalOpsQuery (Ops Copilot)', () => {
    it('should parse congestion scenarios', () => {
      const queries = ["gate b", "congestion", "traffic"];
      queries.forEach(q => {
        const res = processLocalOpsQuery(`Simulate ${q}`);
        expect(res.actionItem.type).toBe('RESOLVE_CONGESTION');
        expect(res.actionItem.gateId).toBe('B');
      });
    });

    it('should parse emergency evacuation drills', () => {
      const queries = ["evacuate", "emergency", "fire"];
      queries.forEach(q => {
        const res = processLocalOpsQuery(`Trigger ${q}`);
        expect(res.actionItem.type).toBe('SIMULATE_EVACUATION');
      });
    });

    it('should parse incoming weather storm protocols', () => {
      const queries = ["weather", "rain", "storm"];
      queries.forEach(q => {
        const res = processLocalOpsQuery(`Activate ${q} prep`);
        expect(res.actionItem.type).toBe('WEATHER_PREP');
      });
    });

    it('should return default fallback logs for generic commands', () => {
      const res = processLocalOpsQuery("Perform sensor diagnostics");
      expect(res.actionItem).toBeNull(); // Fallback actionItem is null
      expect(res.reasoning.length).toBeGreaterThan(0);
    });
  });

  // 3. PERSISTENCE TESTS
  describe('API Key State Handler', () => {
    it('should retrieve and store credentials properly', () => {
      setGeminiKey("AIzaSyFakeKey_998877");
      expect(getGeminiKey()).toBe("AIzaSyFakeKey_998877");
      setGeminiKey("");
      expect(getGeminiKey()).toBe("");
    });
  });

  // 4. ASYNCHRONOUS STREAM BUFFER TESTS
  describe('simulateStreamingResponse (Asynchronous)', () => {
    it('should test asynchronous streaming chunks for fan assistant', () => {
      return new Promise((resolve) => {
        let chunkCount = 0;
        simulateStreamingResponse("Where is section 104?", "fan", (chunk) => {
          chunkCount++;
          expect(chunk.text).toBeDefined();
          
          if (chunk.done) {
            expect(chunkCount).toBeGreaterThan(0);
            expect(chunk.action).toEqual({ type: 'FOCUS_SECTION', sectionId: '104' });
            resolve();
          }
        });
      });
    });

    it('should test asynchronous streaming chunks for ops copilot', () => {
      return new Promise((resolve) => {
        let chunkCount = 0;
        simulateStreamingResponse("Rain weather warning", "ops", (chunk) => {
          chunkCount++;
          
          if (chunk.done) {
            expect(chunkCount).toBeGreaterThan(0);
            expect(chunk.actionItem.type).toBe('WEATHER_PREP');
            resolve();
          }
        });
      });
    });
  });
});
