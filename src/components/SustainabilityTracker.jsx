import React, { useState } from 'react';

export default function SustainabilityTracker({ carbonPoints, onAddPoints }) {
  const [loggedActions, setLoggedActions] = useState([]);
  
  const actionsList = [
    { id: 'act-transit', title: 'Took Metro Line 1 to Gate A', points: 50, icon: '🚇' },
    { id: 'act-recycle', title: 'Recycled cup in AI Eco-Bin', points: 30, icon: '♻️' },
    { id: 'act-water', title: 'Refilled bottle at Aura Fountain', points: 20, icon: '🥤' }
  ];

  const vouchers = [
    { name: 'VIP 3D Camera Access Pass', targetPoints: 40, desc: 'Unlock access to exclusive 360° pitch side web cams.' },
    { name: 'Free Concession Snack Cup', targetPoints: 60, desc: 'Complimentary plant-based snack at Green Pitch bowls.' },
    { name: '20% FIFA Merch Store Discount', targetPoints: 100, desc: 'Discount code applicable at any official stadium kiosk.' }
  ];

  const handleLogAction = (action) => {
    // Check if already logged to prevent infinite spamming in demo
    if (loggedActions.includes(action.id)) {
      alert("This green action has already been logged for this match.");
      return;
    }

    setLoggedActions(prev => [...prev, action.id]);
    onAddPoints(action.points);

    // Play synthesis coin chime
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {}
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%', minHeight: '400px' }}>
      
      {/* Left: Action logger & carbon points indicator */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="neon-text-green" style={{ fontSize: '14px', marginBottom: '12px', letterSpacing: '1px' }}>
          FAN ECO-LOG
        </h3>

        {/* Score indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(0, 255, 136, 0.04)',
          border: '1px solid rgba(0, 255, 136, 0.15)',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '32px' }}>🌱</div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>YOUR CARBON OFFSET SCORE</div>
            <div className="telemetry neon-text-green" style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {carbonPoints} <span style={{ fontSize: '14px', color: '#fff' }}>pts</span>
            </div>
          </div>
        </div>

        {/* Log list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
            REPORT ECO-FRIENDLY ACTIONS:
          </div>
          {actionsList.map(act => {
            const isLogged = loggedActions.includes(act.id);
            return (
              <div 
                key={act.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  padding: '10px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span>{act.icon}</span>
                  <span style={{ color: isLogged ? 'rgba(255,255,255,0.4)' : '#fff' }}>{act.title}</span>
                </div>
                <button
                  onClick={() => handleLogAction(act)}
                  disabled={isLogged}
                  className="futuristic-btn green"
                  style={{
                    fontSize: '10px',
                    padding: '4px 10px',
                    background: isLogged ? 'rgba(255,255,255,0.02)' : 'rgba(0, 255, 136, 0.05)',
                    borderColor: isLogged ? 'rgba(255,255,255,0.1)' : 'var(--neon-green)',
                    color: isLogged ? 'rgba(255,255,255,0.3)' : 'var(--neon-green)',
                    cursor: isLogged ? 'default' : 'pointer'
                  }}
                >
                  {isLogged ? "LOGGED" : `+${act.points} PTS`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Reward Vouchers Progress */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', background: 'rgba(10,25,30,0.3)' }}>
        <h3 className="neon-text-blue" style={{ fontSize: '12px', marginBottom: '12px', letterSpacing: '1px' }}>
          ECO-REWARDS CATALOG
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {vouchers.map((v, idx) => {
            const isUnlocked = carbonPoints >= v.targetPoints;
            const progressPercent = Math.min((carbonPoints / v.targetPoints) * 100, 100);

            return (
              <div 
                key={idx}
                style={{
                  background: isUnlocked ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                  border: isUnlocked ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  padding: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Progress bar inside row */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '2px',
                  backgroundColor: isUnlocked ? 'var(--neon-blue)' : 'rgba(255,255,255,0.1)',
                  width: `${progressPercent}%`,
                  transition: 'width 0.5s ease-out'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '13px', 
                    color: isUnlocked ? 'var(--neon-blue)' : '#fff' 
                  }}>
                    {v.name}
                  </span>
                  
                  <span className="telemetry" style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    color: isUnlocked ? 'var(--neon-green)' : 'rgba(255,255,255,0.5)'
                  }}>
                    {isUnlocked ? 'UNLOCKED' : `${carbonPoints}/${v.targetPoints} PTS`}
                  </span>
                </div>
                
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.3' }}>
                  {v.desc}
                </p>

                {isUnlocked && (
                  <button 
                    onClick={() => alert(`Here is your reward coupon: FIFA-GREEN-${v.targetPoints}-X89`)}
                    className="futuristic-btn" 
                    style={{ fontSize: '9px', padding: '3px 8px', marginTop: '6px' }}
                  >
                    CLAIM COUPON
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
