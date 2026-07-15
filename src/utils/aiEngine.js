// AuraSphere AI - GenAI Simulation & Real Gemini API Engine
// Supports local fallback parsing AND live Google Gemini 1.5 API calls with structured JSON output

import { STADIUM_SECTIONS } from './mockData';

const KNOWLEDGE_BASE = {
  accessibility: `
    - Wheelchair access is available via ramps at Gates A, C, and D. Gate B is stairs-only but offers an elevator bypass on the left flank.
    - Accessible seating is located in row 1 of all 100-level sections (Lower tier) and row 1 of all 200-level sections (Upper tier).
    - Wheelchair assistance volunteers are stationed at all main entrance gates wearing glowing pink armbands.
    - Elevators are located at North-A, East-B, South-A, and West-B. Elevator East-B is currently experiencing mechanical delays. Re-route via East-C if near Section 103/203.
  `,
  transport: `
    - Metro Line 1 (Express) runs every 4 minutes directly to the Downtown Fan Zone. Station is 200m North of Gate A.
    - Metro Line 4 (Local) runs every 8 minutes to the Airport Hub. Station is adjacent to Line 1.
    - Park & Ride Shuttle buses run every 15 minutes between Gate C and Lots Green & Red. Expect 10-15 minute traffic delays due to congestion on Stadium Blvd.
    - Rideshare pickup/drop-off is strictly restricted to North Parking Lot Zone E. Walking distance from Gate D is 5 minutes.
    - Bike paths (Aura Cycle Link) connect Gate D to the city-wide network. Bike lockers are free and monitored.
  `,
  concessions: `
    - Vegetarian/Vegan options: 'Green Pitch Bowls' located at Sec 108 and Sec 209. 'Eco-Bites' at Sec 103.
    - Halal/Kosher options: Available at 'Global Flavors' near Sec 105 and Sec 205.
    - Refillable Water: Free hydration stations (Aura Fountain) are located next to restrooms at Sections 101, 106, 108, 203, and 208.
    - Sustainability: All concessions serve food in 100% compostable containers. Fans get 10 points on their carbon app for returning cups.
  `
};

let geminiApiKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('aurasphere_gemini_key') || "") : "";

export function getGeminiKey() {
  return geminiApiKey;
}

export function setGeminiKey(key) {
  geminiApiKey = key;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aurasphere_gemini_key', key);
  }
}

