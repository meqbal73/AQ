// ─────────────────────────────────────────────────────────────
// Shared Firestore data layer with STANDALONE FALLBACK.
// If firebaseConfig is not configured, we just use SEED_DATA
// directly so the public page renders without any setup.
// ─────────────────────────────────────────────────────────────

const SEED_DATA = {
  profile: {
    name: 'Abdullelah Mohammed Moqbail',
    title: 'Information Technology Student | King Abdulaziz University',
    uni: 'King Abdulaziz University',
    major: 'Information Technology',
    gpa: '4.54', grad: '2027', exp: '2',
    tag: 'Seeking Summer Training 2026',
    bio: 'Senior Information Technology student at King Abdulaziz University with experience in software development, databases, and IT solutions. Currently seeking a Summer Training to apply my skills and gain industry experience.',
    about: 'Senior Information Technology student at King Abdulaziz University with experience in software development, databases, and IT solutions. Currently seeking a Summer Training to apply my skills and gain industry experience.'
  },
  certs: [
    {name: 'Data Analysis', org: 'King Abdulaziz University', date: '2024', icon: '📊', link: 'https://drive.google.com/file/d/1I4tr59AUyH1mvGu3gUytHi6ohCMR_0LJ/view?usp=drive_link'},
    {name: 'How Does a Student Innovate?', org: 'King Abdulaziz University', date: '2024', icon: '💡', link: 'https://drive.google.com/file/d/1XgCGp9xEm_YJPGmX0cE3I7CZewvno9JC/view?usp=drive_link'},
    {name: 'Certificate of Excellence', org: 'King Abdulaziz University', date: '2026', icon: '🏆', link: 'https://drive.google.com/file/d/1-_hzS92nD033O3JYv8f7g-OP1F5KVh8b/view?usp=drive_link'},
    {name: 'Certificate of Excellence', org: 'King Abdulaziz University', date: '2024', icon: '🏆', link: 'https://drive.google.com/file/d/1fxKFUSudIv38knG6RSOS4_4qFiySyhQH/view?usp=drive_link'},
    {name: 'A successful coach in the age of AI', org: 'Empowerment and Vision for Training and Consulting', date: '2025', icon: '🏆', link: 'https://drive.google.com/file/d/1eWhRPvIy1dt9wSOzZRMUKLwmFMQtvIWu/view?usp=drive_link'},
    {name: 'Introduction to Software Testing', org: 'Simplilearn', date: '2025', icon: '💻', link: 'https://www.simplilearn.com/skillup-certificate-landing?token=eyJjb3Vyc2VfaWQiOiI0NDcwIiwiY2VydGlmaWNhdGVfdXJsIjoiaHR0cHM6XC9cL2NlcnRpZmljYXRlcy5zaW1wbGljZG4ubmV0XC9zaGFyZVwvOTA2NDIxOV85NDM0MTA3MTc1OTA4NzQ3MjYzMi5wbmciLCJ1c2VybmFtZSI6IkFiZHVsZWxhaCBtb2hhbW1lZCBtb3FiaWwifQ&utm_source=shared-certificate&utm_medium=app_lms&utm_campaign=shared-certificate-promotion'}
  ],
  skills: [
    {category: 'Programming', items: ['Java', 'Python', 'JavaScript']},
    {category: 'Database', items: ['MySQL', 'Database Design']},
    {category: 'Development', items: ['React', 'HTML', 'CSS']},
    {category: 'Networking', items: ['Computer Networks', 'Network Fundamentals']},
    {category: 'Concepts', items: ['OOP', 'Data Structures']},
    {category: 'Other', items: ['UI/UX Prototyping', 'Data Analysis']}
  ],
  langs: [
    {name: 'Arabic', val: 4, level: 'Native / Mother Tongue'},
    {name: 'English', val: 1, level: 'Beginner'}
  ],
  exps: [
    {title: 'Crowd Management & Rapid Intervention Organizer', org: 'SAR (Saudi Railway Company)', from: 'Jun 2026', to: 'Jun 2026',
     desc: 'Managed crowd control and rapid intervention operations, ensuring safety and organization for large volumes of attendees.'},
    {title: 'Logistics & Operations Associate', org: 'MARN Platform (Amazon) — Jeddah', from: 'May 2025', to: 'Jun 2026',
     desc: 'Utilized smart devices, scanning apps, and barcode technology to sort and track products. Applied "5S" methodologies. Managed shipment packing, loading, and unloading. Received a certificate of excellence for outstanding work performance.'},
    {title: 'Event Organizer & Security Guard', org: 'SELLA Security Guards Company — Ramadan Season', from: 'Mar 2024', to: 'Apr 2024',
     desc: 'Coordinated crowd control and ensured a safe and smooth experience for a large volume of attendees and tourists. Demonstrated strong communication skills in a fast-paced environment.'}
  ],
  contacts: [
    {type: 'email', icon: '📧', label: 'Email', val: 'amoqbil0833@gmail.com'},
    {type: 'phone', icon: '📱', label: 'Phone', val: '+966546850833'},
    {type: 'other', icon: '🔗', label: 'WhatsApp', val: 'https://wa.me/966546850833'},
    {type: 'linkedin', icon: '💼', label: 'LinkedIn', val: 'https://www.linkedin.com/in/abdullelah-moqbil-18992b324'}
  ]
};

// Detect whether firebaseConfig has been filled in by the user.
function firebaseConfigured() {
  try {
    if (typeof firebaseConfig === 'undefined') return false;
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('YOUR_')) return false;
    if (!firebaseConfig.projectId || firebaseConfig.projectId.startsWith('YOUR_')) return false;
    return true;
  } catch { return false; }
}

let db = null, auth = null, PORTFOLIO_DOC = null;

if (typeof firebase !== 'undefined' && firebaseConfigured()) {
  // ── Live Firebase mode ──
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  PORTFOLIO_DOC = db.collection('portfolio').doc('main');
}

/**
 * Live-subscribe to the single portfolio document.
 * If Firebase isn't configured, immediately returns SEED_DATA and never fires again.
 */
function subscribeToPortfolio(onData, onError) {
  if (!PORTFOLIO_DOC) {
    // Standalone mode — just emit the seed data once.
    setTimeout(() => onData(SEED_DATA), 50);
    return () => {};
  }
  return PORTFOLIO_DOC.onSnapshot(
    (snap) => onData(snap.exists ? snap.data() : null),
    (err) => { console.error('Firestore read error:', err); if (onError) onError(err); }
  );
}

/** Overwrite the whole document (used for section-level saves). */
function savePortfolio(partialData) {
  if (!PORTFOLIO_DOC) {
    console.warn('savePortfolio: Firebase not configured — running in standalone mode.');
    return Promise.reject(new Error('Firebase not configured'));
  }
  return PORTFOLIO_DOC.set(partialData, { merge: true });
}

/** Create the document with starter content, but only if it doesn't exist yet. */
async function seedIfEmpty() {
  if (!PORTFOLIO_DOC) {
    console.warn('seedIfEmpty: Firebase not configured.');
    return false;
  }
  const snap = await PORTFOLIO_DOC.get();
  if (!snap.exists) {
    await PORTFOLIO_DOC.set(SEED_DATA);
    return true;
  }
  return false;
}
