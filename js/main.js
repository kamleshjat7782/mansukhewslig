/* ============================================================
   GALAXY STAR CITY — main.js
   All JS: nav, footer, scroll reveal, toast,
           multi-step form, EmailJS, Google Sheets
   ============================================================ */

/* ══════════════════════════════════════════════
   ⚙️  CONFIGURATION — REPLACE WITH YOUR KEYS
   ══════════════════════════════════════════════ */
   
const CFG = {
  emailjs: {
    publicKey:  'hSd9kTsO_g_LjghYq',   // e.g. 'user_abc123xyz'
    serviceId:  'service_hih3qqj',   // e.g. 'service_galaxy'
    templateId: 'template_ri26uyr',  // e.g. 'template_apply'
  },
  sheetUrl: 'https://script.google.com/macros/s/AKfycbwMTwZB7pO_yWXOc8nZmkCKywdqM1qaxe6co5up-DA5eerrYJtjG7EaelsEfjFaxpGLsg/exec',   // Deploy as Web App URL
  adminEmail: 'mansukhreception@gmail.com',
  waNumber: '919782753728',
};

/* ══════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════ */
const Toast = (() => {
  let el = null, timer = null;
  function get() {
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    return el;
  }
  function show(msg, type = '', ms = 3600) {
    const icons = { 't-success':'✅', 't-error':'❌', '':'ℹ️' };
    const t = get();
    t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
    t.className = `toast ${type}`;
    clearTimeout(timer);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    timer = setTimeout(() => t.classList.remove('show'), ms);
  }
  return {
    show,
    success: m => show(m, 't-success'),
    error:   m => show(m, 't-error'),
  };
})();

/* ══════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal,.reveal-l,.reveal-r');
  if (!els.length) return;
  const ob = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const siblings = Array.from((e.target.parentElement || document.body).querySelectorAll(':scope > .reveal,:scope > .reveal-l,:scope > .reveal-r'));
        const idx = siblings.indexOf(e.target);
        setTimeout(() => e.target.classList.add('visible'), Math.max(0, idx * 80));
        ob.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => ob.observe(el));
}

/* ══════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   ══════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    const id = a.getAttribute('href').slice(1);
    const t = document.getElementById(id);
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 84, behavior: 'smooth' }); }
  }
});

/* ══════════════════════════════════════════════
   NAV — hamburger
   ══════════════════════════════════════════════ */
   function initNav() {
    const btn = document.getElementById('navHamburger');
    const drawer = document.getElementById('navDrawer');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      drawer.classList.toggle('open');
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      btn.classList.remove('open');
      drawer.classList.remove('open');
    }));
  }

/* ══════════════════════════════════════════════
   RADIO PILLS
   ══════════════════════════════════════════════ */
function initRadioPills() {
  document.querySelectorAll('.radio-grp').forEach(grp => {
    grp.querySelectorAll('.radio-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const name = pill.querySelector('input').name;
        document.querySelectorAll(`.radio-pill input[name="${name}"]`).forEach(i => i.closest('.radio-pill').classList.remove('sel'));
        pill.querySelector('input').checked = true;
        pill.classList.add('sel');
      });
    });
  });
}

/* ══════════════════════════════════════════════
   MULTI-STEP FORM
   ══════════════════════════════════════════════ */
let curStep = 1;
const TOTAL = 5;

const REQUIRED = {
  1: ['applyFor','holderName','dob','email','mobile','idNo','aadhar'],
  2: ['pincode','city','address'],
  3: ['category','annualIncome'],
};
const RADIO_REQ = {
  1: ['gender','idType'],
};