// LOCAL FALLBACK MATCHER
export function processLocalFanQuery(query, language = 'en') {
  const q = query.toLowerCase();
  let responseText = "";
  let action = null;

  const isSpanish = language === 'es' || q.includes('dónde') || q.includes('baño') || q.includes('entrada');
  const isFrench = language === 'fr' || q.includes('où') || q.includes('toilette') || q.includes('porte');

  if (q.includes('wheelchair') || q.includes('accessible') || q.includes('disability') || q.includes('silla de ruedas') || q.includes('handicap')) {
    responseText = isSpanish
      ? "El acceso en silla de ruedas está disponible en las Puertas A, C y D. Hay ascensores en North-A, South-A y West-B. ¿Deseas que te muestre la ruta accesible en 3D en el mapa?"
      : isFrench
      ? "L'accès en fauteuil roulant est disponible aux portes A, C et D. Des ascenseurs sont situés aux portes Nord-A, Sud-A et Ouest-B. Souhaitez-vous voir l'itinéraire accessible en 3D ?"
      : "Wheelchair accessibility is fully supported at Gates A, C, and D. Elevators are active at North-A, South-A, and West-B. Let me trace an accessible path for you. Click on the 3D map to view the route.";
    action = { type: 'HIGHLIGHT_ACCESSIBILITY', details: "Show accessible elevators and gates" };
  } 
  else if (q.includes('gate') || q.includes('entrance') || q.includes('puerta') || q.includes('entrée')) {
    let matchedGate = null;
    if (/\ba\b/.test(q)) matchedGate = 'A';
    else if (/\bb\b/.test(q)) matchedGate = 'B';
    else if (/\bc\b/.test(q)) matchedGate = 'C';
    else if (/\bd\b/.test(q)) matchedGate = 'D';

    if (matchedGate) {
      responseText = `Gate ${matchedGate} is currently loading queue wait times. I've centered the 3D view on Gate ${matchedGate}.`;
      action = { type: 'FOCUS_GATE', gateId: matchedGate };
    } else {
      responseText = "We have 4 main gates: Gate A (North), Gate B (East - currently congested), Gate C (South), and Gate D (West). You can click on any gate in the 3D view to see real-time queue times.";
      action = { type: 'HIGHLIGHT_ALL_GATES' };
    }
  } 
  else if (/\b(10[1-9]|110|20[1-9]|210)\b/.test(q)) {
    const sectionNum = q.match(/\b(10[1-9]|110|20[1-9]|210)\b/)[0];
    const sec = STADIUM_SECTIONS[sectionNum];
    responseText = `Section ${sectionNum} (${sec.tier} Tier) is currently at ${Math.round(sec.occupancy * 100)}% capacity. The nearest restrooms are a ${sec.queueRestroom} min wait. I have highlighted Section ${sectionNum} in the 3D arena view.`;
    action = { type: 'FOCUS_SECTION', sectionId: sectionNum };
  }
  else if (q.includes('water') || q.includes('agua') || q.includes('eau') || q.includes('drink')) {
    responseText = "Free hydration stations (Aura Fountains) are located next to restrooms at Sections 101, 106, 108 (Lower Tier), and 203, 208 (Upper Tier). Bring a reusable cup to save 20 carbon points!";
    action = { type: 'HIGHLIGHT_FACILITIES', facility: 'water' };
  }
  else if (q.includes('food') || q.includes('vegan') || q.includes('vegetarian') || q.includes('comida') || q.includes('nourriture')) {
    responseText = "For vegetarian & vegan dining, head to 'Green Pitch Bowls' near Section 108 (Lower) or Section 209 (Upper). Halal food is served at 'Global Flavors' near Section 105.";
    action = { type: 'HIGHLIGHT_FACILITIES', facility: 'food' };
  }
  else if (q.includes('metro') || q.includes('bus') || q.includes('transit') || q.includes('train') || q.includes('transport')) {
    responseText = "Metro Line 1 (runs every 4m to Downtown) is the fastest option. Shuttles to parking run every 15m from Gate C. Rideshare pickup is located at North Lot Zone E.";
    action = { type: 'FOCUS_TRANSPORT' };
  }
  else if (q.includes('carbon') || q.includes('sustainability') || q.includes('recycle') || q.includes('points') || q.includes('eco')) {
    responseText = "You can earn Eco points and unlock food/merchandise discounts! Earn 50 points by traveling by transit/bike, 30 points by recycling in AI eco-bins, and 20 points by returning cups.";
    action = { type: 'HIGHLIGHT_FACILITIES', facility: 'recycle' };
  }
  else {
    responseText = "Welcome to AuraSphere AI. I am your generative assistant. Ask me about seat directions (e.g. 'where is Section 104?'), gates, accessibility pathways, vegan food, transport times, or carbon credits.";
  }

  return { text: responseText, action, detectedLanguage: language };
}

export function processLocalOpsQuery(query) {
  const q = query.toLowerCase();
  const reasoning = [];
  let responseText = "";
  let actionItem = null;

  reasoning.push("Initializing local query parser...");
  reasoning.push(`Identified intent: Operational Simulation. Command: "${query}"`);

  if (q.includes('gate b') || q.includes('congestion') || q.includes('traffic')) {
    reasoning.push("Accessing local sensors...");
    reasoning.push("Gate B queue length = 28 minutes. 15% validation scan failure rate detected.");
    responseText = "CRITICAL METRIC EXCEEDED: Gate B wait times have reached 28 minutes. Initiating manual scanner deployment...";
    
    actionItem = {
      type: 'RESOLVE_CONGESTION',
      gateId: 'B',
      reRouteTo: 'A',
      recommendations: [
        "Re-route incoming foot traffic from Gate B outer fences to Gate A (12 min wait).",
        "Deploy the 4 standby scanning staff with handheld terminals to Gate B corridor 3.",
        "Broadcast push-notification to group D ticket holders within 500m."
      ],
      broadcastText: "ALERT: Gate B is congested. Ticketholders are advised to enter through Gate A (North) for faster access."
    };
  }
  else if (q.includes('evacuate') || q.includes('emergency') || q.includes('fire') || q.includes('evacuacion')) {
    reasoning.push("CRITICAL ALERT: Evacuation protocols engaged.");
    reasoning.push("Routing models loaded. Safety corridors clear.");
    
    let targetZone = "All Zones";
    if (q.includes('north')) targetZone = "North Stand (Sections 101, 102, 201, 202)";
    else if (q.includes('east')) targetZone = "East Stand (Sections 103, 104, 203, 204)";
    else if (q.includes('south')) targetZone = "South Stand (Sections 105, 106, 205, 206)";
    else if (q.includes('west')) targetZone = "West Stand (Sections 108, 109, 208, 209)";

    responseText = `EVACUATION PROTOCOL INITIATED for ${targetZone}. AI core is overriding digital signage and opening all security barriers.`;

    actionItem = {
      type: 'SIMULATE_EVACUATION',
      zone: targetZone,
      recommendations: [
        "Open all emergency field barriers to allow egress onto pitch corridors.",
        "Set LED directional wayfinding lights to pulsing Green pointing to Gates A, C, and D.",
        "Mute standard broadcast systems; activate emergency siren and pre-recorded fire evacuation audio loops."
      ],
      broadcastText: "EMERGENCY ANNOUNCEMENT: Please exit the stadium immediately through the nearest marked gate. Do not use elevators."
    };
  }
  else if (q.includes('weather') || q.includes('rain') || q.includes('storm') || q.includes('clima')) {
    reasoning.push("Weather radar loaded. Precipitations arriving in 15 mins.");
    responseText = "WEATHER ALERT: Canopy roof closure script initiated.";
    
    actionItem = {
      type: 'WEATHER_PREP',
      canopyOverride: "Close Canopy",
      recommendations: [
        "Activate roof canopy closure (operation takes 11 minutes).",
        "Deploy slip hazard alerts near all concourse stairs (Sections 101-110, 201-210).",
        "Open umbrella check stations at Gates A, C, and D."
      ],
      broadcastText: "ANNOUNCEMENT: The stadium roof is closing due to incoming rain. Please stay clear of the roof drip-lines."
    };
  }
  else {
    responseText = "Operational query processed. I can assist with simulated emergency responses, gate congestion analyses, weather preparations, and ticketing database queries. Try typing 'Gate B congestion' or 'Evacuate East Stand'.";
  }

  return { text: responseText, reasoning, actionItem };
}

