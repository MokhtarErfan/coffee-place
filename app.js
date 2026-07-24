/* ===================================================
   COFFEE PLACE – JavaScript Application Logic
=================================================== */

// ---- STATE ----
const state = {
  cart: [],          // { id, name, price, qty }
  layout: 'list',    // 'list' | 'grid'
  activeCategory: 'all',
  activeTab: 'menu',
  lang: 'en',
  // Auth
  currentOTP: null,
  otpPhone: '',
  resendTimer: null,
  signedIn: false,
  user: null,        // { name, email, phone }
};

// ---- DOM REFS ----
const $ = id => document.getElementById(id);

// ===================================================
// MODAL
// ===================================================
function openModal() {
  $('location-modal').classList.add('active');
  $('overlay').classList.add('active');
}
function closeModal() {
  $('location-modal').classList.remove('active');
  $('overlay').classList.remove('active');
}
function toggleBranchDropdown() {
  const list = $('branch-options-list');
  const chevron = $('branch-chevron');
  const trigger = document.querySelector('#custom-branch-wrap .custom-branch-trigger');
  if (!list) return;
  const isOpening = !list.classList.contains('open');
  list.classList.toggle('open', isOpening);
  if (trigger) trigger.classList.toggle('open', isOpening);
  if (chevron) {
    chevron.innerHTML = isOpening
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  }
}

function selectBranch(name, el) {
  const lbl = $('selected-branch-label');
  if (lbl) {
    lbl.textContent = name;
    lbl.style.color = '#2D2D2D';
  }
  if ($('location-select-val')) $('location-select-val').value = name;
  const wrap = $('custom-branch-wrap');
  if (wrap) wrap.querySelectorAll('.branch-item').forEach(i => i.classList.remove('selected'));
  if (el) el.classList.add('selected');
  toggleBranchDropdown();
}

function toggleOrderTypeDropdown() {
  const list = $('ordertype-options-list');
  const chevron = $('ordertype-chevron');
  const trigger = document.querySelector('#custom-ordertype-wrap .custom-branch-trigger');
  if (!list) return;
  const isOpening = !list.classList.contains('open');
  list.classList.toggle('open', isOpening);
  if (trigger) trigger.classList.toggle('open', isOpening);
  if (chevron) {
    chevron.innerHTML = isOpening
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  }
}

function selectOrderType(name, el) {
  const lbl = $('selected-ordertype-label');
  if (lbl) {
    lbl.textContent = name;
    lbl.style.color = '#2D2D2D';
  }
  if ($('ordertype-select-val')) $('ordertype-select-val').value = name;
  const wrap = $('custom-ordertype-wrap');
  if (wrap) wrap.querySelectorAll('.branch-item').forEach(i => i.classList.remove('selected'));
  if (el) el.classList.add('selected');
  toggleOrderTypeDropdown();
}

function proceedModal() {
  const branchVal = $('location-select-val') ? $('location-select-val').value : '';
  const orderType = $('ordertype-select-val') ? $('ordertype-select-val').value : '';
  
  if (!branchVal) {
    showToast('Please select a branch first.');
    const trigger = document.querySelector('#custom-branch-wrap .custom-branch-trigger');
    if (trigger) {
      trigger.style.borderColor = '#D87A68';
      setTimeout(() => { trigger.style.borderColor = ''; }, 2000);
    }
    return;
  }
  if (!orderType) {
    showToast('Please select an order type.');
    const trigger = document.querySelector('#custom-ordertype-wrap .custom-branch-trigger');
    if (trigger) {
      trigger.style.borderColor = '#D87A68';
      setTimeout(() => { trigger.style.borderColor = ''; }, 2000);
    }
    return;
  }

  showToast(`Branch set to ${branchVal} (${orderType})!`);
  closeModal();
}
function detectBranch() {
  if (!navigator.geolocation) {
    showToast('Geolocation not supported on this device.');
    return;
  }
  showToast('Detecting your location…');
  navigator.geolocation.getCurrentPosition(
    () => {
      $('location-select').value = 'cairo';
      showToast('Closest branch: Cairo – Zamalek');
    },
    () => showToast('Unable to detect location. Please select manually.')
  );
}
function setLang(l) {
  state.lang = l;
  $('lang-en').classList.toggle('active', l === 'en');
  $('lang-ar').classList.toggle('active', l === 'ar');
  showToast(l === 'ar' ? 'Language set to Arabic' : 'Language set to English');
}

