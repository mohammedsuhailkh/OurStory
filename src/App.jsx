import { useEffect, useState } from 'react';

// --- DATABASE SYNC CONFIGURATION ---
// Set your Firebase Realtime Database URL here to enable automatic sync between devices without redeploying.
// Example: "https://your-project-default-rtdb.firebaseio.com/"
// Make sure to add rules enabling read/write in your Firebase Database console.
// If left empty, the site runs purely in browser localStorage and Public/story-config.json.
const FIREBASE_DB_URL = 'https://ourstory-ab025-default-rtdb.firebaseio.com/';

const PASSKEY = '1215';
const POLAROID_STORAGE_KEY = 'story-polaroids';
const ENVELOPE_STORAGE_KEY = 'story-envelopes';

const defaultPolaroids = [
  {
    id: 'default-fire',
    src: import.meta.env.BASE_URL + 'Pics/3d-fire-with-flames.jpg',
    caption: 'First memory',
  },
  {
    id: 'default-chatgpt',
    src: import.meta.env.BASE_URL + 'Pics/ChatGPT%20Image%20Nov%2020%2C%202025%2C%2010_00_01%20AM.png',
    caption: 'A little moment',
  },
  {
    id: 'default-gemini-one',
    src: import.meta.env.BASE_URL + 'Pics/Gemini_Generated_Image_1wd3wc1wd3wc1wd3.png',
    caption: 'Another chapter',
  },
  {
    id: 'default-gemini-two',
    src: import.meta.env.BASE_URL + 'Pics/Gemini_Generated_Image_qi9xn0qi9xn0qi9x.png',
    caption: 'A favorite day',
  },
  {
    id: 'default-gemini-three',
    src: import.meta.env.BASE_URL + 'Pics/Gemini_Generated_Image_xm4fnaxm4fnaxm4f.png',
    caption: 'One more smile',
  },
  {
    id: 'default-kadhakali',
    src: import.meta.env.BASE_URL + 'Pics/KadhakaliREF.png',
    caption: 'To be continued',
  },
];

const defaultEnvelopes = [
  {
    id: 'letter-one',
    title: 'Letter 1',
    message: 'Write the first tiny secret here.',
    style: 'rose',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-two',
    title: 'Letter 2',
    message: 'Write a memory from the start of your story.',
    style: 'sky',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-three',
    title: 'Letter 3',
    message: 'Write something she does that always makes you smile.',
    style: 'mint',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-four',
    title: 'Letter 4',
    message: 'Write a favorite inside joke.',
    style: 'peach',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-five',
    title: 'Letter 5',
    message: 'Write one thing you want to do together.',
    style: 'violet',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-six',
    title: 'Letter 6',
    message: 'Write about a moment you still replay in your head.',
    style: 'lemon',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-seven',
    title: 'Letter 7',
    message: 'Write a promise.',
    style: 'coral',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-eight',
    title: 'Letter 8',
    message: 'Write something you are grateful for.',
    style: 'indigo',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-nine',
    title: 'Letter 9',
    message: 'Write a line that only she will understand.',
    style: 'cream',
    unlockDate: '',
    image: '',
  },
  {
    id: 'letter-ten',
    title: 'Letter 10',
    message: 'Write the ending that feels like a beginning.',
    style: 'charcoal',
    unlockDate: '',
    image: '',
  },
];

const floatingHearts = Array.from({ length: 18 }, (_, index) => ({
  id: `heart-${index}`,
  left: `${(index * 17 + 9) % 100}%`,
  delay: `${index * -0.85}s`,
  duration: `${8 + (index % 5) * 1.6}s`,
  size: `${14 + (index % 4) * 6}px`,
}));

const unlockBurstPieces = Array.from({ length: 72 }, (_, index) => ({
  id: `burst-${index}`,
  delay: `${(index % 6) * 34}ms`,
  size: `${12 + (index % 6) * 5}px`,
  spin: `${index % 2 === 0 ? 1 : -1}`,
  type: index % 3 === 0 || index % 5 === 0 ? 'petal' : 'heart',
})).map((piece, index) => {
  const angle = (-164 + index * 3.75) * (Math.PI / 180);
  const distance = 48 + (index % 9) * 5;

  return {
    ...piece,
    x: `${Math.cos(angle) * distance}vw`,
    y: `${Math.sin(angle) * distance}vh`,
  };
});

