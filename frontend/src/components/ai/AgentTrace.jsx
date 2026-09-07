import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';

const TOOL_LABELS = {
  get_price_board: { en: 'Checked live price board', hi: 'लाइव भाव देखा', mr: 'थेट दर पाहिले', icon: '💰' },
  estimate_scrap_value: { en: 'Ran ML valuation model', hi: 'एआई मॉडल से कीमत लगाई', mr: 'एआय मॉडेलने किंमत काढली', icon: '🧮' },
  find_recyclers: { en: 'Looked up recyclers', hi: 'रिसाइक्लर खोजे', mr: 'रिसायकलर शोधले', icon: '🏭' },
  get_my_impact: { en: 'Read your impact record', hi: 'आपका प्रभाव देखा', mr: 'तुमचा परिणाम पाहिला', icon: '🌱' },
  get_loyalty_balance: { en: 'Checked your points', hi: 'आपके पॉइंट देखे', mr: 'तुमचे पॉइंट पाहिले', icon: '🎁' },
  get_my_lots: { en: 'Read your lots', hi: 'आपके लॉट देखे', mr: 'तुमचे लॉट पाहिले', icon: '📦' },
  schedule_ewaste_pickup: { en: 'Booked a pickup', hi: 'पिकअप बुक किया', mr: 'पिकअप बुक केले', icon: '🚚' }
};

function label(tool, lang) {
  const entry = TOOL_LABELS[tool];
  if (!entry) return { text: tool, icon: '🔧' };
  return { text: entry[lang] ?? entry.en, icon: entry.icon };
}

/** The tools the agent ran for one reply — collapsed by default. */
export function AgentSteps({ steps, lang }) {
  const [open, setOpen] = useState(false);
  if (!steps?.length) return null;

  return (
    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#64748B',
          fontSize: '0.7rem',
          fontWeight: 800,
          cursor: 'pointer'
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Wrench size={11} />
        <span>
          {lang === 'hi'
            ? `${steps.length} स्रोत जांचे`
            : lang === 'mr'
              ? `${steps.length} स्रोत तपासले`
              : `Checked ${steps.length} source${steps.length > 1 ? 's' : ''}`}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {steps.map((step, idx) => {
            const { text, icon } = label(step.tool, lang);
            return (
              <div
                key={`${step.tool}_${idx}`}
                style={{
                  backgroundColor: '#F1F5F9',
                  borderRadius: '10px',
                  padding: '6px 8px',
                  fontSize: '0.7rem',
                  color: '#475569'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F172A' }}>
                  {icon} {text}
                </div>
                <pre
                  style={{
                    margin: '3px 0 0',
                    fontSize: '0.64rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    color: '#64748B',
                    maxHeight: '90px',
                    overflowY: 'auto'
                  }}
                >
                  {JSON.stringify(step.result, null, 1)}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * The agent can read freely but never writes without a tap: anything that
 * changes the user's account stops here first.
 */
export function AgentConfirm({ action, lang, onApprove, onDecline, busy }) {
  if (!action) return null;

  const { text, icon } = label(action.tool, lang);
  const yes = lang === 'hi' ? 'हाँ, करें' : lang === 'mr' ? 'होय, करा' : 'Yes, do it';
  const no = lang === 'hi' ? 'रहने दें' : lang === 'mr' ? 'नको' : 'Cancel';
  const title = lang === 'hi' ? 'पुष्टि करें' : lang === 'mr' ? 'खात्री करा' : 'Confirm this action';

  return (
    <div
      style={{
        margin: '0 14px 10px',
        padding: '12px',
        borderRadius: '14px',
        backgroundColor: '#FFFBEB',
        border: '1.5px solid #FCD34D'
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#92400E', marginBottom: '4px' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#78350F', fontWeight: 600, marginBottom: '10px' }}>
        {action.summary || text}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onApprove}
          disabled={busy}
          className="btn-press"
          style={{
            flex: 1,
            padding: '9px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: busy ? '#CBD5E1' : '#16A34A',
            color: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: 900,
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          {yes}
        </button>
        <button
          onClick={onDecline}
          disabled={busy}
          className="btn-press"
          style={{
            padding: '9px 16px',
            borderRadius: '12px',
            border: '1.5px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#475569',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          {no}
        </button>
      </div>
    </div>
  );
}