// ===================================================
// DRAWERS
// ===================================================
function openNavDrawer() {
  $('nav-drawer').classList.add('open');
  $('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeNavDrawer() {
  $('nav-drawer').classList.remove('open');
  if (!$('cart-drawer').classList.contains('open')) {
    $('overlay').classList.remove('active');
    document.body.style.overflow = '';
  }
}
function openCartDrawer() {
  $('cart-drawer').classList.add('open');
  $('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCartDrawer() {
  $('cart-drawer').classList.remove('open');
  if (!$('nav-drawer').classList.contains('open')) {
    $('overlay').classList.remove('active');
    document.body.style.overflow = '';
  }
}
function closeAll() {
  // only close drawers via overlay (not modal)
  if ($('nav-drawer').classList.contains('open')) closeNavDrawer();
  if ($('cart-drawer').classList.contains('open')) closeCartDrawer();
  $('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===================================================
// TABS
// ===================================================
function switchTab(tab) {
  ['menu', 'rewards', 'orders'].forEach(t => {
    $('tab-' + t).classList.toggle('active', t === tab);
    $('tab-' + t).setAttribute('aria-selected', t === tab);
    $('panel-' + t).classList.toggle('active', t === tab);
  });
  state.activeTab = tab;
  // scroll to content top
  window.scrollTo({ top: $('site-header').offsetTop, behavior: 'smooth' });
}

// ===================================================
// LAYOUT TOGGLE
// ===================================================
function setLayout(layout) {
  state.layout = layout;
  const sections = $('menu-sections');
  sections.classList.toggle('list-view', layout === 'list');
  sections.classList.toggle('grid-view', layout === 'grid');
  $('layout-list').classList.toggle('active', layout === 'list');
  $('layout-grid').classList.toggle('active', layout === 'grid');
}

// ===================================================
// CATEGORY FILTER
// ===================================================
function filterCategory(btn, cat) {
  // Update pills
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  state.activeCategory = cat;

  // Show/hide categories
  document.querySelectorAll('.menu-category').forEach(section => {
    if (cat === 'all') {
      section.classList.remove('hidden');
    } else {
      section.classList.toggle('hidden', section.dataset.category !== cat);
    }
  });

  // Re-run search
  filterMenu();
}

// ===================================================
// SEARCH FILTER
// ===================================================
function filterMenu() {
  const query = $('menu-search').value.toLowerCase().trim();
  let anyVisible = false;

  document.querySelectorAll('.menu-item-card').forEach(card => {
    const name = card.dataset.name || '';
    const catMatch = state.activeCategory === 'all' || card.dataset.category === state.activeCategory;
    const searchMatch = !query || name.includes(query);
    const show = catMatch && searchMatch;
    card.style.display = show ? '' : 'none';
    if (show) anyVisible = true;
  });

  // Hide empty category sections
  document.querySelectorAll('.menu-category').forEach(section => {
    if (section.classList.contains('hidden')) return;
    const visibleCards = [...section.querySelectorAll('.menu-item-card')]
      .filter(c => c.style.display !== 'none');
    section.style.display = visibleCards.length ? '' : 'none';
  });

  $('no-results').style.display = anyVisible ? 'none' : 'flex';
}

// ===================================================
// CART
// ===================================================
function addToCart(name, price, e) {
  if (e) e.stopPropagation();

  const existing = state.cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ id: Date.now(), name, price, qty: 1 });
  }

  updateCartUI();
  showToast(`${name} added to cart`);

  // Animate the cart button
  const cartBtn = $('cart-btn');
  cartBtn.style.transform = 'scale(1.2)';
  setTimeout(() => { cartBtn.style.transform = ''; }, 200);
}

function updateQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function updateCartUI() {
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = state.cart.reduce((s, i) => s + i.qty, 0);

  // Badge
  const badge = $('cart-badge');
  badge.style.display = count > 0 ? 'flex' : 'none';
  badge.textContent = count;

  // Subtotal
  $('cart-total-display').textContent = `EGP ${total}`;

  // Items
  const empty   = $('cart-empty');
  const itemList = $('cart-items-list');

  empty.style.display     = state.cart.length ? 'none' : 'flex';
  itemList.style.display  = state.cart.length ? 'flex' : 'none';

  itemList.innerHTML = state.cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">EGP ${item.price * item.qty}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)" aria-label="Decrease quantity">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)" aria-label="Increase quantity">+</button>
      </div>
    </div>
  `).join('');
}

function goToCart() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty.');
    return;
  }
  showToast('Proceeding to checkout…');
}

// ===================================================
// TOAST
// ===================================================
let toastTimer = null;
function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ===================================================
// KEYBOARD ACCESSIBILITY
// ===================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('nav-drawer').classList.contains('open'))  closeNavDrawer();
    if ($('cart-drawer').classList.contains('open')) closeCartDrawer();
    if ($('location-modal').classList.contains('active')) closeModal();
  }
});

// ===================================================
// STICKY HEADER SHADOW
// ===================================================
window.addEventListener('scroll', () => {
  const header = $('site-header');
  if (header) {
    header.style.boxShadow = window.scrollY > 20
      ? '0 4px 20px rgba(0,0,0,0.08)'
      : '0 2px 12px rgba(0,0,0,0.04)';
  }
}, { passive: true });

// ===================================================
// FULL-PAGE SIGN-IN
// ===================================================
function openSignInPage() {
  if (state.signedIn) {
    openUserProfileModal();
    return;
  }
  spGoToStep('register');
  $('sp-name').value   = '';
  $('sp-phone').value  = '';
  spClearOTP();
  $('sp-otp-error').style.display = 'none';
  $('signin-page').classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('sp-name').focus(), 350);
}

function closeSignInPage() {
  $('signin-page').classList.remove('active');
  document.body.style.overflow = '';
  clearResendTimer();
}

// Aliases so all existing onclick="" calls work
function openSignIn()      { openSignInPage(); }
function openSignInModal() { openSignInPage(); }
function closeSignInModal(){ closeSignInPage(); }

function spGoToStep(name) {
  document.querySelectorAll('.sp-step').forEach(el => el.classList.remove('active'));
  $(`sp-step-${name}`).classList.add('active');
}

// ---- STEP 1: Send OTP ----
async function spSendOTP() {
  const name  = $('sp-name').value.trim();
  const phone = $('sp-phone').value.replace(/\s/g, '');
  const code  = $('sp-country').value;

  if (!name) {
    spShake($('sp-name'));
    showToast('Please enter your name.');
    return;
  }
  if (!phone || phone.length < 7) {
    spShake($('sp-phone'));
    showToast('Please enter a valid phone number.');
    return;
  }

  state.pendingName = name;
  state.otpPhone    = `${code}${phone}`;

  const btn = $('sp-signup-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.otpPhone, name: state.pendingName })
    });
    const data = await response.json();

    btn.textContent = 'Sign up';
    btn.disabled = false;

    if (data.success) {
      state.currentOTP = data.otp;
      showSMSBubble(data.otp);
      $('sp-otp-phone').textContent = state.otpPhone;
      spClearOTP();
      $('sp-otp-error').style.display = 'none';
      spGoToStep('otp');
      spStartResend();
      setTimeout(() => document.querySelector('.sp-otp-box').focus(), 300);
    } else {
      showToast(data.message || 'Failed to send verification code.');
    }
  } catch (err) {
    btn.textContent = 'Sign up';
    btn.disabled = false;
    showToast('Backend server connection error.');
  }
}

// ---- STEP 2: Verify OTP ----
async function spVerifyOTP() {
  const boxes   = [...document.querySelectorAll('.sp-otp-box')];
  const entered = boxes.map(b => b.value).join('');

  if (entered.length < 6) {
    showToast('Please enter all 6 digits.');
    return;
  }

  const btn = $('sp-verify-btn');
  btn.textContent = 'Verifying…';
  btn.disabled = true;

  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.otpPhone, code: entered })
    });
    const data = await response.json();

    btn.textContent = 'Verify & Continue';
    btn.disabled = false;

    if (data.success) {
      $('sp-otp-error').style.display = 'none';
      clearResendTimer();

      state.user = data.user;
      localStorage.setItem('cp_user', JSON.stringify(state.user));
      spFinalize(true);
    } else {
      boxes.forEach(b => { b.classList.add('sp-error'); });
      setTimeout(() => boxes.forEach(b => b.classList.remove('sp-error')), 600);
      $('sp-otp-error').textContent = data.message || 'Incorrect verification code.';
      $('sp-otp-error').style.display = 'block';
      setTimeout(() => { spClearOTP(); document.querySelector('.sp-otp-box').focus(); }, 650);
    }
  } catch (err) {
    btn.textContent = 'Verify & Continue';
    btn.disabled = false;
    showToast('Server error while verifying code.');
  }
}

// ---- STEP 3: Success ----
function spFinalize(isNew) {
  state.signedIn = true;
  const { name, phone } = state.user;

  $('sp-avatar').textContent             = name.charAt(0).toUpperCase();
  $('sp-user-name-display').textContent  = name;
  $('sp-user-phone-display').textContent = phone;
  $('sp-welcome-text').textContent = isNew
    ? `Welcome to Coffee Place, ${name.split(' ')[0]}! 🎉`
    : `Welcome back, ${name.split(' ')[0]}! ☕`;

  spGoToStep('success');
  updateSignedInUI();
}

function updateSignedInUI() {
  if (!state.signedIn || !state.user) return;
  const { name, phone } = state.user;
  const initial = name.charAt(0).toUpperCase();

  // Announcement bar
  const bar = document.querySelector('.announcement-bar');
  if (bar) {
    bar.classList.add('signed-in');
    const textEl = bar.querySelector('.announcement-text');
    if (textEl) textEl.textContent = `Hello, ${name.split(' ')[0]}! You're signed in ☕`;
  }

  // Insert circular avatar button in header-right (if not existing)
  if (!$('header-avatar-btn')) {
    const cartBtn = $('cart-btn');
    if (cartBtn) {
      cartBtn.insertAdjacentHTML('beforebegin', `
        <button id="header-avatar-btn" class="header-avatar-btn" onclick="openUserProfileModal()" title="Signed in as ${name}" aria-label="Account profile">
          ${initial}
        </button>
      `);
    }
  }

  // Update Nav Drawer auth text
  const drawerText = $('drawer-signin-text');
  if (drawerText) drawerText.textContent = 'Sign out';

  // Greeting
  const greeting = document.querySelector('.greeting');
  if (greeting) greeting.textContent = `Hello, ${name.split(' ')[0]}! 👋`;

  // Update user profile modal fields
  if ($('up-avatar-initial')) $('up-avatar-initial').textContent = initial;
  if ($('up-user-name'))      $('up-user-name').textContent      = name;
  if ($('up-user-phone'))     $('up-user-phone').textContent     = phone || '';
}