// LIVE GEMINI API CONNECTIONS
async function fetchGeminiResponse(inputText, type = 'fan') {
  if (!geminiApiKey) {
    throw new Error("No API Key Set");
  }

  const systemInstructions = type === 'fan' ? 
  `You are AuraSphere AI, a cognitive stadium assistant for the FIFA World Cup 2026.
   You are helping a fan. Provide a helpful, friendly response.
   Use the following stadium knowledge base:
   ${KNOWLEDGE_BASE.accessibility}
   ${KNOWLEDGE_BASE.transport}
   ${KNOWLEDGE_BASE.concessions}
   ${KNOWLEDGE_BASE.sustainability}

   You MUST return a JSON object exactly matching this schema:
   {
     "text": "Your response message string here",
     "action": null or { "type": "FOCUS_SECTION", "sectionId": "104" } or { "type": "FOCUS_GATE", "gateId": "A" } or { "type": "HIGHLIGHT_ACCESSIBILITY" } or { "type": "FOCUS_TRANSPORT" } or { "type": "HIGHLIGHT_FACILITIES", "facility": "water" | "food" | "recycle" }
   }
   Do not add any markdown wraps (\`\`\`json) outside of the raw JSON object itself.`
  :
  `You are AuraSphere AI, a stadium command center copilot for the FIFA World Cup 2026.
   You are assisting venue operators.
   You MUST return a JSON object exactly matching this schema:
   {
     "text": "Operational assessment text here",
     "reasoning": [
       "Reasoning log step 1...",
       "Reasoning log step 2..."
     ],
     "actionItem": null or {
       "type": "SIMULATE_EVACUATION" | "RESOLVE_CONGESTION" | "WEATHER_PREP",
       "gateId": "A" | "B" | "C" | "D" (optional),
       "recommendations": [
         "Action recommendation 1",
         "Action recommendation 2"
       ],
       "broadcastText": "Emergency announcement text draft to read out loud to stadium visitors"
     }
   }
   Do not add any markdown wraps (\`\`\`json) outside of the raw JSON object itself.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstructions}\n\nUser Query: "${inputText}"` }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;
  
  // Clean markdown backtick block enclosures if the model generates them
  let cleanText = rawText.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(json)?/, '');
    cleanText = cleanText.replace(/```$/, '');
    cleanText = cleanText.trim();
  }

  return JSON.parse(cleanText);
}

// ASYNCHRONOUS TYPEWRITER CALLBACK
export async function simulateStreamingResponse(inputText, type = 'fan', callback) {
  let result;
  
  try {
    result = await fetchGeminiResponse(inputText, type);
  } catch (error) {
    console.warn("Gemini API connection failed or API Key missing. Falling back to local matcher. Error:", error.message);
    result = type === 'fan' ? processLocalFanQuery(inputText) : processLocalOpsQuery(inputText);
  }

  let currentText = "";
  const words = result.text.split(" ");
  let wordIndex = 0;

  const interval = setInterval(() => {
    if (wordIndex < words.length) {
      currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
      callback({
        ...result,
        text: currentText,
        done: false
      });
      wordIndex++;
    } else {
      clearInterval(interval);
      callback({
        ...result,
        text: result.text,
        done: true
      });
    }
  }, 40);
}
