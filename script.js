/* ===================== CONFIG ===================== */
const PASSWORD = "4802146";
let isAuthenticated = false; // reset on every load/refresh — no session ever starts "inside" the app

/* ===================== CURSOR GLOW ===================== */
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', (e) => {
  glow.classList.add('on');
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
  // light the card under the cursor
  const card = e.target.closest('.glass-card');
  document.querySelectorAll('.glass-card').forEach(c => {
    if (c === card){
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
  });
});
window.addEventListener('mouseleave', () => glow.classList.remove('on'));

window.addEventListener('click', (e) => {
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.style.left = e.clientX + 'px';
  dot.style.top = e.clientY + 'px';
  dot.style.opacity = '.9';
  document.body.appendChild(dot);
  dot.style.animation = 'dotFade .6s ease forwards';
  setTimeout(() => dot.remove(), 650);
});

/* ===================== PHOTO & VIDEO ALBUMS =====================
   لتنظيم الصور: أضف المجلد هنا بنفس الاسم الموجود فعلياً داخل assets/images
   ثم اكتب أسماء ملفات الصور بداخله. نفس الشيء بالنسبة للفيديوهات. */
const PHOTO_ALBUMS = [
  { label: "ذكريات",  folder: "memories", files: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"] },
  { label: "السفر",   folder: "travel",   files: ["1.jpg", "2.jpg"] },
  { label: "العائلة", folder: "family",   files: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"] }
];
const VIDEO_ALBUMS = [
  { label: "لحظات مهمة", folder: "highlights", files: ["1.mp4", "2.mp4"] },
  { label: "الرحلات",    folder: "trips",      files: ["1.mp4"] }
];

function renderAlbumFolders(gridId, backBtnId, albums, kind){
  const grid = document.getElementById(gridId);
  const backBtn = document.getElementById(backBtnId);
  if (!grid || !backBtn) return;
  backBtn.style.display = 'none';
  grid.innerHTML = albums.map((a, i) => `
    <div class="glass-card album-card" data-index="${i}">
      <div class="gc-ic">📁</div>
      <b>${a.label}</b>
      <span>${a.files.length} ${kind === 'photo' ? 'صورة' : 'فيديو'}</span>
    </div>
  `).join('');
  grid.querySelectorAll('.album-card').forEach(card => {
    card.addEventListener('click', () => {
      const album = albums[card.dataset.index];
      if (kind === 'photo') openPhotoAlbum(album); else openVideoAlbum(album);
    });
  });
}

function openPhotoAlbum(album){
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryBack = document.getElementById('galleryBack');
  galleryBack.style.display = 'inline-flex';
  galleryGrid.innerHTML = album.files.map((file, i) => `
    <div class="glass-card gal-item">
      <img src="assets/images/${album.folder}/${file}" alt="${album.label} ${i+1}" onerror="this.parentElement.classList.add('missing')">
      <span class="missing-label">ضع الصورة هنا: assets/images/${album.folder}/${file}</span>
    </div>
  `).join('');
}

function openVideoAlbum(album){
  const videoGrid = document.getElementById('videoGrid');
  const videosBack = document.getElementById('videosBack');
  videosBack.style.display = 'inline-flex';
  videoGrid.innerHTML = album.files.map((file, i) => `
    <div class="glass-card vid-item">
      <video controls preload="metadata" onerror="this.parentElement.classList.add('missing')">
        <source src="assets/videos/${album.folder}/${file}" type="video/mp4">
      </video>
      <span class="missing-label">ضع الفيديو هنا: assets/videos/${album.folder}/${file}</span>
    </div>
  `).join('');
}

// Back-button clicks are handled via delegation since the buttons
// live inside content that is injected later from pages/gallery.html and pages/videos.html
document.addEventListener('click', (e) => {
  if (e.target.closest('#galleryBack')) renderAlbumFolders('galleryGrid', 'galleryBack', PHOTO_ALBUMS, 'photo');
  if (e.target.closest('#videosBack')) renderAlbumFolders('videoGrid', 'videosBack', VIDEO_ALBUMS, 'video');
});

function initGalleryAndVideos(){
  renderAlbumFolders('galleryGrid', 'galleryBack', PHOTO_ALBUMS, 'photo');
  renderAlbumFolders('videoGrid', 'videosBack', VIDEO_ALBUMS, 'video');
}

/* ===================== LOAD SPLIT PAGE FILES =====================
   كل صفحة (الرئيسية، ملفي الشخصي، ملفاتي...) أصبحت ملفاً منفصلاً داخل مجلد pages/
   يتم تحميلها هنا وحقنها داخل حاوية كل صفحة، دون أي تغيير في الشكل النهائي. */
const PAGE_FILES = {
  home: 'pages/home.html',
  profile: 'pages/profile.html',
  files: 'pages/files.html',
  docs: 'pages/docs.html',
  gallery: 'pages/gallery.html',
  videos: 'pages/videos.html',
  notes: 'pages/notes.html',
  favorites: 'pages/favorites.html',
  about: 'pages/about.html'
};

const pagesReady = (async () => {
  try {
    await Promise.all(Object.entries(PAGE_FILES).map(async ([key, path]) => {
      const res = await fetch(path);
      if (!res.ok) throw new Error('تعذر تحميل ' + path);
      const html = await res.text();
      const container = document.getElementById('page-' + key);
      if (container) container.innerHTML = html;
    }));
    initGalleryAndVideos();
  } catch (err) {
    console.error('تعذر تحميل ملفات الصفحات المنفصلة:', err);
    const notice = document.createElement('div');
    notice.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;z-index:999;background:#241417;border:1px solid #E08787;color:#F2ECE2;padding:14px 18px;border-radius:10px;font-size:13px;line-height:1.8;max-width:640px;margin:0 auto;';
    notice.innerHTML = 'تعذر تحميل ملفات الصفحات المنفصلة (pages/). إذا فتحت <b>index.html</b> مباشرة من جهازك (نقر مزدوج) فبعض المتصفحات تمنع هذا لأسباب أمنية. الحل: شغّل خادماً محلياً بسيطاً داخل مجلد الموقع (مثال: <b>python -m http.server</b> ثم افتح الرابط الذي يظهر)، أو ارفع الموقع لاستضافة مثل GitHub Pages أو Netlify.';
    document.body.appendChild(notice);
  }
})();


/* ===================== ACCESS GUARD ===================== */
// The app shell only ever becomes visible through attemptLogin() below.
// Every page load starts locked; there is no code path that reveals #app
// without isAuthenticated being set to true first.
function enforceGuard(){
  if (!isAuthenticated){
    app.classList.remove('active');
    document.body.classList.remove('unlocked');
  }
}

/* ===================== SPLASH -> LOGIN ===================== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('pwInput').focus();
  }, 2000);
});

/* ===================== LOGIN LOGIC ===================== */
const pwInput = document.getElementById('pwInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const loginCard = document.querySelector('.login-card');
const loginScreen = document.getElementById('loginScreen');
const flash = document.getElementById('flash');
const app = document.getElementById('app');

document.getElementById('pwToggle').addEventListener('click', () => {
  pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
  document.getElementById('pwToggle').textContent = pwInput.type === 'password' ? 'عرض' : 'إخفاء';
});

async function attemptLogin(){
  if (pwInput.value === PASSWORD){
    isAuthenticated = true;
    flash.classList.add('play');
    loginScreen.classList.add('leaving');
    document.body.classList.add('unlocked');
    await pagesReady; // make sure all split page files are loaded and injected first
    setTimeout(() => {
      loginScreen.style.display = 'none';
      app.classList.add('active');
      startClock();
      startTypewriter();
    }, 550);
  } else {
    loginError.classList.add('show');
    loginCard.classList.remove('shake');
    void loginCard.offsetWidth;
    loginCard.classList.add('shake');
    pwInput.value = '';
    pwInput.focus();
  }
}
loginBtn.addEventListener('click', attemptLogin);
pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });

/* ===================== LOGOUT ===================== */
document.getElementById('logoutBtn').addEventListener('click', () => {
  isAuthenticated = false;
  app.classList.remove('active');
  document.body.classList.remove('unlocked');
  pwInput.value = '';
  loginError.classList.remove('show');
  setTimeout(() => {
    loginScreen.style.display = 'flex';
    loginScreen.classList.remove('leaving');
    void loginScreen.offsetWidth;
    loginScreen.classList.add('active');
    pwInput.focus();
    showPage('home');
  }, 300);
});

// Keep re-checking so the app can never end up visible without a successful login
setInterval(enforceGuard, 1000);
// If the browser restores this page from cache (back/forward), force back to login
window.addEventListener('pageshow', (e) => {
  if (e.persisted){
    isAuthenticated = false;
    location.reload();
  }
});

/* ===================== SIDEBAR NAVIGATION ===================== */
function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-list a[data-page]').forEach(a => a.classList.remove('active'));
  const target = document.querySelector('.nav-list a[data-page="' + id + '"]');
  if (target) target.classList.add('active');
  document.querySelector('.main').scrollTo({ top: 0, behavior: 'smooth' });
  sidebar.classList.remove('open');
}
document.querySelectorAll('.nav-list a[data-page]').forEach(a => {
  a.addEventListener('click', () => showPage(a.dataset.page));
});
// Delegated: the shortcut cards on the home page are injected later from pages/home.html
document.addEventListener('click', (e) => {
  const goto = e.target.closest('.glass-card[data-goto]');
  if (goto) showPage(goto.dataset.goto);
});