// ---- USER PROFILE MODAL & SIGN OUT ----
function openUserProfileModal() {
  if (!state.signedIn || !state.user) {
    openSignInPage();
    return;
  }
  updateSignedInUI();
  if ($('user-profile-modal')) {
    $('user-profile-modal').classList.add('active');
    $('overlay').classList.add('active');
  }
}

function closeUserProfileModal() {
  if ($('user-profile-modal')) $('user-profile-modal').classList.remove('active');
  $('overlay').classList.remove('active');
}

function signOut() {
  state.signedIn = false;
  state.user = null;
  localStorage.removeItem('cp_user');

  // Remove header avatar
  const avatarBtn = $('header-avatar-btn');
  if (avatarBtn) avatarBtn.remove();

  // Reset announcement bar
  const bar = document.querySelector('.announcement-bar');
  if (bar) {
    bar.classList.remove('signed-in');
    const textEl = bar.querySelector('.announcement-text');
    if (textEl) textEl.textContent = 'Sign in here to view your personalized offers';
  }

  // Reset nav drawer
  const drawerText = $('drawer-signin-text');
  if (drawerText) drawerText.textContent = 'Sign in';

  // Reset greeting
  const greeting = document.querySelector('.greeting');
  if (greeting) greeting.textContent = 'Hello 👋';

  closeUserProfileModal();
  closeSignInPage();
  closeNavDrawer();
  showToast('Signed out successfully');
}