function loadPolaroids() {
  const savedPolaroids = localStorage.getItem(POLAROID_STORAGE_KEY);

  if (!savedPolaroids) {
    return defaultPolaroids;
  }

  try {
    const parsedPolaroids = JSON.parse(savedPolaroids);

    if (Array.isArray(parsedPolaroids) && parsedPolaroids.length > 0) {
      return parsedPolaroids;
    }
  } catch {
    localStorage.removeItem(POLAROID_STORAGE_KEY);
  }

  return defaultPolaroids;
}

function loadEnvelopes() {
  const savedEnvelopes = localStorage.getItem(ENVELOPE_STORAGE_KEY);

  if (!savedEnvelopes) {
    return defaultEnvelopes;
  }

  try {
    const parsedEnvelopes = JSON.parse(savedEnvelopes);

    if (Array.isArray(parsedEnvelopes) && parsedEnvelopes.length > 0) {
      return parsedEnvelopes;
    }
  } catch {
    localStorage.removeItem(ENVELOPE_STORAGE_KEY);
  }

  return defaultEnvelopes;
}

function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {floatingHearts.map((heart) => (
        <span
          className="floating-heart"
          style={{
            '--heart-left': heart.left,
            '--heart-delay': heart.delay,
            '--heart-duration': heart.duration,
            '--heart-size': heart.size,
          }}
          key={heart.id}
        />
      ))}
    </div>
  );
}

function UnlockBurst() {
  return (
    <div className="unlock-burst" aria-hidden="true">
      {unlockBurstPieces.map((piece) => (
        <span
          className={`unlock-burst-piece unlock-burst-${piece.type}`}
          style={{
            '--burst-x': piece.x,
            '--burst-y': piece.y,
            '--burst-delay': piece.delay,
            '--burst-size': piece.size,
            '--burst-spin': piece.spin,
          }}
          key={piece.id}
        />
      ))}
    </div>
  );
}