function goStep(n) {
  if (n < 1 || n > TOTAL) return;
  document.querySelectorAll('.form-sec').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('sec-' + n);
  if (sec) sec.classList.add('active');

  // progress
  for (let i = 1; i <= TOTAL; i++) {
    const p = document.getElementById('prog-' + i);
    const l = document.getElementById('line-' + i);
    if (!p) continue;
    p.className = 'prog-step ' + (i < n ? 'done' : i === n ? 'active' : 'inactive');
    const circ = p.querySelector('.prog-circle');
    if (circ) circ.textContent = i < n ? '✓' : String(i);
    if (l) l.className = 'prog-line' + (i < n ? ' done' : '');
  }

  const backBtn = document.getElementById('btnBack');
  const nextBtn = document.getElementById('btnNext');
  const submitBtn = document.getElementById('btnSubmit');
  const termsBar = document.getElementById('termsBar');
  const ctr = document.getElementById('stepCtr');

  if (backBtn) { backBtn.classList.toggle('show', n > 1); }
  if (nextBtn) nextBtn.style.display = n < TOTAL ? 'inline-flex' : 'none';
  if (submitBtn) submitBtn.classList.toggle('show', n === TOTAL);
  if (termsBar) termsBar.classList.toggle('show', n === TOTAL);
  if (ctr) ctr.textContent = `Step ${n} of ${TOTAL}`;

  if (n === 4) buildSummary();
   if (n === 5) updateStep5Details();
  curStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(n) {
  let ok = true;
  (REQUIRED[n] || []).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const empty = !el.value.trim();
    el.classList.toggle('err', empty);
    if (empty) ok = false;
  });
  (RADIO_REQ[n] || []).forEach(name => {
    if (!document.querySelector(`input[name="${name}"]:checked`)) ok = false;
  });
  if (n === 1) {
    const mob = document.getElementById('mobile');
    if (mob && mob.value && !/^\d{10}$/.test(mob.value)) { mob.classList.add('err'); ok = false; }
    const aad = document.getElementById('aadhar');
    if (aad && aad.value && !/^\d{12}$/.test(aad.value)) { aad.classList.add('err'); ok = false; }
    const em = document.getElementById('email');
    if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.classList.add('err'); ok = false; }
  }
  if (!ok) Toast.error('Please fill all required fields correctly.');
  return ok;
}

// Clear error on input
document.addEventListener('input', e => {
  if (e.target.classList.contains('err')) e.target.classList.remove('err');
});

function nextStep() { if (validateStep(curStep)) goStep(curStep + 1); }
function prevStep() { goStep(curStep - 1); }

function buildSummary() {
  const g = id => document.getElementById(id)?.value?.trim() || '—';
  const gr = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '—';
  const gsel = id => { const el = document.getElementById(id); return el?.options[el.selectedIndex]?.text || '—'; };
  const rows = [
    ['Apply For', g('applyFor')], ['Holder Name', g('holderName')],
    ['Gender', gr('gender')], ['Date of Birth', g('dob')],
    ['Email', g('email')], ['Mobile', g('mobile')],
    ['Relation', gr('relation')], ['Father/Husband', g('fatherName')],
    ['ID Type', gr('idType')], ['ID Number', g('idNo')],
    ['Aadhar', g('aadhar')], ['Pin Code', g('pincode')],
    ['City', g('city')], ['Address', g('address')],
    ['Category', g('category')], ['Annual Income', gsel('annualIncome')],
    ['Payment ID', g('utrNo')],
  ];
  const grid = document.getElementById('summaryGrid');
  if (grid) grid.innerHTML = rows.map(([l, v]) =>
    `<div class="sum-item"><div class="sum-lbl">${l}</div><div class="sum-val">${v}</div></div>`
  ).join('');
}

function collectData() {
  const g = id => document.getElementById(id)?.value?.trim() || '';
  const gr = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  const el = document.getElementById('annualIncome');
  return {
    orderId:      'GR' + Date.now().toString().slice(-10),
    applyFor:     g('applyFor'),
    holderName:   g('holderName'),
    gender:       gr('gender'),
    dob:          g('dob'),
    email:        g('email'),
    mobile:       g('mobile'),
    relation:     gr('relation'),
    fatherName:   g('fatherName'),
    idType:       gr('idType'),
    idNo:         g('idNo'),
    aadhar:       g('aadhar'),
    pincode:      g('pincode'),
    city:         g('city'),
    state:        'Rajasthan',
    country:      'India',
    address:      g('address'),
    category:     g('category'),
    utrNo:     g('utrNo'),
    annualIncome: el?.options[el.selectedIndex]?.text || '',
    amount:       g('applyFor') === 'EWS' ? '500' : '1000',
    submittedAt:  new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };
}