function handleNavAuthClick() {
  closeNavDrawer();
  if (state.signedIn) {
    signOut();
  } else {
    openSignInPage();
  }
}

// ---- OTP helpers ----
function spClearOTP() {
  document.querySelectorAll('.sp-otp-box').forEach(b => {
    b.value = '';
    b.classList.remove('sp-filled', 'sp-error');
  });
}

function spShake(el) {
  el.style.borderColor = '#e05555';
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => { el.style.borderColor = ''; }, 700);
}

// ---- SMS bubble ----
function showSMSBubble(code) {
  $('sms-code-display').textContent = code;
  const bubble = $('sms-bubble');
  bubble.classList.add('show');
  setTimeout(() => bubble.classList.remove('show'), 7000);
}

// ---- Resend timer ----
function spStartResend() {
  let s = 60;
  const updateTimerDisplay = (sec) => {
    const timerEl = $('sp-timer-display');
    if (timerEl) timerEl.textContent = `00:${sec < 10 ? '0' + sec : sec}`;
  };

  updateTimerDisplay(s);
  if ($('sp-resend-text')) $('sp-resend-text').style.display = 'inline';
  if ($('sp-resend-btn')) $('sp-resend-btn').style.display  = 'none';

  clearResendTimer();
  state.resendTimer = setInterval(() => {
    s--;
    updateTimerDisplay(s);
    if (s <= 0) {
      clearResendTimer();
      if ($('sp-resend-text')) $('sp-resend-text').style.display = 'none';
      if ($('sp-resend-btn')) $('sp-resend-btn').style.display  = 'inline';
    }
  }, 1000);
}

