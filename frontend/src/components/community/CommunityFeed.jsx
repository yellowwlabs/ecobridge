import React, { useState } from 'react';
import ModalShell from '../common/ModalShell';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Mic, Heart, MessageSquare, Plus, X } from 'lucide-react';
import RecyclerDirectory from './RecyclerDirectory';

export default function CommunityFeed() {
  const { t, getLangText } = useLanguage();
  const { communityPosts, setCommunityPosts } = useAppData();
  const [activeSubTab, setActiveSubTab] = useState('feed'); // 'feed' | 'directory'

  // Voice recorder modal state
  const [isRecording, setIsRecording] = useState(false);
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // General Create Post modal state (+)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [postTag, setPostTag] = useState('#rates');
  const [postPhotoUrl, setPostPhotoUrl] = useState('');

  const handleStartRecord = () => {
    setIsRecording(true);
    let sec = 0;
    const interval = setInterval(() => {
      sec++;
      setRecordingTime(sec);
      if (sec >= 10) {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 1000);
  };

  const handlePublishVoiceNote = () => {
    const newPost = {
      id: `post_${Date.now()}`,
      author: { hi: 'राजू कबाड़ीवाला', mr: 'राजू कबाडीवाला', en: 'Raju (Collector)' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      location: { hi: 'ओखला Phase 2', mr: 'ओखला Phase 2', en: 'Okhla Phase 2' },
      timeAgo: { hi: 'अभी-अभी', mr: 'आत्ताच', en: 'Just now' },
      audioDuration: `0:${recordingTime < 10 ? '0' + recordingTime : recordingTime}`,
      audioText: {
        hi: 'आज ओखला यार्ड में तांबे का बहुत अच्छा भाव मिला!',
        mr: 'आज ओखला यार्डमध्ये तांब्याचा उत्तम भाव मिळाला!',
        en: 'Got great rates for copper at Okhla yard today!'
      },
      likes: 1,
      commentsCount: 0
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setShowRecorderModal(false);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleCreateTextPostSubmit = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: `post_${Date.now()}`,
      author: { hi: 'राजू कबाड़ीवाला', mr: 'राजू कबाडीवाला', en: 'Raju (Collector)' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      location: { hi: 'ओखला Phase 2', mr: 'ओखला Phase 2', en: 'Okhla Phase 2' },
      timeAgo: { hi: 'अभी-अभी', mr: 'आत्ताच', en: 'Just now' },
      audioDuration: 'Text Post',
      audioText: {
        hi: `${postText} ${postTag}`,
        mr: `${postText} ${postTag}`,
        en: `${postText} ${postTag}`
      },
      photo: postPhotoUrl || null,
      likes: 1,
      commentsCount: 0
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setShowCreatePostModal(false);
    setPostText('');
    setPostPhotoUrl('');
  };

  if (activeSubTab === 'directory') {
    return <RecyclerDirectory onSwitchTab={() => setActiveSubTab('feed')} />;
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Top Header with (+) Add Post Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-deep)', margin: 0 }}>
          💬 {t('communityFeed')}
        </h2>

        <button
          onClick={() => setShowCreatePostModal(true)}
          className="btn-press"
          style={{
            backgroundColor: 'var(--primary-accent)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Sub tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveSubTab('feed')}
          style={{
            flex: 1, minHeight: '40px', borderRadius: '12px', border: 'none',
            backgroundColor: activeSubTab === 'feed' ? 'var(--primary-accent)' : 'var(--bg-neutral)',
            color: activeSubTab === 'feed' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
          }}
        >
          🗣️ {t('communityFeed')}
        </button>
        <button
          onClick={() => setActiveSubTab('directory')}
          style={{
            flex: 1, minHeight: '40px', borderRadius: '12px', border: 'none',
            backgroundColor: activeSubTab === 'directory' ? 'var(--primary-accent)' : 'var(--bg-neutral)',
            color: activeSubTab === 'directory' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
          }}
        >
          🏢 {t('nearbyRecyclers')}
        </button>
      </div>

      {/* Voice / Text Posts Feed */}
      {communityPosts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 16px',
          backgroundColor: 'var(--surface-white)',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎙️</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {t('noVoiceNotesTitle')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {t('noVoiceNotesSub')}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setShowRecorderModal(true)}
              className="btn-press"
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              🎙️ {t('createVoicePost')}
            </button>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="btn-press"
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-neutral)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              ➕ Add Text Post
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {communityPosts.map(post => (
            <div key={post.id} className="card-hover" style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-white)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={post.avatar} alt={getLangText(post.author)} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{getLangText(post.author)}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📍 {getLangText(post.location)} • {getLangText(post.timeAgo)}</span>
                  </div>
                </div>

                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-accent)', backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '3px 8px', borderRadius: '8px' }}>
                  {post.audioDuration.includes('Text') ? '📝 Text Post' : `🎙️ ${post.audioDuration}`}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '10px', backgroundColor: 'var(--bg-neutral)', padding: '10px', borderRadius: '10px', lineHeight: 1.4 }}>
                "{getLangText(post.audioText)}"
              </p>

              {post.photo && (
                <div className="photo-mount" style={{ height: '140px', marginBottom: '10px', borderRadius: '10px' }}>
                  <img src={post.photo} alt="Post Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <Heart size={16} color="var(--signal-red)" /> {post.likes}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <MessageSquare size={16} /> {post.commentsCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice Recorder Dialog Modal */}
      <ModalShell isOpen={showRecorderModal} onClose={() => setShowRecorderModal(false)} zIndex={1000}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '24px', background: 'var(--surface-white)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-deep)', marginBottom: '12px' }}>
            🎙️ {t('voiceComposerTitle')}
          </h3>

          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: isRecording ? 'var(--signal-red)' : 'var(--primary-accent)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px auto', cursor: 'pointer'
          }} onClick={handleStartRecord} className={isRecording ? 'mic-pulse' : ''}>
            <Mic size={40} />
          </div>

          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {isRecording ? `${t('recordingStatus')} 0:${recordingTime < 10 ? '0' + recordingTime : recordingTime}` : t('tapMicPrompt')}
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowRecorderModal(false)}
              style={{ flex: 1, minHeight: '44px', borderRadius: '12px', border: '1px solid var(--divider-hairline)', background: 'none', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handlePublishVoiceNote}
              style={{ flex: 1, minHeight: '44px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary-accent)', color: '#FFFFFF', fontWeight: 800 }}
            >
              {t('postButton')}
            </button>
          </div>
        </div>
      </ModalShell>

      {/* (+) Create Text / Photo Post Modal */}
      <ModalShell isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} zIndex={1100}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px', backgroundColor: 'var(--surface-white)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              ➕ Create Community Post
            </h3>
            <button onClick={() => setShowCreatePostModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateTextPostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Post Message *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Share rate updates, yard news, or scrap tips..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.92rem', resize: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Tag / Topic
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['#rates', '#copper', '#ewaste', '#yard_update', '#general'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPostTag(tag)}
                    style={{
                      padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                      backgroundColor: postTag === tag ? 'var(--primary-accent)' : 'var(--bg-neutral)',
                      color: postTag === tag ? '#FFFFFF' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)', cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Photo Attachment URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={postPhotoUrl}
                onChange={(e) => setPostPhotoUrl(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-press"
              style={{
                width: '100%',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Publish Post
            </button>
          </form>
        </div>
      </ModalShell>
    </div>
  );
}
