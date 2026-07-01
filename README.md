# Abdullelah Moqbail — Portfolio (Firebase + GitHub Pages)

ملخص سريع بالعربي: الموقع الآن صفحتين — **index.html** (صفحة العرض العامة، يشوفها أي زائر) و **admin.html** (صفحة التعديل، محمية بتسجيل دخول Firebase ولا يشوفها إلا أنت). البيانات صارت في **Firebase Firestore** بدل localStorage، فأي تعديل تحفظه من admin.html يظهر فورًا لكل الزوار على index.html بدون ما تحتاج ترفع الملف من جديد.

## Files in this project

| File | Purpose |
|---|---|
| `index.html` | Public portfolio page. Read-only. Loads live data from Firestore. |
| `admin.html` | Private edit page. Requires sign-in. Full add/edit/delete for every section. |
| `style.css` | Shared styling used by both pages. |
| `firebase-config.js` | Your Firebase project keys — **you fill this in** (see step 2). |
| `portfolio-data.js` | Shared data layer (Firestore read/write, starter/seed content). |
| `firestore.rules` | Security rules: anyone can read, only a signed-in admin can write. |

---

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** → follow the wizard (you can disable Google Analytics, it's not needed).
2. Once created, click the **Web (`</>`)** icon to register a web app. Give it any nickname.
3. Firebase will show you a config object — copy the values into `firebase-config.js` in this project, replacing the placeholders:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 2. Turn on Firestore (the database)

1. In the Firebase console sidebar: **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** (we'll add our own rules), pick a region close to you (e.g. `eur3` or `me-central1`), click **Enable**.
3. Go to the **Rules** tab and paste the contents of `firestore.rules` from this project, then **Publish**.

## 3. Turn on Authentication (so only you can edit)

1. Sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab → **Add user** → enter your own email and a strong password. This is the login you'll use on `admin.html`.

> Why this instead of the old "1234" password? A password typed into the page's own JavaScript can be read by anyone who opens the browser dev tools — it isn't real security. Firebase Authentication checks the password on Google's servers, so only someone with the real credentials can ever write to your data.

## 4. Add your starter content

1. Open `admin.html` locally in a browser (or after deploying, see below) and sign in with the account from step 3.
2. Click **⬇️ Import Starter Data** once — this fills Firestore with the original CV content (your certificates, skills, experience, etc.) so you have something to edit instead of starting blank.
3. From there, use **Edit / Add / Delete** on any section. Every save writes straight to Firestore and appears on `index.html` within a second — open both pages side by side to see it live.

## 5. Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `portfolio`) and push all the files in this folder to it (`index.html`, `admin.html`, `style.css`, `firebase-config.js`, `portfolio-data.js`). Also upload your actual CV PDF and name it `Abdullelah_Moqbil_CV.pdf` (or update the filename in `index.html`'s Download CV button).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)` → **Save**.
3. GitHub will give you a URL like `https://yourusername.github.io/portfolio/`. Your public page is at that URL, and the admin page is at `https://yourusername.github.io/portfolio/admin.html`.

## 6. Authorize the domain in Firebase

Firebase Auth only allows sign-in from domains you've approved:
1. Firebase console → **Authentication → Settings → Authorized domains → Add domain**.
2. Add `yourusername.github.io`.

---

## Notes

- **Two admins later?** Just add another user under Authentication → Users; both can sign in to `admin.html`.
- **CV download button**: update the `href` in `index.html`'s "📥 Download CV" link if your PDF filename differs.
- **Theme toggle** (light/dark) is a per-visitor preference stored in their own browser — it doesn't affect what other visitors see.
- **admin.html is not linked from the public page** on purpose — it's still reachable by anyone who knows the URL, but they can't do anything without your Firebase login.
- Firestore's free tier (Spark plan) comfortably covers a personal portfolio's traffic — you're not expected to pay anything for this.
