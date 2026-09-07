import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { MessageSquare, ThumbsUp } from 'lucide-react';

export default function CommunityPreview() {
  const { t, getLangText } = useLanguage();
  const { communityPosts, setActiveTab } = useAppData();

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🗣️ {t('communityFeed')}
        </h2>
        <button
          onClick={() => setActiveTab('community')}
          style={{
            background: 'none', border: 'none',
            fontSize: '0.8rem', fontWeight: 800,
            color: 'var(--primary-accent)', cursor: 'pointer'
          }}
        >
          {t('viewAll')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {communityPosts.slice(0, 2).map(post => (
          <div
            key={post.id}
            onClick={() => setActiveTab('community')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-neutral)',
              border: '1px solid var(--divider-hairline)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={post.avatar}
                  alt={getLangText(post.author)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {getLangText(post.author)}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    📍 {getLangText(post.location)} • {getLangText(post.timeAgo)}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
              "{getLangText(post.audioText)}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
