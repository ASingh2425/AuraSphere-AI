import React, { useState } from 'react';
import { simulateStreamingResponse } from '../utils/aiEngine';

export default function OpsCopilot({ onCopilotAction }) {
  const [query, setQuery] = useState("");
  const [reasoningLogs, setReasoningLogs] = useState([]);
  const [broadcastDraft, setBroadcastDraft] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const executeCommand = (cmdText) => {
    if (!cmdText.trim()) return;

    setIsProcessing(true);
    setQuery(cmdText);
    setReasoningLogs([]);
    setBroadcastDraft("");
    setActionItems([]);
    
    simulateStreamingResponse(cmdText, 'ops', (chunk) => {
      if (chunk.reasoning) {
        setReasoningLogs(chunk.reasoning);
      }

      if (chunk.done) {
        setIsProcessing(false);
        if (chunk.actionItem) {
          setActionItems(chunk.actionItem.recommendations || []);
          setBroadcastDraft(chunk.actionItem.broadcastText || "");
          onCopilotAction(chunk.actionItem);
        }
      }
    });
  };

  const handleBroadcast = () => {
    if (!broadcastDraft) return;
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.15); // C#5
      osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.3); // E5
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {}

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(broadcastDraft);
      
      const txt = broadcastDraft.toLowerCase();
      if (txt.includes('atencion') || txt.includes('puerta') || txt.includes('evacuación')) {
        utterance.lang = 'es-ES';
      } else if (txt.includes('attention') || txt.includes('porte')) {
        utterance.lang = 'fr-FR';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }

    alert(`BROADCASTING MULTI-LINGUAL PUBLIC NOTICE:\n\n${broadcastDraft}`);
    setBroadcastDraft("");
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', padding: '16px' }} role="region" aria-label="AuraSphere Operations AI Copilot Console">
      <h3 className="neon-text-blue" style={{ fontSize: '14px', marginBottom: '12px', letterSpacing: '1px' }}>
        GENAI OPERATIONS COPILOT
      </h3>

      {/* Input query bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') executeCommand(query); }}
          placeholder="Ask Copilot (e.g. 'Analyze Gate B congestion', 'Weather warning', 'Evacuate South Stand')"
          aria-label="Operations copilot query input box"
          style={{
            flex: 1,
            background: 'rgba(5, 8, 20, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: '#fff',
            padding: '10px 14px',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            outline: 'none'
          }}
        />
        <button 
          onClick={() => executeCommand(query)}
          className="futuristic-btn"
          disabled={isProcessing}
          aria-label="Submit command simulation"
          style={{ fontSize: '11px', padding: '10px 16px' }}
        >
          {isProcessing ? "PROCESSING..." : "SIMULATE"}
        </button>
      </div>

      {/* Preset Scenario Simulator Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button 
          onClick={() => executeCommand("Simulate Gate B Congestion")} 
          className="futuristic-btn" 
          style={{ fontSize: '10px', padding: '4px 8px', borderStyle: 'dashed' }}
          disabled={isProcessing}
          aria-label="Simulate Gate B congestion drill"
        >
          GATE B JAM
        </button>
        <button 
          onClick={() => executeCommand("Rain weather warning")} 
          className="futuristic-btn" 
          style={{ fontSize: '10px', padding: '4px 8px', borderStyle: 'dashed' }}
          disabled={isProcessing}
          aria-label="Simulate storm alert drill"
        >
          STORM PROTOCOL
        </button>
        <button 
          onClick={() => executeCommand("Evacuate East Stand")} 
          className="futuristic-btn" 
          style={{ fontSize: '10px', padding: '4px 8px', borderStyle: 'dashed', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}
          disabled={isProcessing}
          aria-label="Simulate East Stand evacuation drill"
        >
          EAST STAND EVAC
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: '180px' }}>
        
        {/* Left: AI Reasoning Logs Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            AI REASONING LOG (CHAIN OF THOUGHT)
          </div>
          <div style={{
            flex: 1,
            background: '#02040a',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            borderRadius: '4px',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--neon-green)',
            overflowY: 'auto',
            height: '160px',
            lineHeight: '1.4'
          }} aria-live="assertive" aria-label="AI reasoning logs console display">
            {isProcessing && reasoningLogs.length === 0 ? (
              <div style={{ animation: 'pulse-glow 1s infinite' }}>[Thinking...] Accessing cognitive routes and sensor matrices...</div>
            ) : reasoningLogs.length > 0 ? (
              reasoningLogs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#fff' }}>▶</span> {log}
                </div>
              ))
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.2)' }}>Console idle. Submit a query to trigger reasoning.</div>
            )}
          </div>
        </div>

        {/* Right: Actions & Audio Drafts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Action Checklists */}
          {actionItems.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>RECOMMENDED ACTION PROTOCOL</div>
              <div style={{
                background: 'rgba(5, 8, 20, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {actionItems.map((item, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ marginTop: '2px' }} aria-label={`Complete task: ${item}`} />
                    <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Broadcast Draft Card */}
          {broadcastDraft && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>AUTOMATED BROADCAST DRAFT</div>
              <div className="glass-panel" style={{
                flex: 1,
                padding: '10px',
                fontSize: '11px',
                background: 'rgba(255, 59, 48, 0.05)',
                border: '1px solid rgba(255, 59, 48, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.95)', fontStyle: 'italic', lineHeight: '1.3' }}>
                  "{broadcastDraft}"
                </div>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={handleBroadcast}
                    className="futuristic-btn" 
                    aria-label="Transmit spoken announcement draft"
                    style={{ fontSize: '9px', padding: '4px 8px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)', background: 'rgba(255, 59, 48, 0.1)' }}
                  >
                    TRANSMIT ANNOUNCEMENT
                  </button>
                </div>
              </div>
            </div>
          )}

          {!broadcastDraft && !isProcessing && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              textAlign: 'center',
              padding: '12px'
            }}>
              Actions and broadcast notifications will be drafted automatically by GenAI depending on the scenario.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
