import React, { useState, useEffect, useRef } from 'react';
import ModalShell from './ModalShell';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Mic, X, Send, Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/voiceAssistant';
import { api } from '../../utils/apiClient';

export default function VoiceModal() {
  const { lang, t } = useLanguage();
  const { voiceModalOpen, setVoiceModalOpen, activeTx } = useAppData();

  const [aiInputText, setAiInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef(null);

  const getGreetingText = () => {
    if (lang === 'hi') {
      return 'नमस्ते! मैं आपका इकोब्रिज एआई असिस्टेंट हूँ। तांबे का भाव, बैटरी सुरक्षा, या कबाड़ स्कैन करने के लिए बोलें या टैप करें।';
    } else if (lang === 'mr') {
      return 'नमस्कार! मी तुमचा इकोब्रिज एआई सहाय्यक आहे. तांब्याचा भाव, बॅटरी सुरक्षा, किंवा कबाड स्कॅन करण्यासाठी बोला किंवा टॅप करा.';
    }
    return 'Hello! I am your EcoBridge AI Assistant. You can ask about copper rates, battery safety, or scan material — just speak or tap!';
  };

  const [aiMessages, setAiMessages] = useState([]);

  // Auto greet aloud when modal opens
  useEffect(() => {
    if (voiceModalOpen) {
      const initialGreeting = getGreetingText();
      setAiMessages([
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Speak greeting aloud out of the box
      setTimeout(() => {
        speakText(initialGreeting, lang);
        setIsSpeaking(true);
      }, 300);

      // Initiate AI session telemetry if active
      api.startAiCall({ lot_id: activeTx?.lot_id || null, recycler_id: 'rec_01' })
        .then(res => setSessionId(res.id))
        .catch(err => console.warn('AI Call API fallback:', err));
    } else {
      stopSpeaking();
      setIsSpeaking(false);
    }
  }, [voiceModalOpen, lang]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiProcessing]);

  /**
   * Gemini 2.5 Flash Backend Query Integration Point
   */
  const callGeminiFlashSLM = async (userPrompt) => {
    try {
      const res = await api.queryAi(userPrompt, lang, { lot_id: activeTx?.lot_id });
      if (res && res.response) {
        return res.response;
      }
      throw new Error('No response returned from AI Proxy');
    } catch (err) {
      console.warn('[Gemini 2.5 Flash Proxy Fallback]:', err.message);
      if (lang === 'hi') {
        return 'एआई सहायक अभी उपलब्ध नहीं है — कृपया कुछ क्षण बाद पुनः प्रयास करें।';
      } else if (lang === 'mr') {
        return 'एआय सहाय्यक सध्या उपलब्ध नाही — कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.';
      }
      return 'AI Assistant is temporarily unavailable — try again in a moment.';
    }
  };

  const handleSendPrompt = async (promptText, spoken = false) => {
    const text = promptText || aiInputText;
    if (!text.trim() || isAiProcessing) return;

    // Stop previous speaking
    stopSpeaking();

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInputText('');
    setIsAiProcessing(true);

    try {
      const responseText = await callGeminiFlashSLM(text.trim());
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, aiMsg]);
      
      // Speak audio response aloud automatically (Voice-first principle)
      speakText(responseText, lang);
      setIsSpeaking(true);
    } catch (err) {
      console.warn('Gemini 2.5 Flash SLM invocation error:', err);
      const fallbackText = lang === 'hi' 
        ? 'एआई सहायक अभी उपलब्ध नहीं है — कृपया थोड़ी देर में प्रयास करें।' 
        : 'AI Assistant is temporarily unavailable — try again in a moment.';
      setAiMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  };


  const handleSuggestionClick = (cmdText) => {
    handleSendPrompt(cmdText);
  };

  const handleSpeakOptionsAloud = () => {
    stopSpeaking();
    const optionsText = lang === 'hi' 
      ? 'आप पूछ सकते हैं: कॉपर रेट, बैटरी सुरक्षा, या फोटो स्कैन स्क्रैप। नीचे दिए बटन दबाएं या बोलें।'
      : lang === 'mr'
      ? 'तुम्ही विचारू शकता: तांब्याचा दर, बॅटरी सुरक्षा, किंवा फोटो स्कॅन स्क्रॅप.'
      : 'You can ask about copper rates, battery safety, or photo scan material. Speak or tap below!';
    speakText(optionsText, lang);
    setIsSpeaking(true);
  };

  const toggleMicListening = () => {
    stopSpeaking();
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const samplePrompts = lang === 'hi'
          ? ['आज तांबे का भाव क्या है?', 'बैटरी सुरक्षा के नियम बताओ', 'मुश्किल कबाड़ कैसे बेचें?']
          : lang === 'mr'
          ? ['आज तांब्याचा दर काय आहे?', 'बॅटरी सुरक्षितता सांगा', 'स्क्रॅप कसे विकावे?']
          : ['What is today copper scrap rate?', 'Battery safety guidelines', 'How to scan scrap?'];
        const chosen = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
        handleSendPrompt(chosen, true);
      }, 2400);
    }
  };

  const handleReListen = (text) => {
    stopSpeaking();
    speakText(text, lang);
    setIsSpeaking(true);
  };

  const handleClose = async () => {
    stopSpeaking();
    if (sessionId) {
      try {
        await api.endAiCall(sessionId);
      } catch (err) {
        console.warn('End AI call error:', err);
      }
    }
    setVoiceModalOpen(false);
  };

  return (
    <ModalShell isOpen={voiceModalOpen} onClose={handleClose} maxWidth="480px" zIndex={1000}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '560px',
        maxHeight: '86vh',
        backgroundColor: 'var(--surface-white, #FFFFFF)',
        borderRadius: '24px',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--primary-deep, #0F172A)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                EcoBridge Voice Assistant 🎙️
              </h3>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, color: '#94A3B8' }}>
                Voice-First Accessibility • EcoBridge AI Assistant
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Voice Controller Card (Voice-First Centerpiece for Low-Literacy Users) */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--primary-deep, #0F172A)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
        }}>
          {/* Prominent Large One-Tap-To-Speak Mic Button */}
          <button
            onClick={toggleMicListening}
            className={`btn-press ${isListening ? 'mic-pulse' : ''}`}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: isListening ? '#EF4444' : '#3B82F6',
              color: '#FFFFFF',
              border: '4px solid rgba(255, 255, 255, 0.25)',
              boxShadow: isListening ? '0 0 25px rgba(239, 68, 68, 0.8)' : '0 0 20px rgba(59, 130, 246, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Tap to speak"
          >
            <Mic size={34} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isListening ? '#FCA5A5' : '#60A5FA', display: 'block' }}>
              {isListening 
                ? (lang === 'hi' ? 'सुन रहा हूँ... बोलिए' : lang === 'mr' ? 'ऐकत आहे... बोला' : 'Listening... Speak now')
                : (lang === 'hi' ? 'बोलने के लिए माइक दबाएं' : lang === 'mr' ? 'बोलण्यासाठी मायक्रोफोन दाबा' : 'Tap Mic to Speak')}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              {lang === 'hi' ? 'आवाज द्वारा पूरी मदद • जवाब बोलकर सुनाया जाएगा' : lang === 'mr' ? 'आवाजाने मदत • उत्तर बोलून दाखवले जाईल' : 'Voice interaction • All responses spoken aloud'}
            </span>
          </div>
        </div>

        {/* Suggestion Chips with Icons & Listen Options Speaker Button */}
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#F1F5F9',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={handleSpeakOptionsAloud}
            className="btn-press"
            title="Read options aloud"
            style={{
              padding: '6px 10px',
              borderRadius: '14px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Volume2 size={15} />
            <span>{lang === 'hi' ? 'ऑप्शन सुनें' : lang === 'mr' ? 'पर्याय ऐका' : 'Listen Options'}</span>
          </button>

          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory'
          }}>
            {[
              { icon: '💰', label: lang === 'hi' ? 'कॉपर भाव' : lang === 'mr' ? 'तांबे दर' : 'Copper Rates', prompt: t('voiceCmd1') || 'Get Copper Rates' },
              { icon: '🔋', label: lang === 'hi' ? 'बैटरी सुरक्षा' : lang === 'mr' ? 'बॅटरी नियम' : 'Battery Safety', prompt: t('voiceCmd2') || 'Battery Safety Guidelines' },
              { icon: '📸', label: lang === 'hi' ? 'फोटो स्कैन' : lang === 'mr' ? 'फोटो स्कॅन' : 'Scan Scrap', prompt: t('voiceCmd3') || 'AI Material Scan' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(chip.prompt)}
                className="btn-press"
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: '1.5px solid #3B82F6',
                  backgroundColor: '#FFFFFF',
                  color: '#1E40AF',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  scrollSnapAlign: 'start'
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Listening Waveform Bar */}
        {isListening && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '18px' }}>
              <span className="wave-bar bar-1" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-3" />
              <span className="wave-bar bar-4" />
              <span className="wave-bar bar-5" />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#DC2626' }}>
              {lang === 'hi' ? 'माइक चालू है... बोलिए' : lang === 'mr' ? 'मायक्रोफोन चालू आहे... बोला' : 'Microphone Listening...'}
            </span>
          </div>
        )}

        {/* Conversational Stream with Speaker Icon for every AI message */}
        <div style={{
          flex: 1,
          padding: '14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#F8FAFC'
        }}>
          {aiMessages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '86%',
                padding: '12px 14px',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.sender === 'user' ? '#3B82F6' : '#FFFFFF',
                color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                position: 'relative'
              }}>
                {msg.sender === 'ai' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    paddingBottom: '4px',
                    borderBottom: '1px solid #F1F5F9'
                  }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> EcoBridge AI
                    </span>
                    <button
                      onClick={() => handleReListen(msg.text)}
                      className="btn-press"
                      title="Re-play spoken audio"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '3px 8px',
                        color: '#3B82F6',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Volume2 size={13} />
                      <span>{lang === 'hi' ? 'फिर सुनें' : lang === 'mr' ? 'पुन्हा ऐका' : 'Listen'}</span>
                    </button>
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.45, fontWeight: 500 }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: '0.68rem',
                  opacity: 0.75,
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isAiProcessing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <RefreshCw className="animate-spin" size={16} color="#3B82F6" />
                AI Assistant processing & synthesizing speech...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Footer (Text as Visually Secondary) */}
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Secondary Prompt Text Input */}
          <input
            type="text"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            placeholder={lang === 'hi' ? 'या यहाँ लिखकर पूछें (वैकल्पिक)...' : lang === 'mr' ? 'किंवा येथे लिहून विचारू शकता...' : 'Or type query here (optional)...'}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '20px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendPrompt()}
            disabled={!aiInputText.trim() || isAiProcessing}
            className="btn-press"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: aiInputText.trim() ? '#3B82F6' : '#CBD5E1',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: aiInputText.trim() ? 'pointer' : 'not-allowed',
              flexShrink: 0
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

