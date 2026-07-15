import React, { useState, useEffect } from 'react';
import { STADIUM_SECTIONS, GATES } from '../utils/mockData';

export default function OpsDashboard({ 
  selectedSection, 
  setSelectedSection,
  selectedGate, 
  setSelectedGate,
  setViewMode,
  setPathfinderRoute
}) {
  const [attendance, setAttendance] = useState(12430);
  const [systemLogs, setSystemLogs] = useState([
    { time: '21:35:12', msg: 'System Boot complete. WebGL 3D Canvas loaded.', type: 'info' },
    { time: '21:36:04', msg: 'Gate B sensor reporting slow flow (98 fans/min).', type: 'warning' },
    { time: '21:37:20', msg: 'Metro Line 1 dispatched extra express carriages.', type: 'info' }
  ]);

  // Simulate active attendance count fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setAttendance(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Simulate logs feed
  useEffect(() => {
    const logPool = [
      { msg: 'AI Eco-bin #14 emptied (compostable waste 42kg).', type: 'info' },
      { msg: 'Decibel limits reached 92dB in East Stand.', type: 'info' },
      { msg: 'Transit Line 4 running with optimal headways.', type: 'info' },
      { msg: 'Water Station Sec 108: 140 liters dispensed.', type: 'info' },
      { msg: 'Gate C scanner latency spike (0.8s) resolved.', type: 'info' }
    ];

    const timer = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const now = new Date().toLocaleTimeString([], { hour12: false });
      setSystemLogs(prev => [
        { time: now, msg: randomLog.msg, type: randomLog.type },
        ...prev.slice(0, 9) // Keep last 10 logs
      ]);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const handleDeployStaff = (targetName) => {
    const now = new Date().toLocaleTimeString([], { hour12: false });
    setSystemLogs(prev => [
      { time: now, msg: `ALERT: Dispatched tactical staff to ${targetName}.`, type: 'action' },
      ...prev
    ]);
    alert(`Deploying support personnel to ${targetName} immediately.`);
  };

  const handleRerouteGateB = () => {
    const now = new Date().toLocaleTimeString([], { hour12: false });
    setSystemLogs(prev => [
      { time: now, msg: `TRAFFIC: Overriding outer fences. Rerouting Gate B -> Gate A.`, type: 'action' },
      ...prev
    ]);
    setPathfinderRoute({ from: 'B', to: '101' }); // Set route in 3D map from Gate B to North Section
    alert("Triggered gate-congestion rerouting on physical screens & AI Fan apps.");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', height: '100%' }}>
      {/* Top telemetry row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        
        {/* Attendance card */}
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>ATTENDANCE RATE</div>
          <div className="telemetry neon-text-blue" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {attendance.toLocaleString()}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(0,240,255,0.4)', marginTop: '2px' }}>CAPACITY: 15,000 (83%)</div>
        </div>

        {/* Decibel level */}
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>NOISE LEVEL</div>
          <div className="telemetry neon-text-amber" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            88.4 <span style={{ fontSize: '14px' }}>dB</span>
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,204,0,0.4)', marginTop: '2px' }}>CRITICAL LIMIT: 105dB</div>
        </div>

        {/* Green travel */}
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>GREEN TRANSIT</div>
          <div className="telemetry neon-text-green" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            82.6%
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(0,255,136,0.4)', marginTop: '2px' }}>TARGET METRIC: 75%</div>
        </div>

        {/* Incidents Count */}
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>ACTIVE ISSUES</div>
          <div className="telemetry neon-text-red" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            3
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,59,48,0.4)', marginTop: '2px' }}>2 HIGH URGENCY</div>
        </div>
      </div>

      {/* Selected Node Inspector */}
      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(10, 20, 45, 0.4)' }}>
        <h3 className="neon-text-blue" style={{ fontSize: '14px', marginBottom: '12px', letterSpacing: '1px' }}>
          OBJECT INSPECTOR
        </h3>

        {!selectedSection && !selectedGate ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            Click on any Stand or entrance Gate tower in the 3D view to inspect its live data.
          </div>
        ) : selectedSection ? (
          // Stand Inspector
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                {STADIUM_SECTIONS[selectedSection].name}
              </span>
              <button 
                onClick={() => setSelectedSection(null)}
                style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              >
                CLOSE
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>SECTOR OCCUPANCY</div>
                <div className="telemetry" style={{ fontWeight: 'bold', color: STADIUM_SECTIONS[selectedSection].occupancy > 0.92 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                  {Math.round(STADIUM_SECTIONS[selectedSection].occupancy * 100)}% ({STADIUM_SECTIONS[selectedSection].capacity} seats)
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>WC QUEUE DELAYS</div>
                <div className="telemetry" style={{ fontWeight: 'bold' }}>
                  {STADIUM_SECTIONS[selectedSection].queueRestroom} mins
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>FOOD CONCESSIONS</div>
                <div className="telemetry" style={{ fontWeight: 'bold' }}>
                  {STADIUM_SECTIONS[selectedSection].queueConcession} mins queue
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>ACCESSIBILITY PATHS</div>
                <div className="telemetry" style={{ fontWeight: 'bold', color: 'var(--neon-blue)' }}>
                  {STADIUM_SECTIONS[selectedSection].accessElevator} (Active)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleDeployStaff(`Section ${selectedSection}`)}
                className="futuristic-btn" 
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                DEPLOY VOLUNTEERS
              </button>
              <button 
                onClick={() => setPathfinderRoute({ from: 'A', to: selectedSection })}
                className="futuristic-btn green" 
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                TRACE ROUTE FROM GATE A
              </button>
            </div>
          </div>
        ) : (
          // Gate Inspector
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                {GATES[selectedGate].name}
              </span>
              <button 
                onClick={() => setSelectedGate(null)}
                style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              >
                CLOSE
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>QUEUE TIME</div>
                <div className="telemetry" style={{ fontWeight: 'bold', color: GATES[selectedGate].status === 'Congested' ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                  {GATES[selectedGate].waitTime} mins
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>FLOW RATE</div>
                <div className="telemetry" style={{ fontWeight: 'bold' }}>
                  {GATES[selectedGate].flowRate} fans / minute
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>GATE STATUS</div>
                <div className="telemetry" style={{ fontWeight: 'bold', color: GATES[selectedGate].status === 'Congested' ? 'var(--neon-red)' : 'var(--neon-blue)' }}>
                  {GATES[selectedGate].status.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>ACCESSIBLE ENTRANCE</div>
                <div className="telemetry" style={{ fontWeight: 'bold', color: 'var(--neon-green)' }}>
                  {selectedGate === 'B' ? 'Stairs only (Elevator bypass adjacent)' : 'Ramps Active'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedGate === 'B' ? (
                <button 
                  onClick={handleRerouteGateB}
                  className="futuristic-btn" 
                  style={{ fontSize: '11px', padding: '6px 12px', borderColor: 'var(--neon-amber)', color: 'var(--neon-amber)' }}
                >
                  REROUTE TO GATE A
                </button>
              ) : (
                <button 
                  onClick={() => handleDeployStaff(`Gate ${selectedGate}`)}
                  className="futuristic-btn" 
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  DEPLOY GATE STAFF
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* System Logs console */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="neon-text-green" style={{ fontSize: '12px', marginBottom: '8px', letterSpacing: '1px' }}>
          SYSTEM LOG TELEMETRY (LIVE)
        </h3>
        <div style={{
          flex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          background: 'rgba(5, 8, 20, 0.7)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          borderRadius: '4px',
          padding: '8px 12px',
          height: '115px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {systemLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>[{log.time}]</span>
              <span style={{ 
                color: log.type === 'warning' ? 'var(--neon-amber)' : 
                       log.type === 'action' ? 'var(--neon-blue)' : '#8bb2d9' 
              }}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
