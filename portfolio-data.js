// ─────────────────────────────────────────────────────────────
// Shared Firestore data layer with STANDALONE FALLBACK.
// If firebaseConfig is not configured, we just use SEED_DATA
// directly so the public page renders without any setup.
// ─────────────────────────────────────────────────────────────

const SEED_DATA = {
  profile: {
    name: 'Abdullelah Mohammed Moqbail',
    title: 'Information Technology Student',
    uni: 'King Abdulaziz University — Jeddah, Saudi Arabia',
    major: 'Bachelor of Information Technology (IT)',
    gpa: '4.54', grad: '2026', exp: '3',
    tag: 'Open to Internship & Work',
    bio: 'Motivated Information Technology student with a GPA of 4.54/5.00 and a strong foundation in software engineering, web development, database management, and problem solving.',
    about: 'Motivated Information Technology student with a GPA of 4.54/5.00 and a strong foundation in software engineering, web development, database management, and problem solving. Experienced in developing software projects using Java, Spring Boot, React.js, and MySQL, with practical experience in logistics operations and enterprise training. Passionate about learning modern technologies and building reliable software solutions while contributing effectively within collaborative development teams.'
  },
  certs: [
    {name: 'Data Analysis', org: 'King Abdulaziz University', date: '2024', icon: '📊', link: ''},
    {name: 'Blockchain Technology and Vision 2030', org: 'King Abdulaziz University', date: '2024', icon: '⛓️', link: ''},
    {name: 'Building Your Personal Brand', org: 'King Abdulaziz University', date: '2024', icon: '🌟', link: ''},
    {name: 'How Does a Student Innovate?', org: 'King Abdulaziz University', date: '2024', icon: '💡', link: ''}
  ],
  skills: [
    {category: 'Programming Languages', items: ['Java', 'Python', 'SQL', 'JavaScript']},
    {category: 'Frontend', items: ['React.js', 'HTML5', 'CSS3']},
    {category: 'Backend', items: ['Spring Boot', 'REST APIs']},
    {category: 'Databases', items: ['MySQL']},
    {category: 'Tools & Technologies', items: ['Git', 'GitHub', 'JUnit', 'Firebase', 'Figma', 'UI/UX Prototyping']},
    {category: 'Soft Skills', items: ['Problem Solving', 'Teamwork', 'Communication', 'Time Management', 'Adaptability', 'Working Under Pressure']}
  ],
  langs: [
    {name: 'Arabic', val: 5, level: 'Native'},
    {name: 'English', val: 3, level: 'Intermediate (B2)'}
  ],
  exps: [
    {title: 'Cooperative Trainee', org: 'Ultimate Solutions — Jeddah, Saudi Arabia', from: 'Jul 2026', to: 'Aug 2026', desc: 'Participated in ERP and software development training. Collaborated with development teams on real-world business solutions. Gained practical experience in enterprise software development workflows.'},
    {title: 'Logistics & Operations Associate', org: 'MARN Platform (Amazon Operations) — Jeddah, Saudi Arabia', from: 'May 2025', to: 'Present', desc: 'Processed and tracked shipments using barcode scanners and warehouse management systems. Applied the 5S workplace organization methodology to improve efficiency and maintain a safe working environment. Managed packaging, loading, and shipment processing while meeting quality standards. Recognized with a Certificate of Excellence for outstanding performance and customer communication.'},
    {title: 'Event Organizer & Security Guard', org: 'SELLA Security Guards Company', from: 'Mar 2024', to: 'Mar 2024', desc: 'Coordinated crowd management during large public events. Ensured visitor safety and maintained smooth event operations. Demonstrated excellent teamwork and communication under pressure.'},
    {title: 'Event Organizer & Sales Marketer', org: 'Over Dose Coffee', from: 'Oct 2023', to: 'Oct 2023', desc: 'Assisted in product marketing and promotional activities. Organized merchandise and supported customer service operations. Helped deliver a positive customer experience during public events.'}
  ],
  projects: [
    {name: 'CarHelper', icon: '🚗', tech: 'Java, Spring Boot, React.js, MySQL, REST APIs, HTML, CSS, JavaScript, JUnit', link: 'https://github.com/cpit252-spring-26-IT1/CarHelper', desc: 'Developed an AI-powered web application for diagnosing vehicle dashboard warning lights using image recognition. Implemented repair cost estimation and vehicle resale valuation for the Saudi market. Contributed to React frontend development, REST API integration, AI package implementation, and JUnit testing.'},
    {name: 'Event Management System (EMS)', icon: '🎉', tech: 'Web Development, CRUD, Database, GitHub', link: 'https://github.com/Ahmed-Alsefari/Event-Management-System-EMS-', desc: 'Developed a web-based event management system for organizing and managing events. Implemented CRUD operations, database functionality, responsive interfaces, and software engineering best practices.'},
    {name: 'Multimedia Studio (CPIT380)', icon: '🎬', tech: 'Object-Oriented Programming, Multimedia, UI Design', link: 'https://github.com/abmoqbil/MultimediaStudio-Cpit380-AbdulelahMoqbil', desc: 'Developed a multimedia application using object-oriented programming principles. Designed an interactive interface with multimedia features and improved quality through testing and debugging.'}
  ],
  contacts: [
    {type: 'email', icon: '📧', label: 'Email', val: 'abdulelah.moqbill@gmail.com'},
    {type: 'phone', icon: '📱', label: 'Phone', val: '+966546850833'},
    {type: 'linkedin', icon: '💼', label: 'LinkedIn', val: 'https://linkedin.com/in/abdulelah-moqbil'},
    {type: 'github', icon: '💻', label: 'GitHub', val: 'https://github.com/abmoqbil'},
    {type: 'other', icon: '🌐', label: 'Portfolio', val: 'https://meqbal73.github.io/AQ'}
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