async function spResend() {
  try {
    const response = await fetch('/api/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.otpPhone })
    });
    const data = await response.json();
    if (data.success) {
      state.currentOTP = data.otp;
      showSMSBubble(data.otp);
      spClearOTP();
      $('sp-otp-error').style.display = 'none';
      showToast('New verification code sent!');
      spStartResend();
      setTimeout(() => document.querySelector('.sp-otp-box').focus(), 200);
    } else {
      showToast(data.message || 'Failed to resend code.');
    }
  } catch (err) {
    showToast('Server error while resending code.');
  }
}

function clearResendTimer() {
  if (state.resendTimer) { clearInterval(state.resendTimer); state.resendTimer = null; }
}

// Legacy stubs (no-ops – kept so old inline onclicks don't throw)
function sendOTP()      { spSendOTP(); }
function verifyOTP()    { spVerifyOTP(); }
function resendOTP()    { spResend(); }
function completeSignUp(){}
function goToStep()    {}
function formatPhoneInput(input){ input.value = input.value.replace(/[^\d\s]/g,''); }
function shakeElement(el){ spShake(el); }
function startResendTimer(){ spStartResend(); }

// ===================================================
// INIT
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Show location modal on first load
  setTimeout(() => { $('location-modal').classList.add('active'); }, 400);

  // Restore session
  const stored = localStorage.getItem('cp_user');
  if (stored) {
    try {
      state.user     = JSON.parse(stored);
      state.signedIn = true;
      updateSignedInUI();
    } catch (e) { localStorage.removeItem('cp_user'); }
  }

  // Wire OTP boxes
  const spBoxes = [...document.querySelectorAll('.sp-otp-box')];
  spBoxes.forEach((box, idx) => {
    box.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(-1);
      e.target.classList.toggle('sp-filled', !!val);
      e.target.classList.remove('sp-error');
      if (val && idx < spBoxes.length - 1) spBoxes[idx + 1].focus();
      if (val && idx === spBoxes.length - 1) $('sp-verify-btn').focus();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        spBoxes[idx - 1].value = '';
        spBoxes[idx - 1].classList.remove('sp-filled');
        spBoxes[idx - 1].focus();
      }
      if (e.key === 'Enter') spVerifyOTP();
    });
    box.addEventListener('focus', e => e.target.select());
  });

  // Paste support
  const otpWrap = $('sp-otp-boxes');
  if (otpWrap) {
    otpWrap.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      spBoxes.forEach((b, i) => {
        b.value = text[i] || '';
        b.classList.toggle('sp-filled', !!text[i]);
      });
      const nxt = spBoxes.findIndex(b => !b.value);
      (nxt >= 0 ? spBoxes[nxt] : spBoxes[5]).focus();
      if (text.length >= 6) setTimeout(spVerifyOTP, 300);
    });
  }

  // ESC closes sign-in page
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('signin-page').classList.contains('active')) closeSignInPage();
  });
});