function LockScreen({ onUnlock, isUnlocking }) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [wrongFlash, setWrongFlash] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (passkey === PASSKEY) {
      setError('');
      onUnlock();
      return;
    }

    setError('Hey u are wrong 😾');
    setWrongFlash(false);
    window.setTimeout(() => setWrongFlash(true), 0);
    window.setTimeout(() => {
      setError('');
      setWrongFlash(false);
    }, 1300);
    setPasskey('');
  }

  return (
    <main className={`lock-page ${wrongFlash ? 'wrong-flash' : ''}`}>
      <FloatingHearts />
      {isUnlocking && <UnlockBurst />}
      <div className="lock-content">
        <img
          className="lock-placeholder-image"
          src={import.meta.env.BASE_URL + 'lock-placeholder.png'}
          alt=""
          aria-hidden="true"
        />
        <section className="lock-box" aria-labelledby="lock-title">
          <div className="lock-icon" aria-hidden="true">
            LOCK
          </div>
          <h1 id="lock-title">Enter Passkey</h1>
          <form onSubmit={handleSubmit} className="lock-form">
            <input
              type="password"
              inputMode="numeric"
              value={passkey}
              onChange={(event) => setPasskey(event.target.value)}
              placeholder="Passkey"
              aria-label="Passkey"
            />
            <button type="submit" disabled={isUnlocking}>
              {isUnlocking ? 'Opening...' : 'Unlock'}
            </button>
          </form>
          {error && (
            <div className="wrong-pass-popup" role="alert">
              {error}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function HomePage({ polaroids, envelopes, setPolaroids, setEnvelopes }) {
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === POLAROID_STORAGE_KEY) {
        setPolaroids(loadPolaroids());
      }

      if (event.key === ENVELOPE_STORAGE_KEY) {
        setEnvelopes(loadEnvelopes());
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setPolaroids, setEnvelopes]);

  return (
    <main className="home-page">
      <FloatingHearts />
      <section className="home-hero">
        <div className="home-heading">
          <h1>Test Heading</h1>
        </div>

        <div className="photo-scroll" aria-label="Photo stack">
          {polaroids.map((photo, index) => (
            <article
              className="polaroid-card"
              style={{ '--stack-index': index }}
              key={photo.id}
            >
              <img src={photo.src} alt={photo.caption || `Story photo ${index + 1}`} />
              {photo.caption && <p>{photo.caption}</p>}
            </article>
          ))}
        </div>
      </section>

      <LetterSection envelopes={envelopes} />
    </main>
  );
}

function LetterCountdown({ targetDate, onUnlock }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function updateTimer() {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) {
        setTimeLeft('');
        if (onUnlock) onUnlock();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${String(minutes).padStart(2, '0')}m`);
      parts.push(`${String(seconds).padStart(2, '0')}s`);

      setTimeLeft(parts.join(' '));
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onUnlock]);

  return (
    <div className="countdown-display">
      <span className="countdown-time">{timeLeft || 'Unlocking...'}</span>
    </div>
  );
}

function LockedEnvelopeModal({ envelope, onClose, onUnlock }) {
  return (
    <div className="locked-modal-backdrop" onClick={onClose}>
      <div className="locked-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="locked-modal-close" onClick={onClose}>×</button>
        <div className="locked-modal-icon">🔒</div>
        <h2>Patience, love...</h2>
        <p className="locked-modal-intro">This letter is not ready to be opened yet.</p>
        
        <LetterCountdown targetDate={envelope.unlockDate} onUnlock={() => {
          if (onUnlock) onUnlock();
          onClose();
        }} />
        
        <div className="locked-modal-details">
          <span className="locked-title">{envelope.title}</span>
          <span className="locked-date-label">Unlocks on:</span>
          <span className="locked-date-value">
            {new Date(envelope.unlockDate).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function LetterSection({ envelopes }) {
  const [openEnvelopeId, setOpenEnvelopeId] = useState(null);
  const [shakingEnvelopeId, setShakingEnvelopeId] = useState(null);
  const [activeLockedEnvelope, setActiveLockedEnvelope] = useState(null);
  const [tick, setTick] = useState(0);

  function checkIfLocked(unlockDateStr) {
    if (!unlockDateStr) return false;
    const unlockDate = new Date(unlockDateStr);
    return !isNaN(unlockDate.getTime()) && unlockDate > new Date();
  }

  function toggleEnvelope(envelope) {
    const isLocked = checkIfLocked(envelope.unlockDate);
    if (isLocked) {
      setShakingEnvelopeId(envelope.id);
      window.setTimeout(() => {
        setShakingEnvelopeId(null);
      }, 600);
      setActiveLockedEnvelope(envelope);
      return;
    }
    setOpenEnvelopeId(openEnvelopeId === envelope.id ? null : envelope.id);
  }

  function handleUnlock() {
    setTick((t) => t + 1);
  }

  return (
    <section className="letter-section" aria-labelledby="letter-title">
      <div className="letter-heading">
        <h2 id="letter-title">Open When...</h2>
        <p>Swipe through the letters and open each one.</p>
      </div>

      <div className="envelope-carousel" aria-label="Love letters">
        {envelopes.map((envelope, index) => {
          const isOpen = openEnvelopeId === envelope.id;
          const isShaking = shakingEnvelopeId === envelope.id;

          return (
            <button
              className={`envelope-card envelope-${envelope.style} ${isOpen ? 'is-open' : ''} ${isShaking ? 'is-shaking' : ''}`}
              style={{ '--float-index': index }}
              type="button"
              onClick={() => toggleEnvelope(envelope)}
              key={envelope.id}
            >
              <span className="envelope-title">{envelope.title}</span>
              <span className="envelope-shape" aria-hidden="true">
                <span className="envelope-flap" />
                <span className="envelope-side envelope-side-left" />
                <span className="envelope-side envelope-side-right" />
                <span className="envelope-letter" />
              </span>
              <span className="love-note-popup">
                <span className="note-heart note-heart-one" aria-hidden="true">
                  ♥
                </span>
                <span className="note-heart note-heart-two" aria-hidden="true">
                  ♥
                </span>
                <span className="note-lines" aria-hidden="true" />
                <div className="love-note-content-scroll">
                  <span className="love-note-text">{envelope.message}</span>
                </div>
                {envelope.image && (
                  <span className="hanging-polaroid">
                    <span className="hanging-line-left" />
                    <span className="hanging-line-right" />
                    <span className="hanging-polaroid-frame">
                      <img src={envelope.image} alt="Hanging Memory" />
                    </span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {activeLockedEnvelope && (
        <LockedEnvelopeModal
          envelope={activeLockedEnvelope}
          onClose={() => setActiveLockedEnvelope(null)}
          onUnlock={handleUnlock}
        />
      )}
    </section>
  );
}

function AdminPage({ polaroids, envelopes, setPolaroids, setEnvelopes, syncStatus, syncError, onSync, isFirebaseConfigured }) {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  function exportConfiguration() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ polaroids, envelopes }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "story-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function savePolaroids(nextPolaroids) {
    setPolaroids(nextPolaroids);
    localStorage.setItem(POLAROID_STORAGE_KEY, JSON.stringify(nextPolaroids));
  }

  function saveEnvelopes(nextEnvelopes) {
    setEnvelopes(nextEnvelopes);
    localStorage.setItem(ENVELOPE_STORAGE_KEY, JSON.stringify(nextEnvelopes));
  }

  function handleAdminLogin(event) {
    event.preventDefault();

    if (passkey === PASSKEY) {
      setIsAdminUnlocked(true);
      setError('');
      return;
    }

    setError('Incorrect admin passkey');
    setPasskey('');
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const nextPhoto = {
        id: crypto.randomUUID(),
        src: reader.result,
        caption: '',
      };

      savePolaroids([...polaroids, nextPhoto]);
      setError('');
      event.target.value = '';
    };

    reader.onerror = () => {
      setError('Could not read that image');
    };

    reader.readAsDataURL(file);
  }

  function updateCaption(photoId, caption) {
    savePolaroids(
      polaroids.map((photo) => (photo.id === photoId ? { ...photo, caption } : photo))
    );
  }

  function removePhoto(photoId) {
    savePolaroids(polaroids.filter((photo) => photo.id !== photoId));
  }

  function resetPhotos() {
    localStorage.removeItem(POLAROID_STORAGE_KEY);
    setPolaroids(defaultPolaroids);
  }

  function updateEnvelope(envelopeId, field, value) {
    saveEnvelopes(
      envelopes.map((envelope) =>
        envelope.id === envelopeId ? { ...envelope, [field]: value } : envelope
      )
    );
  }

  function resetEnvelopes() {
    localStorage.removeItem(ENVELOPE_STORAGE_KEY);
    setEnvelopes(defaultEnvelopes);
  }

  if (!isAdminUnlocked) {
    return (
      <main className="admin-page">
        <section className="admin-login" aria-labelledby="admin-title">
          <h1 id="admin-title">Secret Admin</h1>
          <form onSubmit={handleAdminLogin} className="lock-form">
            <input
              type="password"
              inputMode="numeric"
              value={passkey}
              onChange={(event) => setPasskey(event.target.value)}
              placeholder="Admin passkey"
              aria-label="Admin passkey"
            />
            <button type="submit">Enter</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-panel">
        <div className="admin-header">
          <div>
            <h1>Story Admin</h1>
            <p>Add photos, captions, and envelope messages.</p>
          </div>
          <div className="admin-header-actions">
            {isFirebaseConfigured ? (
              <button
                type="button"
                className={`admin-sync-button ${syncStatus}`}
                disabled={syncStatus === 'syncing'}
                onClick={() => onSync(polaroids, envelopes)}
              >
                {syncStatus === 'syncing' ? '🔄 Syncing...' :
                 syncStatus === 'success' ? '✅ Synced to Cloud!' :
                 syncStatus === 'error' ? '❌ Sync Error!' : '☁️ Save & Sync to Cloud'}
              </button>
            ) : (
              <button type="button" className="admin-export-button" onClick={exportConfiguration}>
                📥 Export Story Config
              </button>
            )}
            <a href="/" className="admin-view-link">View Story</a>
          </div>
        </div>

        {isFirebaseConfigured ? (
          <div className="admin-export-tip database-connected">
            <span className="admin-tip-icon">☁️</span>
            <p>
              Your page is connected to Firebase! Click <strong>Save & Sync to Cloud</strong> to push changes instantly. 
              Anyone visiting your site will immediately see updates without you needing to rebuild or redeploy.
            </p>
          </div>
        ) : (
          <div className="admin-export-tip">
            <span className="admin-tip-icon">💡</span>
            <p>
              Your changes are saved automatically to your browser's local storage.
              To make them permanent for all visitors, click <strong>Export Story Config</strong> and replace the <code>Public/story-config.json</code> file in your project directory with the downloaded file.
            </p>
          </div>
        )}

        {isFirebaseConfigured && syncStatus === 'error' && (
          <div className="admin-sync-error-banner">
            ⚠️ Sync Error: {syncError || 'Could not save to Firebase. Check your console log or database rules.'}
          </div>
        )}

        <section className="admin-envelope-editor" aria-labelledby="envelope-admin-title">
          <div className="admin-section-heading">
            <div>
              <h2 id="envelope-admin-title">Envelope Messages</h2>
              <p>Type the title and message that should appear inside each envelope.</p>
            </div>
            <button type="button" className="reset-button" onClick={resetEnvelopes}>
              Reset Letters
            </button>
          </div>

          <div className="admin-envelope-list">
            {envelopes.map((envelope, index) => (
              <article className="admin-envelope-card" key={envelope.id}>
                <span className={`admin-envelope-preview envelope-${envelope.style}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="admin-envelope-fields">
                  <div className="admin-envelope-row">
                    <label>
                      Title
                      <input
                        type="text"
                        value={envelope.title || ''}
                        onChange={(event) => updateEnvelope(envelope.id, 'title', event.target.value)}
                        placeholder="Letter title"
                      />
                    </label>
                    <label>
                      Unlock Date & Time
                      <input
                        type="datetime-local"
                        value={envelope.unlockDate || ''}
                        onChange={(event) => updateEnvelope(envelope.id, 'unlockDate', event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-envelope-row">
                    <label>
                      Message
                      <textarea
                        value={envelope.message || ''}
                        onChange={(event) => updateEnvelope(envelope.id, 'message', event.target.value)}
                        placeholder="Write the message"
                        rows="4"
                      />
                    </label>
                    <div className="admin-envelope-image-section">
                      <span className="admin-envelope-image-label">Hanging Polaroid Image</span>
                      {envelope.image ? (
                        <div className="admin-envelope-image-preview">
                          <img src={envelope.image} alt="Hanging preview" />
                          <button
                            type="button"
                            className="remove-envelope-image-btn"
                            onClick={() => updateEnvelope(envelope.id, 'image', '')}
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <label className="upload-box upload-box-small">
                          <span>Upload Polaroid</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              if (!file.type.startsWith('image/')) {
                                alert('Please upload an image file');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                updateEnvelope(envelope.id, 'image', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-photo-editor" aria-labelledby="photo-admin-title">
          <div className="admin-section-heading">
            <div>
              <h2 id="photo-admin-title">Polaroid Photos</h2>
              <p>Upload photos and write the captions shown below each polaroid.</p>
            </div>
            <button type="button" className="reset-button" onClick={resetPhotos}>
              Reset To Test Photos
            </button>
          </div>

        <label className="upload-box">
          <span>Upload Photo</span>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </label>

        {error && <p className="error-message">{error}</p>}

        <div className="admin-photo-list">
          {polaroids.map((photo, index) => (
            <article className="admin-photo-card" key={photo.id}>
              <img src={photo.src} alt={photo.caption || `Uploaded photo ${index + 1}`} />
              <label>
                Caption
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(event) => updateCaption(photo.id, event.target.value)}
                  placeholder="Write a caption"
                />
              </label>
              <button type="button" onClick={() => removePhoto(photo.id)}>
                Remove
              </button>
            </article>
          ))}
        </div>
        </section>
      </section>
    </main>
  );
}

export default function App() {
  const [polaroids, setPolaroids] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [syncStatus, setSyncStatus] = useState(''); // '', 'syncing', 'success', 'error'
  const [syncError, setSyncError] = useState('');
  const isAdminPage = window.location.pathname.endsWith('/secretadmin') || window.location.search.includes('page=secretadmin');

  const getFirebaseUrl = () => {
    if (!FIREBASE_DB_URL) return '';
    let url = FIREBASE_DB_URL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    if (!url.endsWith('/')) {
      url += '/';
    }
    return url + 'story.json';
  };

  useEffect(() => {
    const dbUrl = getFirebaseUrl();
    if (dbUrl) {
      fetch(dbUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Database response error');
          return res.json();
        })
        .then((data) => {
          if (data && (data.polaroids || data.envelopes)) {
            // Load custom config from Firebase
            setPolaroids(data.polaroids || []);
            setEnvelopes(data.envelopes || []);
            setIsLoading(false);
          } else {
            // Seed new empty database from public/story-config.json
            fetch(import.meta.env.BASE_URL + 'story-config.json')
              .then((res) => res.json())
              .then((configData) => {
                const initPolaroids = configData.polaroids && configData.polaroids.length > 0 ? configData.polaroids : defaultPolaroids;
                const initEnvelopes = configData.envelopes && configData.envelopes.length > 0 ? configData.envelopes : defaultEnvelopes;
                
                fetch(dbUrl, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ polaroids: initPolaroids, envelopes: initEnvelopes })
                })
                .then(() => {
                  setPolaroids(initPolaroids);
                  setEnvelopes(initEnvelopes);
                  setIsLoading(false);
                })
                .catch((e) => {
                  console.error('Failed to seed Firebase:', e);
                  setPolaroids(initPolaroids);
                  setEnvelopes(initEnvelopes);
                  setIsLoading(false);
                });
              })
              .catch(() => {
                // Seed fallback with defaults if public config is missing
                fetch(dbUrl, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ polaroids: defaultPolaroids, envelopes: defaultEnvelopes })
                }).then(() => {
                  setPolaroids(defaultPolaroids);
                  setEnvelopes(defaultEnvelopes);
                  setIsLoading(false);
                });
              });
          }
        })
        .catch((err) => {
          console.error('Firebase fetch failed, falling back to local files:', err);
          loadFromLocalFiles();
        });
    } else {
      loadFromLocalFiles();
    }

    function loadFromLocalFiles() {
      fetch(import.meta.env.BASE_URL + 'story-config.json')
        .then((res) => {
          if (!res.ok) throw new Error('No config found');
          return res.json();
        })
        .then((data) => {
          const localEnvelopes = localStorage.getItem(ENVELOPE_STORAGE_KEY);
          const localPolaroids = localStorage.getItem(POLAROID_STORAGE_KEY);

          const defaultNormalizedPolaroids = data.polaroids && data.polaroids.length > 0 ? data.polaroids : defaultPolaroids;
          const defaultNormalizedEnvelopes = data.envelopes && data.envelopes.length > 0 ? data.envelopes : defaultEnvelopes;

          const loadedPolaroids = localPolaroids ? JSON.parse(localPolaroids) : defaultNormalizedPolaroids;
          const loadedEnvelopes = localEnvelopes ? JSON.parse(localEnvelopes) : defaultNormalizedEnvelopes;

          setPolaroids(loadedPolaroids);
          setEnvelopes(loadedEnvelopes);
          setIsLoading(false);
        })
        .catch(() => {
          const localEnvelopes = localStorage.getItem(ENVELOPE_STORAGE_KEY);
          const localPolaroids = localStorage.getItem(POLAROID_STORAGE_KEY);

          setPolaroids(localPolaroids ? JSON.parse(localPolaroids) : defaultPolaroids);
          setEnvelopes(localEnvelopes ? JSON.parse(localEnvelopes) : defaultEnvelopes);
          setIsLoading(false);
        });
    }
  }, []);

  function syncWithDatabase(updatedPolaroids, updatedEnvelopes) {
    const dbUrl = getFirebaseUrl();
    if (!dbUrl) return;

    setSyncStatus('syncing');
    setSyncError('');

    fetch(dbUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polaroids: updatedPolaroids, envelopes: updatedEnvelopes })
    })
    .then((res) => {
      if (!res.ok) throw new Error('Database sync failed');
      setSyncStatus('success');
      window.setTimeout(() => setSyncStatus(''), 2500);
    })
    .catch((err) => {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message);
      window.setTimeout(() => setSyncStatus(''), 4000);
    });
  }

  function handleUnlock() {
    setIsUnlocking(true);
    window.setTimeout(() => {
      setIsUnlocked(true);
    }, 1250);
  }

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <p>Loading your story...</p>
      </div>
    );
  }

  if (isAdminPage) {
    return (
      <AdminPage
        polaroids={polaroids}
        envelopes={envelopes}
        setPolaroids={setPolaroids}
        setEnvelopes={setEnvelopes}
        syncStatus={syncStatus}
        syncError={syncError}
        onSync={syncWithDatabase}
        isFirebaseConfigured={!!FIREBASE_DB_URL}
      />
    );
  }

  return isUnlocked ? (
    <HomePage
      polaroids={polaroids}
      envelopes={envelopes}
      setPolaroids={setPolaroids}
      setEnvelopes={setEnvelopes}
    />
  ) : (
    <LockScreen isUnlocking={isUnlocking} onUnlock={handleUnlock} />
  );
}
