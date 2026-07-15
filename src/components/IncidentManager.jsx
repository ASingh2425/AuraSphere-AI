import React, { useState, useEffect } from 'react';

export default function IncidentManager({ incidents, setIncidents, onIncidentUpdate, onFocusMapCoordinate }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Auto-resolve simulation for "In Progress" incidents
  useEffect(() => {
    const timer = setInterval(() => {
      setIncidents(prev => 
        prev.map(inc => {
          if (inc.status === 'In Progress' && Math.random() > 0.6) {
            return { ...inc, status: 'Resolved', assignedTo: inc.assignedTo + " (Completed)" };
          }
          return inc;
        })
      );
    }, 12000);

    return () => clearInterval(timer);
  }, [setIncidents]);

  const handleAssignVolunteer = (incId, volunteerName) => {
    setIncidents(prev => 
      prev.map(inc => {
        if (inc.id === incId) {
          return { ...inc, status: 'In Progress', assignedTo: volunteerName };
        }
        return inc;
      })
    );
    
    if (onIncidentUpdate) {
      onIncidentUpdate(`Dispatch: Assigned ${volunteerName} to incident ${incId}`);
    }

    setSelectedIncident(null);
  };

  const handleIncidentSelect = (inc) => {
    setSelectedIncident(inc);
    
    // Focus stadium map to the incident area
    if (inc.location.toLowerCase().includes('section')) {
      const match = inc.location.match(/\b(10[1-9]|110|20[1-9]|210)\b/);
      if (match) {
        onFocusMapCoordinate({ type: 'FOCUS_SECTION', sectionId: match[0] });
      }
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return 'neon-text-red';
      case 'Medium': return 'neon-text-amber';
      default: return 'neon-text-blue';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%', minHeight: '400px' }}>
      
      {/* Left: Queue Grid */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="neon-text-blue" style={{ fontSize: '14px', marginBottom: '12px', letterSpacing: '1px' }}>
          INCIDENT QUEUE
        </h3>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '340px'
        }}>
          {incidents.map((inc) => (
            <div 
              key={inc.id}
              onClick={() => handleIncidentSelect(inc)}
              style={{
                background: selectedIncident?.id === inc.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedIncident?.id === inc.id ? '1px solid var(--neon-blue)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '4px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                if (selectedIncident?.id !== inc.id) {
                  e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedIncident?.id !== inc.id) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span className={`telemetry ${getUrgencyColor(inc.urgency)}`} style={{ fontWeight: 'bold', fontSize: '11px' }}>
                    [{inc.urgency.toUpperCase()}]
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{inc.title}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  📍 {inc.location} • {inc.reportedBy}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="telemetry" style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  background: inc.status === 'Resolved' ? 'rgba(0,255,136,0.15)' : 
                              inc.status === 'In Progress' ? 'rgba(0,240,255,0.15)' : 'rgba(255,204,0,0.15)',
                  color: inc.status === 'Resolved' ? 'var(--neon-green)' : 
                         inc.status === 'In Progress' ? 'var(--neon-blue)' : 'var(--neon-amber)',
                  border: `1px solid ${
                    inc.status === 'Resolved' ? 'rgba(0,255,136,0.3)' : 
                    inc.status === 'In Progress' ? 'rgba(0,240,255,0.3)' : 'rgba(255,204,0,0.3)'
                  }`
                }}>
                  {inc.status}
                </span>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                  {inc.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Dispatch Console / AI Insights */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', background: 'rgba(10,20,40,0.3)' }}>
        <h3 className="neon-text-green" style={{ fontSize: '12px', marginBottom: '12px', letterSpacing: '1px' }}>
          AI DISPATCH RECOMMENDER
        </h3>

        {selectedIncident ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>INCIDENT DETAILS</div>
              <h4 style={{ color: '#fff', fontSize: '16px', margin: '2px 0 6px 0' }}>{selectedIncident.title}</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>
                {selectedIncident.description}
              </p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                GENAI SUGGESTED SOP (STANDARD OPERATING PROTOCOLS)
              </div>
              <ul style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                borderRadius: '4px',
                padding: '10px 10px 10px 24px',
                fontSize: '12px',
                color: 'var(--neon-blue)',
                lineHeight: '1.5'
              }}>
                {selectedIncident.resolutionSteps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>

            {selectedIncident.status === 'Pending' ? (
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                  AVAILABLE LOCAL DISPATCH VOLUNTEERS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={() => handleAssignVolunteer(selectedIncident.id, "Volunteer Carlos (Sector 104)")}
                    className="futuristic-btn green" 
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    DEPLOY CARLOS (Sec 104)
                  </button>
                  <button 
                    onClick={() => handleAssignVolunteer(selectedIncident.id, "Volunteer Sarah (Sec 102 Bypass)")}
                    className="futuristic-btn green" 
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    DEPLOY SARAH (Sec 102)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ 
                marginTop: 'auto', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: '4px', 
                padding: '12px', 
                fontSize: '12px',
                textAlign: 'center'
              }}>
                <div>Assigned to: <strong style={{ color: 'var(--neon-blue)' }}>{selectedIncident.assignedTo}</strong></div>
                <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Volunteer is tracking response steps. Simulation is running.
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'rgba(255,255,255,0.3)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            Select an incident from the queue on the left. The GenAI Dispatch engine will analyze location, pull specific SOP guides, and identify nearest available volunteers.
          </div>
        )}
      </div>

    </div>
  );
}