const sidebar = document.getElementById('sidebar');
document.getElementById('menuToggle').addEventListener('click', () => sidebar.classList.toggle('open'));

/* ===================== CLOCK ===================== */
function startClock(){
  function tick(){
    const now = new Date();
    document.getElementById('clockTime').textContent = now.toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    document.getElementById('clockDate').textContent = now.toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

/* ===================== TYPEWRITER ===================== */
function startTypewriter(){
  const el = document.getElementById('typewriter');
  const phrases = [
    "مرحباً بك في مساحتك الرقمية الخاصة.",
    "كل ما يخصك، في مكان واحد آمن.",
    "الموقع الرسمي الخاص بـ سيف الدين."
  ];
  let pi = 0, ci = 0, deleting = false;
  function loop(){
    const current = phrases[pi];
    if (!deleting){
      ci++;
      el.textContent = current.slice(0, ci);
      if (ci === current.length){ deleting = true; setTimeout(loop, 1600); return; }
    } else {
      ci--;
      el.textContent = current.slice(0, ci);
      if (ci === 0){ deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(loop, deleting ? 30 : 55);
  }
  loop();
}

/* ===================== ANIMATED TECH NETWORK BACKGROUND ===================== */
const canvas = document.getElementById('netbg');
const ctx = canvas.getContext('2d');
let W, H, points = [];
function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const COUNT = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 18000));
for (let i = 0; i < COUNT; i++){
  points.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  });
}

function drawNet(){
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(201,166,107,0.55)';
  for (const p of points){
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < points.length; i++){
    for (let j = i + 1; j < points.length; j++){
      const dx = points[i].x - points[j].x, dy = points[i].y - points[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140){
        ctx.strokeStyle = 'rgba(201,166,107,' + (0.16 * (1 - dist / 140)) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawNet);
}
drawNet();