/* ── EmailJS ── */
async function sendEmail(d) {
  if (CFG.emailjs.publicKey === 'hSd9kTsO_g_LjghYq') { console.warn('EmailJS not configured'); return; }
  if (typeof emailjs === 'undefined') { console.error('EmailJS SDK not loaded'); return; }
  emailjs.init(CFG.emailjs.publicKey);
  return emailjs.send(CFG.emailjs.serviceId, CFG.emailjs.templateId, {
    to_email: d.email, admin_email: CFG.adminEmail,
    order_id: d.orderId, apply_for: d.applyFor,
    holder_name: d.holderName, gender: d.gender, dob: d.dob,
    email: d.email, mobile: d.mobile, relation: d.relation,
    father_name: d.fatherName, id_type: d.idType, id_no: d.idNo,
    aadhar: d.aadhar,
    address: `${d.address}, ${d.city}, ${d.state} – ${d.pincode}`,
    category: d.category, annual_income: d.annualIncome,
    amount: `₹${d.amount}`, submitted_at: d.submittedAt,
  });
}





/* ── Google Sheets ── */

async function sendToSheet(d) {

  const fd = new FormData();
  console.log(d)


  Object.keys(d).forEach(key => {
    fd.append(key, d[key]);
  });

  try {

    await fetch(CFG.sheetUrl, {
      method: 'POST',
      body: fd,
      mode: 'no-cors'
    });

    console.log('Saved to Google Sheet');

  } catch(err) {

    console.error(err);

  }
}


/* ── Google Sheets ── */


// async function sendToSheet(d) {
//   if (CFG.sheetUrl === 'https://script.google.com/macros/s/AKfycbwMTwZB7pO_yWXOc8nZmkCKywdqM1qaxe6co5up-DA5eerrYJtjG7EaelsEfjFaxpGLsg/exec') { console.warn('Google Sheets not configured'); return; }
//   const fd = new URLSearchParams();
//   Object.entries(d).forEach(([k, v]) => fd.append(k, v));
//   return fetch(CFG.sheetUrl, { method: 'POST', body: fd, mode: 'no-cors' });
// }


async function submitForm() {


  const utrNo = document.getElementById('utrNo').value.trim();
if (!utrNo) {
    Toast.error('Please enter Payment ID (UTR No.)');
    return;
}

  if (!document.getElementById('terms')?.checked) {
    Toast.error('Please accept Terms & Conditions');
    return;
  }

  const btn = document.getElementById('btnSubmit');

  btn.disabled = true;
  btn.classList.add('loading');

  const data = collectData();
  
  try {

    await sendToSheet(data);

    // await sendEmail(data);

    Toast.success('Application Submitted Successfully');

    setTimeout(() => {

     

    }, 1500);

  } catch(err) {

    console.error(err);

    Toast.error('Submission Failed');

    btn.disabled = false;
    btn.classList.remove('loading');

  }
}

/* ── Submit ── */
// async function submitForm() {
//   if (!document.getElementById('terms')?.checked) {
//     Toast.error('Please accept the Terms & Conditions.');
//     return;
//   }
//   const btn = document.getElementById('btnSubmit');
//   btn.classList.add('loading');
//   btn.disabled = true;

//   const data = collectData();
//   console.log('data')

//   try {
//     await Promise.allSettled( sendToSheet(data));
//     sessionStorage.setItem('gx_app', JSON.stringify(data));
//     window.location.href = `payment.html?order=${data.orderId}&amount=${data.amount}&name=${encodeURIComponent(data.holderName)}&scheme=${encodeURIComponent(data.applyFor)}`;
//   } catch (err) {
//     console.error(err);
//     Toast.error('Submission failed. Please try again.');
//     btn.classList.remove('loading');
//     btn.disabled = false;
//   }
  // try {
  //   await Promise.allSettled([sendEmail(data), sendToSheet(data)]);
  //   sessionStorage.setItem('gx_app', JSON.stringify(data));
  //   window.location.href = `payment.html?order=${data.orderId}&amount=${data.amount}&name=${encodeURIComponent(data.holderName)}&scheme=${encodeURIComponent(data.applyFor)}`;
  // } catch (err) {
  //   console.error(err);
  //   Toast.error('Submission failed. Please try again.');
  //   btn.classList.remove('loading');
  //   btn.disabled = false;
  // }
// }

/* ══════════════════════════════════════════════
   PAYMENT PAGE
   ══════════════════════════════════════════════ */
