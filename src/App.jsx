import React, { useState, useEffect } from 'react';
import Stadium3D from './components/Stadium3D';
import FanAssistant from './components/FanAssistant';
import OpsDashboard from './components/OpsDashboard';
import OpsCopilot from './components/OpsCopilot';
import IncidentManager from './components/IncidentManager';
import SustainabilityTracker from './components/SustainabilityTracker';
import { MOCK_INCIDENTS } from './utils/mockData';
import { setGeminiKey, getGeminiKey } from './utils/aiEngine';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState("fan"); // 'fan' or 'ops'
  const [activeSubTab, setActiveSubTab] = useState("dashboard"); // 'dashboard', 'copilot', 'incidents' for ops
  
  // Selected 3D nodes
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedGate, setSelectedGate] = useState(null);
  
  // Simulation modes passed to Three.js
  const [viewMode, setViewMode] = useState("default");
  const [pathfinderRoute, setPathfinderRoute] = useState(null);
  
  // LocalStorage state persistence
  const [carbonPoints, setCarbonPoints] = useState(() => {
    const pts = localStorage.getItem('aurasphere_carbon_points');
    return pts ? parseInt(pts) : 10; // Start with paperless ticket reward
  });

  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('aurasphere_incidents');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return MOCK_INCIDENTS;
  });

  const [geminiKeyInput, setGeminiKeyInput] = useState(() => getGeminiKey());

  // Cinematic Boot Loader state
  const [bootPercent, setBootPercent] = useState(0);
  const [bootStatus, setBootStatus] = useState("Loading core matrices...");
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Sync state values to LocalStorage
  useEffect(() => {
    localStorage.setItem('aurasphere_carbon_points', carbonPoints);
  }, [carbonPoints]);

  useEffect(() => {
    localStorage.setItem('aurasphere_incidents', JSON.stringify(incidents));
  }, [incidents]);

  // 1. SIMULATE BOOTING SCREEN
  useEffect(() => {
    const statuses = [
      "Loading core matrices...",
      "Initializing WebGL 3D context...",
      "Retrieving stadium sensor arrays...",
      "Loading multilingual cognitive systems...",
      "AuraSphere AI Core active."
    ];

    const timer = setInterval(() => {
      setBootPercent(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        
        const idx = Math.floor((prev / 100) * statuses.length);
        setBootStatus(statuses[Math.min(idx, statuses.length - 1)]);
        
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // 2. TAB CHANGING SOUNDS (Web Audio API synthesis)
  const playTabChime = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e){}
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    playTabChime();
    
    setSelectedSection(null);
    setSelectedGate(null);
    setPathfinderRoute(null);

    if (tabName === 'fan') {
      setViewMode("default");
    } else {
      setViewMode("heatmap");
      setActiveSubTab("dashboard");
    }
  };

  const handleSubTabChange = (subTabName) => {
    setActiveSubTab(subTabName);
    playTabChime();
    
    if (subTabName === 'dashboard') {
      setViewMode("heatmap");
    } else if (subTabName === 'copilot') {
      setViewMode("default");
    } else if (subTabName === 'incidents') {
      setViewMode("accessibility");
    }
  };

  // 3. REACT TO CHAT MAP ACTIONS
  const handleMapAction = (action) => {
    if (action.type === 'HIGHLIGHT_ACCESSIBILITY') {
      setViewMode("accessibility");
      setPathfinderRoute({ from: 'A', to: '103' });
    } else if (action.type === 'FOCUS_SECTION') {
      setViewMode("default");
      setSelectedSection(action.sectionId);
      setSelectedGate(null);
    } else if (action.type === 'FOCUS_GATE') {
      setViewMode("default");
      setSelectedGate(action.gateId);
      setSelectedSection(null);
    } else if (action.type === 'HIGHLIGHT_ALL_GATES') {
      setViewMode("default");
      setSelectedGate(null);
      setSelectedSection(null);
    } else if (action.type === 'FOCUS_TRANSPORT') {
      setViewMode("default");
      setPathfinderRoute({ from: 'D', to: '108' });
    } else if (action.type === 'HIGHLIGHT_FACILITIES') {
      setViewMode("sustainability");
    }
  };

  // 4. REACT TO COPILOT EMERGENCY ACTIONS
  const handleCopilotAction = (actionItem) => {
    if (actionItem.type === 'SIMULATE_EVACUATION') {
      setViewMode("evacuation");
      setSelectedSection(null);
      setSelectedGate(null);
      setPathfinderRoute(null);
    } else if (actionItem.type === 'RESOLVE_CONGESTION') {
      setViewMode("heatmap");
      setSelectedGate(actionItem.gateId);
      setPathfinderRoute({ from: actionItem.gateId, to: '101' });
    } else if (actionItem.type === 'WEATHER_PREP') {
      setViewMode("default");
      alert("Roof canopy motors engaged: 3D model closing roof canopy.");
    }
  };

  const handleAddCarbonPoints = (points) => {
    setCarbonPoints(prev => prev + points);
  };

  const handleKeyInputChange = (e) => {
    const val = e.target.value;
    setGeminiKeyInput(val);
    setGeminiKey(val);
  };

  if (bootPercent < 100) {
    return (
      <div className="boot-screen">
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <h1 className="neon-text-blue glitched-effect" style={{ fontSize: '32px', marginBottom: '8px', letterSpacing: '4px' }}>
            AURASPHERE AI
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
            FIFA WORLD CUP 2026 STADIUM INTEL CORE
          </div>
          
          <div className="boot-grid">
            <div className="boot-bar" style={{ width: `${bootPercent}%` }} />
          </div>
          
          <div className="telemetry" style={{ fontSize: '12px', color: 'var(--neon-green)', height: '15px' }}>
            {bootStatus} ({bootPercent}%)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px', gap: '16px' }}>
      
      <div className="scanlines" />

      {/* HEADER SECTION */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(5, 10, 28, 0.7)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="neon-text-blue" style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>
            AURASPHERE AI
          </h1>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
            WORLD CUP 2026 // COGNITIVE OPERATIONS HUB
          </span>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleTabChange("fan")}
            className={`futuristic-btn ${activeTab === 'fan' ? 'green' : ''}`}
            style={{ fontSize: '11px' }}
          >
            FAN PORTAL HUB
          </button>
          <button 
            onClick={() => handleTabChange("ops")}
            className={`futuristic-btn ${activeTab === 'ops' ? 'green' : ''}`}
            style={{ fontSize: '11px', borderColor: activeTab === 'ops' ? 'var(--neon-blue)' : 'rgba(0, 240, 255, 0.4)' }}
          >
            COMMAND CENTER
          </button>
        </div>

        {/* Gemini Key Config Overlay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
            GEMINI API KEY:
          </span>
          <input 
            type="password" 
            value={geminiKeyInput}
            onChange={handleKeyInputChange}
            placeholder="paste AI key (optional)"
            style={{
              background: 'rgba(5, 8, 20, 0.9)',
              border: '1px solid var(--border-color)',
              color: 'var(--neon-green)',
              padding: '4px 8px',
              fontSize: '11px',
              width: '130px',
              borderRadius: '3px',
              outline: 'none',
              fontFamily: 'var(--font-mono)'
            }}
          />
        </div>

        {/* Time and Audio widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              background: 'none',
              border: 'none',
              color: audioEnabled ? 'var(--neon-green)' : 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title={audioEnabled ? "Mute chimes" : "Enable chimes"}
          >
            {audioEnabled ? "🔊 AUDIO ON" : "🔇 AUDIO OFF"}
          </button>

          <div className="telemetry" style={{ fontSize: '13px', textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
            <div style={{ color: 'var(--neon-blue)' }}>21:40:24 local</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>METLIFE STADIUM</div>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT LAYOUT */}
      <main style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: 3D Holographic Stadium Map Container */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          <div style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            background: 'rgba(5, 8, 20, 0.8)'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)' }}>
              LIVE 3D RENDER ENGINE (WEBGL)
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setViewMode("default")} 
                style={{
                  background: viewMode === 'default' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: viewMode === 'default' ? 'var(--neon-blue)' : 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  fontSize: '9px',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                TACTICAL
              </button>
              <button 
                onClick={() => setViewMode("heatmap")} 
                style={{
                  background: viewMode === 'heatmap' ? 'rgba(255, 204, 0, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: viewMode === 'heatmap' ? 'var(--neon-amber)' : 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255, 204, 0, 0.2)',
                  fontSize: '9px',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                CROWD HEATMAP
              </button>
              <button 
                onClick={() => setViewMode("accessibility")} 
                style={{
                  background: viewMode === 'accessibility' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: viewMode === 'accessibility' ? 'var(--neon-green)' : 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  fontSize: '9px',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                ACCESSIBILITY
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <Stadium3D 
              selectedSection={selectedSection}
              onSectionSelect={(id) => {
                setSelectedSection(id);
                setSelectedGate(null);
              }}
              selectedGate={selectedGate}
              onGateSelect={(id) => {
                setSelectedGate(id);
                setSelectedSection(null);
              }}
              viewMode={viewMode}
              pathfinderRoute={pathfinderRoute}
            />
          </div>
          
          {pathfinderRoute && (
            <button 
              onClick={() => setPathfinderRoute(null)}
              className="futuristic-btn"
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                fontSize: '9px',
                padding: '4px 8px',
                borderColor: 'var(--neon-red)',
                color: 'var(--neon-red)'
              }}
            >
              CLEAR PATHFINDER
            </button>
          )}
        </section>

        {/* Right Column: Interaction Sidebar */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: 0 }}>
          
          {activeTab === 'fan' ? (
            <div style={{ display: 'grid', gridTemplateRows: '3fr 2fr', gap: '16px', height: '100%', minHeight: 0 }}>
              
              <div style={{ minHeight: 0 }}>
                <FanAssistant 
                  onMapAction={handleMapAction}
                  onAddCarbonPoints={handleAddCarbonPoints}
                />
              </div>

              <div style={{ minHeight: 0 }}>
                <SustainabilityTracker 
                  carbonPoints={carbonPoints}
                  onAddPoints={handleAddCarbonPoints}
                />
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: 0 }}>
              
              {/* Command Sub Tabs */}
              <div className="glass-panel" style={{ display: 'flex', padding: '6px', background: 'rgba(5, 8, 20, 0.4)' }}>
                <button
                  onClick={() => handleSubTabChange("dashboard")}
                  style={{
                    flex: 1,
                    background: activeSubTab === 'dashboard' ? 'rgba(0, 240, 255, 0.1)' : 'none',
                    border: 'none',
                    color: activeSubTab === 'dashboard' ? 'var(--neon-blue)' : 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    padding: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px'
                  }}
                >
                  TELEMETRY
                </button>
                <button
                  onClick={() => handleSubTabChange("copilot")}
                  style={{
                    flex: 1,
                    background: activeSubTab === 'copilot' ? 'rgba(0, 240, 255, 0.1)' : 'none',
                    border: 'none',
                    color: activeSubTab === 'copilot' ? 'var(--neon-blue)' : 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    padding: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px'
                  }}
                >
                  AI COPILOT
                </button>
                <button
                  onClick={() => handleSubTabChange("incidents")}
                  style={{
                    flex: 1,
                    background: activeSubTab === 'incidents' ? 'rgba(0, 240, 255, 0.1)' : 'none',
                    border: 'none',
                    color: activeSubTab === 'incidents' ? 'var(--neon-blue)' : 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    padding: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px'
                  }}
                >
                  DISPATCHES
                </button>
              </div>

              {/* Dynamic Sub Tab Body */}
              <div style={{ flex: 1, minHeight: 0 }}>
                {activeSubTab === 'dashboard' && (
                  <OpsDashboard 
                    selectedSection={selectedSection}
                    setSelectedSection={setSelectedSection}
                    selectedGate={selectedGate}
                    setSelectedGate={setSelectedGate}
                    setViewMode={setViewMode}
                    setPathfinderRoute={setPathfinderRoute}
                  />
                )}
                {activeSubTab === 'copilot' && (
                  <OpsCopilot 
                    onCopilotAction={handleCopilotAction}
                  />
                )}
                {activeSubTab === 'incidents' && (
                  <IncidentManager 
                    incidents={incidents}
                    setIncidents={setIncidents}
                    onIncidentUpdate={(msg) => {
                      // Append dispatches automatically to dashboard console logs in a clean way
                      console.log(`[DISPATCH] ${msg}`);
                    }}
                    onFocusMapCoordinate={handleMapAction}
                  />
                )}
              </div>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}
