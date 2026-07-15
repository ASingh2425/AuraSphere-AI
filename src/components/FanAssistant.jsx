import React, { useState, useRef, useEffect } from 'react';
import { simulateStreamingResponse } from '../utils/aiEngine';

export default function FanAssistant({ onMapAction, onAddCarbonPoints }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am AuraSphere, your GenAI Stadium Companion. I can guide you to your seat, show accessibility routes, recommend eco-friendly travel, or find food stations. What language would you prefer?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'en'
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presetQuestions = {
    en: [
      { text: "Where is Section 104?", query: "Section 104" },
      { text: "Find wheelchair access", query: "Wheelchair access elevator routes" },
      { text: "Nearest vegan food?", query: "Where is vegetarian food?" },
      { text: "How to earn green rewards?", query: "How to earn eco points?" }
    ],
    es: [
      { text: "¿Dónde está la Sección 104?", query: "Seccion 104" },
      { text: "Ruta de silla de ruedas", query: "silla de ruedas" },
      { text: "Comida vegetariana", query: "comida vegetariana" },
      { text: "Ganar puntos verdes", query: "puntos de carbono" }
    ],
    fr: [
      { text: "Où se trouve la Section 104?", query: "Section 104" },
      { text: "Accès fauteuil roulant", query: "fauteuil roulant" },
      { text: "Nourriture végétarienne", query: "nourriture végétarienne" },
      { text: "Gagner des points verts", query: "points de carbone" }
    ]
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Call simulated GenAI response streaming
    simulateStreamingResponse(textToSend, 'fan', (chunk) => {
      if (chunk.done) {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: chunk.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        
        // Execute map action if returned
        if (chunk.action) {
          onMapAction(chunk.action);
        }

        // Gamified check: if user asked about sustainability, reward them!
        if (textToSend.toLowerCase().includes('carbon') || textToSend.toLowerCase().includes('points') || textToSend.toLowerCase().includes('recycle') || textToSend.toLowerCase().includes('eco')) {
          onAddCarbonPoints(15);
        }
      }
    });
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 240, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulsing-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--neon-blue)' }}>AURASPHERE COMPANION</span>
        </div>

        {/* Language selector */}
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: '#0a1024',
            color: 'var(--neon-blue)',
            border: '1px solid var(--border-color)',
            padding: '4px 8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            borderRadius: '3px'
          }}
        >
          <option value="en">ENGLISH</option>
          <option value="es">ESPAÑOL</option>
          <option value="fr">FRANÇAIS</option>
        </select>
      </div>

      {/* Message history */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontSize: '13px',
        maxHeight: '320px'
      }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.sender === 'user' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: msg.sender === 'user' ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '10px 14px',
              lineHeight: '1.45',
              boxShadow: msg.sender === 'user' ? '0 0 10px rgba(0,240,255,0.05)' : 'none'
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            <div style={{ 
              fontSize: '9px', 
              color: 'rgba(255,255,255,0.3)', 
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              marginTop: '4px',
              fontFamily: 'var(--font-mono)'
            }}>
              {msg.timestamp}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px 12px 12px 2px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--neon-blue)', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }} />
            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--neon-blue)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.2s' }} />
            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--neon-blue)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pills */}
      <div style={{
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        borderTop: '1px solid rgba(0,240,255,0.05)',
        background: 'rgba(5, 8, 20, 0.3)'
      }}>
        {presetQuestions[language].map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pq.query)}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--neon-blue)';
              e.target.style.color = '#fff';
              e.target.style.background = 'rgba(0, 240, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(0, 240, 255, 0.1)';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              e.target.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            {pq.text}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px'
      }}>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputText); }}
          placeholder="Ask AuraSphere about navigation, gates, food..."
          style={{
            flex: 1,
            background: 'rgba(5, 8, 20, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: '#fff',
            padding: '10px 14px',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'var(--font-sans)'
          }}
        />
        <button 
          onClick={() => handleSendMessage(inputText)}
          className="futuristic-btn"
          style={{ padding: '10px 20px', fontSize: '12px' }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