function initPayment() {
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order') || 'GR' + Date.now().toString().slice(-10);
  const amount  = params.get('amount') || '1000';
  const name    = decodeURIComponent(params.get('name') || 'Applicant');
  const scheme  = decodeURIComponent(params.get('scheme') || 'LIG');

  const oid = document.getElementById('displayOrderId');
  const sch = document.getElementById('displayScheme');
  const amt = document.getElementById('displayAmount');
  if (oid) oid.textContent = orderId;
  if (sch) sch.textContent = `${scheme} Application`;

  // Animate amount
  if (amt) {
    const target = parseInt(amount);
    const start = performance.now();
    const run = now => {
      const p = Math.min((now - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      amt.textContent = Math.floor(ease * target).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(run);
      else amt.textContent = target.toLocaleString('en-IN');
    };
    requestAnimationFrame(run);
  }

  // WhatsApp link
  const waLink = document.getElementById('waLink');
  if (waLink) {
    const msg = encodeURIComponent(`Hello! I have completed payment for my Mansukh Group application.\n\nOrder ID: ${orderId}\nName: ${name}\nScheme: ${scheme}\nAmount: ₹${amount}\n\nPaying screenshot attached.`);
    waLink.href = `https://wa.me/${CFG.waNumber}?text=${msg}`;
  }

  // Copy bank
  const copyBtn = document.getElementById('btnCopyBank');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('ICICI Bank | A/C: 055005501503 | IFSC: ICIC0000550').then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = orig; copyBtn.classList.remove('copied'); }, 2000);
      });
    });
  }

  // Confirm button
  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const oid2 = document.getElementById('modalOrderId');
      const nm = document.getElementById('modalName');
      if (oid2) oid2.textContent = orderId;
      if (nm) nm.textContent = name;
      const modal = document.getElementById('successModal');
      if (modal) modal.classList.add('open');
    });
  }

  // Close modal on overlay click
  document.addEventListener('click', e => {
    if (e.target.id === 'successModal') e.target.classList.remove('open');
  });
}

/* ══════════════════════════════════════════════
   INIT ON DOM READY
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initRadioPills();

  // Init form if on apply page
  if (document.getElementById('sec-1')) goStep(1);

  // Init payment if on payment page
  if (document.getElementById('displayOrderId')) initPayment();
});




// Function to update Step 5 details based on Step 1 selection
function updateStep5Details() {
  const schemeSelector = document.getElementById('applyFor');
  const displayScheme = document.getElementById('displayScheme');
  const displayAmount = document.getElementById('displayAmount');

  // Get the selected scheme
  const selectedScheme = schemeSelector.value;

  // Determine the amount based on the selected scheme
  let amount = 0;
  if (selectedScheme === 'EWS') {
      amount = 500;
  } else if (selectedScheme === 'LIG') {
      amount = 1000;
  }

  // Update the placeholders in Step 5
  displayScheme.textContent = selectedScheme;
  displayAmount.textContent = `₹ ${amount}`;
}

// Add an event listener to the dropdown to update Step 5 when the value changes
document.getElementById('schemeSelector').addEventListener('change', updateStep5Details);

/*
════════════════════════════════════════════════════
  SETUP GUIDES
════════════════════════════════════════════════════

── EMAILJS SETUP ──
1. Go to https://www.emailjs.com → Sign up free
2. Add Email Service (Gmail/Outlook) → copy Service ID
3. Create Email Template with these variables:
   {{order_id}}, {{apply_for}}, {{holder_name}},
   {{gender}}, {{dob}}, {{email}}, {{mobile}},
   {{relation}}, {{father_name}}, {{id_type}}, {{id_no}},
   {{aadhar}}, {{address}}, {{category}},
   {{annual_income}}, {{amount}}, {{submitted_at}}
4. Copy Template ID & Public Key → paste into CFG above

── GOOGLE SHEETS SETUP ──
1. Create a new Google Sheet
2. Go to Extensions → Apps Script
3. Paste this code:

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = e.parameter;
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Order ID','Apply For','Name','Gender','DOB',
      'Email','Mobile','Relation','Father','ID Type','ID No',
      'Aadhar','Pin','City','State','Country','Address',
      'Category','Income','Amount','Date']);
  }
  sheet.appendRow([d.orderId,d.applyFor,d.holderName,d.gender,d.dob,
    d.email,d.mobile,d.relation,d.fatherName,d.idType,d.idNo,
    d.aadhar,d.pincode,d.city,d.state,d.country,d.address,
    d.category,d.annualIncome,d.amount,d.submittedAt]);
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

4. Click Deploy → New Deployment → Web App
   Execute as: Me | Who has access: Anyone
5. Copy the Web App URL → paste into CFG.sheetUrl above

════════════════════════════════════════════════════ */
