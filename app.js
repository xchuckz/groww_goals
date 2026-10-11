/**
 * Groww Goals - Main Application Router & Controller
 * Complete, responsive, interactive fintech prototype for Gen Z
 */

import {
  calcEMI, totalInterest, totalCost,
  sipFutureValue, sipRequired, sipRequiredWithLumpSum,
  lumpSumFV, swpSimulation,
  savingsAccountFV, savingsAccountLumpSumFV,
  breakEvenReturn, goalProgress, monthsUntil,
  formatINR, formatNumber, runTests
} from './math.js';

import {
  loadState, getState, setState, addGoal,
  updateGoal, getGoal, deleteGoal, addCheckin, clearAllGoals
} from './state.js';

// ─── Glossary Terms Data ──────────────────────────────────────────────────────
const GLOSSARY = {
  'SIP': 'Systematic Investment Plan. You invest a fixed sum on a set day each month into mutual funds. It averages out market highs and lows (rupee cost averaging) so you don\'t need to time the market.',
  'SWP': 'Systematic Withdrawal Plan. Allows you to withdraw a fixed sum from an investment periodically. Often used to fund loan EMIs or monthly expenses from an investment corpus.',
  'EMI': 'Equated Monthly Instalment. A fixed payment made by a borrower to a lender on a specified date every month. Covers both principal repayment and interest.',
  'Index Fund': 'A mutual fund that mirrors a benchmark index like Nifty 50 or Sensex. Very low expense ratios, automated portfolio management, and ideal for long-term compounding over 5+ years.',
  'Liquid Fund': 'Debt mutual fund that invests in very short-term money market instruments (up to 91 days). Extremely low risk and allows redemption within 24 hours. Ideal for emergency funds.',
  'Debt Fund': 'Mutual funds investing in government bonds, corporate debentures, and money market instruments. Less volatile than equity, suitable for 1-3 year time horizons.',
  'Hybrid Fund': 'Funds that invest in a balanced mix of equities (stocks) and debt. Provides moderate capital growth while cushioning against severe market drawdowns.',
  'LTCG': 'Long-Term Capital Gains Tax. Tax on investment gains held longer than a statutory threshold (e.g. 1 year for equity mutual funds at 12.5% for gains above ₹1.25 Lakh).',
  'FD': 'Fixed Deposit. Guaranteed fixed return investment with a scheduled bank. High capital safety up to ₹5 Lakh insurance per bank via DICGC.',
  'Emergency Fund': 'A dedicated cash buffer covering 3 to 6 months of essential living expenses (rent, food, EMIs, insurance). Kept strictly in liquid funds or sweep-in FDs.'
};

// ─── Router Navigation State ─────────────────────────────────────────────────
let routeStack = [{ route: 'goals', params: {} }];

function navigate(route, params = {}) {
  routeStack.push({ route, params });
  renderView(route, params);
  const main = document.getElementById('app-main');
  if (main) main.scrollTop = 0;
}

function goBack() {
  if (routeStack.length > 1) {
    routeStack.pop();
    const prev = routeStack[routeStack.length - 1];
    renderView(prev.route, prev.params || {});
  } else {
    routeStack = [{ route: 'goals', params: {} }];
    renderView('goals', {});
  }
  const main = document.getElementById('app-main');
  if (main) main.scrollTop = 0;
}

// ─── Toast System ─────────────────────────────────────────────────────────────
function showToast(message, icon = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconHtml = icon ? `<span style="color:var(--groww-primary);font-size:16px">${icon}</span>` : '';
  toast.innerHTML = `${iconHtml}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── App Initialization ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();
  applyTheme(state.theme || 'dark');
  setupGlobalEvents();
  renderView('goals');
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  setState({ theme });
}

function setupGlobalEvents() {
  // Logo returns to Goals Home
  document.getElementById('logo-home')?.addEventListener('click', () => {
    routeStack = [{ route: 'goals', params: {} }];
    updateBottomNav('goals');
    renderView('goals');
  });

  // Theme Toggle
  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`Switched to ${next} theme`, '');
  });

  // Profile Header Button
  document.getElementById('header-profile-btn')?.addEventListener('click', () => {
    updateBottomNav('profile');
    navigate('profile');
  });

  // Bottom Navigation
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      updateBottomNav(tab);
      routeStack = [{ route: tab, params: {} }];
      renderView(tab);
    });
  });

  // Modal Closers
  document.getElementById('modal-close')?.addEventListener('click', closeGlossaryModal);
  document.getElementById('term-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('term-modal')) closeGlossaryModal();
  });

  document.getElementById('sip-modal-close')?.addEventListener('click', closeSIPModal);
  document.getElementById('sip-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('sip-modal')) closeSIPModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeGlossaryModal();
      closeSIPModal();
    }
  });
}

function updateBottomNav(tab) {
  document.querySelectorAll('.bottom-nav .nav-item').forEach(b => {
    const isActive = b.dataset.tab === tab;
    b.classList.toggle('active', isActive);
  });
}

// ─── Main View Dispatcher ─────────────────────────────────────────────────────
function renderView(route, params = {}) {
  const main = document.getElementById('app-main');
  if (!main) return;

  switch (route) {
    case 'goals':
      renderGoalsDashboard(main);
      break;
    case 'flow-save-general':
      renderFlowSaveGeneral(main);
      break;
    case 'flow-save-general-result':
      renderFlowSaveGeneralResult(main, params);
      break;
    case 'flow-save-goal':
      renderFlowSaveGoal(main, params);
      break;
    case 'flow-save-goal-result':
      renderFlowSaveGoalResult(main, params);
      break;
    case 'flow-purchase-compare':
      renderFlowPurchaseCompare(main, params);
      break;
    case 'flow-purchase-compare-result':
      renderFlowPurchaseCompareResult(main, params);
      break;
    case 'goal-detail':
      renderGoalDetail(main, params);
      break;
    case 'stocks':
      renderStocksMock(main);
      break;
    case 'mutual-funds':
      renderMutualFundsMock(main);
      break;
    case 'fds':
      renderFDsMock(main);
      break;
    case 'profile':
      renderProfileView(main);
      break;
    default:
      renderGoalsDashboard(main);
  }

  attachGlossaryHandlers(main);
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. GOALS HOME DASHBOARD (First Screen: What do you want to do?)
// ══════════════════════════════════════════════════════════════════════════════
function renderGoalsDashboard(main) {
  const state = getState();
  const goals = state.goals || [];

  let html = `
    <div class="view-container">
      <div class="hero-header">
        <div class="hero-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Groww Goals Hub
        </div>
        <h1 class="hero-title">What do you want to do?</h1>
        <p class="hero-subtitle">Choose how you'd like to plan your money. No confusing jargon, just actionable numbers.</p>
      </div>

      <!-- Core 3 Paths Requested by User -->
      <div class="intent-cards-container">
        <!-- Path 1: Save money(no specific goal) -->
        <div class="intent-card intent-save" id="card-intent-save" role="button" tabindex="0">
          <div class="intent-icon-wrap"></div>
          <div class="intent-info">
            <h2 class="intent-title">Save money(no specific goal)</h2>
            <p class="intent-desc">I don't have a specific plan in yet. Help me build a smart monthly savings split (emergency fund, debt & index funds).</p>
          </div>
          <div class="intent-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- Path 2: Saving for any goal -->
        <div class="intent-card intent-goal" id="card-intent-goal" role="button" tabindex="0">
          <div class="intent-icon-wrap"></div>
          <div class="intent-info">
            <h2 class="intent-title">Saving for a specific goal</h2>
            <p class="intent-desc">I'm saving for a car, house down payment, laptop, trip or wedding. Work out my exact monthly SIP and realistic outcomes.</p>
          </div>
          <div class="intent-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- Path 3: Want to purchase something (have the money) -->
        <div class="intent-card intent-purchase" id="card-intent-purchase" role="button" tabindex="0">
          <div class="intent-icon-wrap"></div>
          <div class="intent-info">
            <h2 class="intent-title">buy something(capital available)</h2>
            <p class="intent-desc">I have the money right now. Should I pay 100% upfront in cash, take a loan, or invest the rest in mutual funds?</p>
          </div>
          <div class="intent-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
  `;

  // Active Goals Section (if user has created goals)
  if (goals.length > 0) {
    html += `
      <div class="goals-dashboard-section">
        <div class="section-title-wrap">
          <h2 class="section-heading">Your Active Goals (${goals.length})</h2>
          <button class="section-action-link" id="btn-add-another-goal">+ Add Goal</button>
        </div>
        <div class="goals-list">
          ${goals.map(g => renderGoalDashboardCard(g)).join('')}
        </div>
      </div>
    `;
  }

  // Quick Educational Knowledge Chips
  html += `
      <div style="margin-top:20px;padding:16px 18px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);">
        <p style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Quick Financial Explainers</p>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">
          Tap any term to understand how it works:
          <span class="term-tag" data-term="SIP">SIP</span>,
          <span class="term-tag" data-term="SWP">SWP</span>,
          <span class="term-tag" data-term="Index Fund">Index Funds</span>,
          <span class="term-tag" data-term="Liquid Fund">Liquid Funds</span>,
          <span class="term-tag" data-term="LTCG">LTCG Tax</span>.
        </p>
      </div>
    </div>
  `;

  main.innerHTML = html;

  // Event Listeners for the 3 Primary Paths
  document.getElementById('card-intent-save')?.addEventListener('click', () => navigate('flow-save-general'));
  document.getElementById('card-intent-goal')?.addEventListener('click', () => navigate('flow-save-goal'));
  document.getElementById('card-intent-purchase')?.addEventListener('click', () => navigate('flow-purchase-compare'));
  document.getElementById('btn-add-another-goal')?.addEventListener('click', () => navigate('flow-save-goal'));

  // Goal Cards Click
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      const gid = card.dataset.goalId;
      navigate('goal-detail', { goalId: gid });
    });
  });
}

function renderGoalDashboardCard(g) {
  const pct = goalProgress(g.currentAmount, g.targetAmount);
  const statusClass = pct >= 75 ? 'status-on-track' : pct >= 40 ? 'status-behind' : 'status-at-risk';
  const statusLabel = pct >= 75 ? 'On Track' : pct >= 40 ? 'Moderate Pace' : 'Needs Boost';

  const iconMap = {
    'Car': '', 'House': '', 'Laptop': '', 'Trip': '',
    'Emergency Fund': '', 'Education': '', 'Wedding': '', 'Other': '', 'General Wealth': ''
  };
  const icon = iconMap[g.category] || iconMap[g.name];

  return `
    <div class="goal-card" data-goal-id="${g.id}">
      <div class="goal-card-header">
        <div class="goal-icon-name">
          <div class="goal-badge-icon">${icon}</div>
          <div>
            <div class="goal-name">${escapeHTML(g.name)}</div>
            <div class="goal-target-date">${g.targetMonths ? `${g.targetMonths} months timeline` : (g.targetDate ? `Target: ${formatDate(g.targetDate)}` : 'Flexible plan')}</div>
          </div>
        </div>
        <span class="status-pill ${statusClass}">${statusLabel}</span>
      </div>

      <div class="goal-numbers-row">
        <div>
          <span style="font-size:11px;color:var(--text-muted);display:block">Saved So Far</span>
          <span class="goal-saved-val">${formatINR(g.currentAmount)}</span>
        </div>
        <div style="text-align:right">
          <span style="font-size:11px;color:var(--text-muted);display:block">Target Goal</span>
          <span class="goal-target-val">${formatINR(g.targetAmount)}</span>
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-fill" style="width:${pct.toFixed(1)}%"></div>
      </div>

      <div class="progress-milestones-row">
        <span class="milestone-item ${pct >= 25 ? 'achieved' : ''}">25%</span>
        <span class="milestone-item ${pct >= 50 ? 'achieved' : ''}">50%</span>
        <span class="milestone-item ${pct >= 75 ? 'achieved' : ''}">75%</span>
        <span class="milestone-item ${pct >= 100 ? 'achieved' : ''}">100%</span>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. FLOW 1: "SAVE MONEY JUST LIKE THAT" (General Wealth & Category Split)
// ══════════════════════════════════════════════════════════════════════════════
function renderFlowSaveGeneral(main) {
  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to options
      </button>

      <div class="hero-header">
        <div class="hero-tag">Path 1 • Wealth Builder</div>
        <h1 class="hero-title">Save money just like that</h1>
        <p class="hero-subtitle">You have income to spare and want to start investing. Tell us a bit about your situation, and we'll create a balanced category split.</p>
      </div>

      <div class="form-card">
        <!-- Monthly Amount Input -->
        <div class="form-group">
          <label class="form-label" for="f1-amount">
            <span>How much can you comfortably invest each month?</span>
          </label>
          <div class="input-container">
            <span class="input-prefix">₹</span>
            <input class="form-input has-prefix" type="number" id="f1-amount" placeholder="Enter monthly amount" inputmode="numeric">
          </div>
          <!-- Quick Selection Chips (User can tap or type, no prefilled default!) -->
          <div class="chips-row" id="f1-amount-chips">
            <button type="button" class="chip-btn" data-val="2000">₹2,000</button>
            <button type="button" class="chip-btn" data-val="5000">₹5,000</button>
            <button type="button" class="chip-btn" data-val="10000">₹10,000</button>
            <button type="button" class="chip-btn" data-val="25000">₹25,000</button>
            <button type="button" class="chip-btn" data-val="50000">₹50,000</button>
          </div>
        </div>

        <!-- Age Input -->
        <div class="form-group">
          <label class="form-label" for="f1-age">
            <span>Your current age</span>
            <span class="form-label-optional">(Helps calculate equity heuristic)</span>
          </label>
          <input class="form-input" type="number" id="f1-age" placeholder="Enter your age (e.g. 23)" min="18" max="75" inputmode="numeric">
          <div class="chips-row" id="f1-age-chips">
            <button type="button" class="chip-btn" data-val="21">21 yrs</button>
            <button type="button" class="chip-btn" data-val="23">23 yrs</button>
            <button type="button" class="chip-btn" data-val="25">25 yrs</button>
            <button type="button" class="chip-btn" data-val="28">28 yrs</button>
            <button type="button" class="chip-btn" data-val="32">32 yrs</button>
          </div>
        </div>

        <!-- Risk Preference -->
        <div class="form-group">
          <label class="form-label">
            <span>How comfortable are you with market swings?</span>
          </label>
          <div class="chips-row" id="f1-risk-chips" style="margin-top:0">
            <button type="button" class="chip-btn" data-risk="low" style="flex:1;text-align:center">Cautious (Safety first)</button>
            <button type="button" class="chip-btn active" data-risk="medium" style="flex:1;text-align:center">Balanced (Moderate growth)</button>
            <button type="button" class="chip-btn" data-risk="high" style="flex:1;text-align:center">Aggressive (Maximum wealth)</button>
          </div>
        </div>

        <div id="f1-error" style="color:var(--status-danger);font-size:13px;font-weight:600;margin-bottom:14px;display:none"></div>

        <button class="btn btn-primary" id="f1-submit">
          Generate My Savings Split
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  // Setup Chips Click Listeners for Amount
  setupChipGroup('f1-amount-chips', val => {
    const input = document.getElementById('f1-amount');
    if (input) input.value = val;
  });

  // Setup Chips for Age
  setupChipGroup('f1-age-chips', val => {
    const input = document.getElementById('f1-age');
    if (input) input.value = val;
  });

  // Setup Chips for Risk
  let selectedRisk = 'medium';
  document.querySelectorAll('#f1-risk-chips .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#f1-risk-chips .chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRisk = btn.dataset.risk;
    });
  });

  // Submit Handler
  document.getElementById('f1-submit')?.addEventListener('click', () => {
    const amountVal = parseFloat(document.getElementById('f1-amount').value);
    const ageVal = parseInt(document.getElementById('f1-age').value);
    const errEl = document.getElementById('f1-error');

    if (!amountVal || amountVal < 500) {
      errEl.textContent = 'Please enter a monthly investment amount of at least ₹500.';
      errEl.style.display = 'block';
      return;
    }
    if (!ageVal || ageVal < 18 || ageVal > 90) {
      errEl.textContent = 'Please enter a valid age between 18 and 90.';
      errEl.style.display = 'block';
      return;
    }

    errEl.style.display = 'none';
    navigate('flow-save-general-result', { amount: amountVal, age: ageVal, risk: selectedRisk });
  });
}

function renderFlowSaveGeneralResult(main, p) {
  const { amount, age, risk } = p;

  // Calculate allocation
  let equityPct = Math.max(20, Math.min(80, 100 - age));
  if (risk === 'low') equityPct = Math.max(15, equityPct - 20);
  if (risk === 'high') equityPct = Math.min(85, equityPct + 15);

  const emergencyPct = 20; // 20% in liquid emergency
  const goldPct = 10;      // 10% in sovereign gold / gold ETF
  const debtPct = Math.max(10, 100 - equityPct - emergencyPct - goldPct);

  const categories = [
    { name: 'Equity / Index Funds', pct: equityPct, desc: 'Nifty 50 & Flexi Cap for compounding', returnRate: 12, icon: '', term: 'Index Fund' },
    { name: 'Emergency Cushion', pct: emergencyPct, desc: 'Liquid funds or sweep-in FD (instant access)', returnRate: 4.5, icon: '', term: 'Liquid Fund' },
    { name: 'Debt & Stability', pct: debtPct, desc: 'Short-duration debt & corporate bonds', returnRate: 7, icon: '', term: 'Debt Fund' },
    { name: 'Gold Hedge', pct: goldPct, desc: 'Gold ETF / sovereign gold funds', returnRate: 6, icon: '', term: null },
  ];

  // Blended projected return
  const blendedRate = (equityPct * 12 + emergencyPct * 4.5 + debtPct * 7 + goldPct * 6) / 100;

  // Projected values over time
  const fv1Year = sipFutureValue(amount, blendedRate, 12);
  const fv3Years = sipFutureValue(amount, blendedRate, 36);
  const fv5Years = sipFutureValue(amount, blendedRate, 60);
  const fv10Years = sipFutureValue(amount, blendedRate, 120);

  // Comparison vs savings account
  const savFV5Years = savingsAccountFV(amount, 60, 3.5);
  const diff5Years = fv5Years - savFV5Years;

  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back
      </button>

      <div class="result-banner-card">
        <div class="result-target-label">Personalized Monthly Allocation</div>
        <div class="result-target-value">${formatINR(amount)} <span style="font-size:16px;font-weight:600;color:var(--text-secondary)">/ month</span></div>
        <div class="result-target-meta">Based on age ${age} • ${risk === 'low' ? 'Cautious' : risk === 'high' ? 'Aggressive' : 'Balanced'} profile • Blended ~${blendedRate.toFixed(1)}% p.a.</div>
      </div>

      <!-- Category Split -->
      <div class="form-card" style="padding:18px 20px;margin-bottom:20px">
        <h3 style="font-size:16px;font-weight:700;color:var(--text-main);margin-bottom:14px">Recommended Split</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${categories.map(c => {
    const monthlyShare = Math.round((amount * c.pct) / 100);
    return `
              <div style="background:var(--bg-surface-elevated);border-radius:var(--radius-md);padding:12px 14px;border:1px solid var(--border-subtle)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:18px">${c.icon}</span>
                    <strong style="font-size:14px;color:var(--text-main)">${escapeHTML(c.name)}</strong>
                    ${c.term ? `<span class="term-tag" data-term="${c.term}" style="font-size:11px">what's this?</span>` : ''}
                  </div>
                  <div style="text-align:right">
                    <span style="font-size:15px;font-weight:800;color:var(--groww-primary)">${formatINR(monthlyShare)}</span>
                    <span style="font-size:11px;color:var(--text-muted);display:block">${c.pct}% of total</span>
                  </div>
                </div>
                <p style="font-size:12px;color:var(--text-muted)">${escapeHTML(c.desc)} • Assumed ~${c.returnRate}% p.a.</p>
              </div>
            `;
  }).join('')}
        </div>
      </div>

      <!-- Growth Projection Grid -->
      <div class="section-title-wrap">
        <h3 class="section-heading">Projected Wealth Over Time</h3>
      </div>
      <div class="stats-grid-2">
        <div class="stat-box">
          <div class="stat-box-label">1 Year (12 months)</div>
          <div class="stat-box-value">${formatINR(fv1Year)}</div>
          <div class="stat-box-sub">Invested: ${formatINR(amount * 12)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">3 Years (36 months)</div>
          <div class="stat-box-value">${formatINR(fv3Years)}</div>
          <div class="stat-box-sub">Invested: ${formatINR(amount * 36)}</div>
        </div>
        <div class="stat-box featured">
          <div class="stat-box-label">5 Years (60 months)</div>
          <div class="stat-box-value" style="color:var(--groww-primary)">${formatINR(fv5Years)}</div>
          <div class="stat-box-sub">Gain vs savings a/c: +${formatINR(diff5Years)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">10 Years (120 months)</div>
          <div class="stat-box-value">${formatINR(fv10Years)}</div>
          <div class="stat-box-sub">Invested: ${formatINR(amount * 120)}</div>
        </div>
      </div>

      <!-- Ordered Steps -->
      <div class="section-title-wrap">
        <h3 class="section-heading">How to execute this step-by-step</h3>
      </div>
      <div class="steps-checklist">
        <div class="step-item">
          <div class="step-num">1</div>
          <div>
            <div class="step-content-title">Fund Emergency Buffer First</div>
            <div class="step-content-desc">Keep your first 3 months of savings in a Liquid Fund or high-yield savings a/c before locking money into equities.</div>
          </div>
        </div>
        <div class="step-item">
          <div class="step-num">2</div>
          <div>
            <div class="step-content-title">Automate on Salary Day</div>
            <div class="step-content-desc">Set your auto-debit 1 to 2 days after payday so you invest before spending.</div>
          </div>
        </div>
        <div class="step-item">
          <div class="step-num">3</div>
          <div>
            <div class="step-content-title">Annual 10% Step-Up</div>
            <div class="step-content-desc">Whenever your salary increases, increase your monthly investment by 10% to double your 5-year corpus.</div>
          </div>
        </div>
      </div>

      <div class="disclaimer-box">
        <strong>Important note on market risk:</strong> Equity portions fluctuate day-to-day and can have negative returns over short 1-2 year periods. This plan assumes disciplined monthly investing over at least 3-5 years.
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
        <button class="btn btn-primary" id="btn-save-as-goal">
          Save this Wealth Plan to My Goals
        </button>
        <button class="btn btn-secondary" id="btn-start-sip-general">
          Set up Monthly AutoPay SIP
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  document.getElementById('btn-save-as-goal')?.addEventListener('click', () => {
    addGoal({
      name: 'General Wealth Builder',
      category: 'General Wealth',
      targetAmount: Math.round(fv5Years),
      alreadySaved: 0,
      monthlySip: amount,
      targetMonths: 60,
      riskLevel: risk,
      flow: 'flow-save-general'
    });
    showToast('Goal saved! You can track your progress anytime.', '');
    routeStack = [{ route: 'goals', params: {} }];
    renderView('goals');
  });

  document.getElementById('btn-start-sip-general')?.addEventListener('click', () => {
    openSIPModal({
      title: 'General Wealth SIP',
      amount: amount,
      category: 'Diversified Index & Liquid Plan'
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. FLOW 2: "SAVING FOR A SPECIFIC GOAL" (Car, House, Laptop, Trip, etc.)
// ══════════════════════════════════════════════════════════════════════════════
const GOAL_PRESETS = [
  { id: 'Car', name: 'Car / Vehicle', icon: '', defaultTenure: 36 },
  { id: 'House', name: 'House Downpayment', icon: '', defaultTenure: 60 },
  { id: 'Laptop', name: 'Laptop / Tech', icon: '', defaultTenure: 12 },
  { id: 'Trip', name: 'Vacation / Travel', icon: '', defaultTenure: 12 },
  { id: 'Emergency Fund', name: 'Emergency Fund', icon: '', defaultTenure: 12 },
  { id: 'Education', name: 'Higher Education', icon: '', defaultTenure: 24 },
  { id: 'Wedding', name: 'Wedding / Event', icon: '', defaultTenure: 36 },
  { id: 'Custom', name: 'Custom Goal', icon: '', defaultTenure: 24 }
];

function renderFlowSaveGoal(main, params = {}) {
  let selectedGoal = params.goalType || 'Car';
  let customGoalName = '';

  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to options
      </button>

      <div class="hero-header">
        <div class="hero-tag">Path 2 • Goal Planner</div>
        <h1 class="hero-title">Saving for a specific goal</h1>
        <p class="hero-subtitle">Pick what you're saving for, set your target amount and timeframe, and get a realistic roadmap.</p>
      </div>

      <div class="form-card">
        <!-- 1. Pick Goal Type -->
        <div class="form-group">
          <label class="form-label">
            <span>What are you saving for?</span>
          </label>
          <div class="goal-type-grid" id="goal-type-grid">
            ${GOAL_PRESETS.map(g => `
              <div class="goal-type-card ${g.id === selectedGoal ? 'selected' : ''}" data-goal-id="${g.id}">
                <span class="goal-type-icon">${g.icon}</span>
                <span class="goal-type-name">${g.name}</span>
              </div>
            `).join('')}
          </div>
          <div id="custom-goal-wrap" style="display:${selectedGoal === 'Custom' ? 'block' : 'none'};margin-top:10px">
            <input class="form-input" type="text" id="custom-goal-input" placeholder="Type your custom goal name (e.g. Dream Camera)">
          </div>
        </div>

        <!-- 2. Target Amount -->
        <div class="form-group">
          <label class="form-label" for="f2-target-amount">
            <span>Target amount needed</span>
          </label>
          <div class="input-container">
            <span class="input-prefix">₹</span>
            <input class="form-input has-prefix" type="number" id="f2-target-amount" placeholder="Enter target amount" inputmode="numeric">
          </div>
          <!-- Quick Amount Chips (User can tap to populate or type custom) -->
          <div class="chips-row" id="f2-amount-chips">
            <button type="button" class="chip-btn" data-val="50000">₹50K</button>
            <button type="button" class="chip-btn" data-val="100000">₹1 Lakh</button>
            <button type="button" class="chip-btn" data-val="300000">₹3 Lakhs</button>
            <button type="button" class="chip-btn" data-val="500000">₹5 Lakhs</button>
            <button type="button" class="chip-btn" data-val="1000000">₹10 Lakhs</button>
            <button type="button" class="chip-btn" data-val="2500000">₹25 Lakhs</button>
          </div>
        </div>

        <!-- 3. Time Horizon (Tenure) -->
        <div class="form-group">
          <label class="form-label" for="f2-months">
            <span>When do you need this money?</span>
          </label>
          <div class="chips-row" id="f2-tenure-chips" style="margin-top:0;margin-bottom:10px">
            <button type="button" class="chip-btn" data-months="6">6 Months</button>
            <button type="button" class="chip-btn" data-months="12">1 Year</button>
            <button type="button" class="chip-btn" data-months="24">2 Years</button>
            <button type="button" class="chip-btn active" data-months="36">3 Years</button>
            <button type="button" class="chip-btn" data-months="60">5 Years</button>
            <button type="button" class="chip-btn" data-months="84">7 Years</button>
          </div>
          <input class="form-input" type="number" id="f2-custom-months" placeholder="Or enter exact months (e.g. 36)" min="1" max="360" inputmode="numeric" value="36">
        </div>

        <!-- 4. Amount Already Saved (Optional) -->
        <div class="form-group">
          <label class="form-label" for="f2-already-saved">
            <span>Amount already saved today</span>
            <span class="form-label-optional">(Optional, default ₹0)</span>
          </label>
          <div class="input-container">
            <span class="input-prefix">₹</span>
            <input class="form-input has-prefix" type="number" id="f2-already-saved" placeholder="Enter existing savings if any" inputmode="numeric">
          </div>
        </div>

        <div id="f2-error" style="color:var(--status-danger);font-size:13px;font-weight:600;margin-bottom:14px;display:none"></div>

        <button class="btn btn-primary" id="f2-submit">
          Calculate My Monthly Plan
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  // Goal Grid Click Listener
  document.querySelectorAll('#goal-type-grid .goal-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#goal-type-grid .goal-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedGoal = card.dataset.goalId;

      const customWrap = document.getElementById('custom-goal-wrap');
      if (customWrap) {
        customWrap.style.display = selectedGoal === 'Custom' ? 'block' : 'none';
      }
    });
  });

  // Amount Chips
  setupChipGroup('f2-amount-chips', val => {
    const input = document.getElementById('f2-target-amount');
    if (input) input.value = val;
  });

  // Tenure Chips
  setupChipGroup('f2-tenure-chips', months => {
    const input = document.getElementById('f2-custom-months');
    if (input) input.value = months;
  });

  // Submit Handler
  document.getElementById('f2-submit')?.addEventListener('click', () => {
    const targetAmount = parseFloat(document.getElementById('f2-target-amount').value);
    const months = parseInt(document.getElementById('f2-custom-months').value);
    const alreadySaved = parseFloat(document.getElementById('f2-already-saved').value) || 0;
    const customInput = document.getElementById('custom-goal-input');
    const finalGoalName = selectedGoal === 'Custom' ? (customInput?.value?.trim() || 'Custom Goal') : selectedGoal;

    const errEl = document.getElementById('f2-error');
    if (!targetAmount || targetAmount <= 0) {
      errEl.textContent = 'Please enter a valid target goal amount.';
      errEl.style.display = 'block';
      return;
    }
    if (!months || months <= 0) {
      errEl.textContent = 'Please specify a target timeframe in months.';
      errEl.style.display = 'block';
      return;
    }
    if (alreadySaved >= targetAmount) {
      errEl.textContent = 'You already have enough saved to reach this goal!';
      errEl.style.display = 'block';
      return;
    }

    errEl.style.display = 'none';
    navigate('flow-save-goal-result', {
      name: finalGoalName,
      category: selectedGoal,
      targetAmount,
      months,
      alreadySaved
    });
  });
}

function renderFlowSaveGoalResult(main, p) {
  const { name, category, targetAmount, months, alreadySaved } = p;

  // Rate scenarios based on timeline
  let conservativeRate = 6.5; // Debt/FD
  let expectedRate = 10.0;    // Hybrid/Index
  let aggressiveRate = 13.0;  // Equity/MidCap

  if (months < 12) {
    conservativeRate = 5.0; expectedRate = 6.5; aggressiveRate = 7.0;
  } else if (months < 36) {
    conservativeRate = 6.5; expectedRate = 8.5; aggressiveRate = 10.5;
  }

  // Calculate monthly SIP needed
  const sipConservative = sipRequiredWithLumpSum(targetAmount, alreadySaved, conservativeRate, months);
  const sipExpected = sipRequiredWithLumpSum(targetAmount, alreadySaved, expectedRate, months);
  const sipAggressive = sipRequiredWithLumpSum(targetAmount, alreadySaved, aggressiveRate, months);

  // If left in a standard savings account (3.5%)
  const savingsFV = savingsAccountFV(sipExpected, months, 3.5);
  const investedFV = sipFutureValue(sipExpected, expectedRate, months);

  // Recommended Fund Category based on tenure
  let catRecommendation = '';
  let catWhy = '';
  if (months < 12) {
    catRecommendation = 'Liquid Funds or High-Yield Bank FDs';
    catWhy = 'Because your timeframe is under 1 year, capital preservation is paramount. Avoid equities completely.';
  } else if (months < 36) {
    catRecommendation = 'Short Duration Debt Funds / Arbitrage Funds';
    catWhy = 'Provides 7-8% post-tax potential with minimal price volatility for a 1 to 3 year goal.';
  } else if (months < 60) {
    catRecommendation = 'Balanced Advantage / Hybrid Mutual Funds';
    catWhy = 'Dynamic mix of equity and debt provides capital appreciation while protecting downside.';
  } else {
    catRecommendation = 'Nifty 50 Index Funds + Flexi Cap Equity Funds';
    catWhy = 'Over 5+ years, equities historically deliver inflation-beating wealth with reduced timing risk.';
  }

  // Stress test: What if market drops 15% right before the goal?
  const dipShortfall = targetAmount * 0.15;
  const bufferTip = months > 24
    ? 'Since your goal is over 2 years away, short-term dips are normal. Simply stay invested or switch to debt in the final 6 months.'
    : 'Since your goal is near, shift profits into liquid funds 3-6 months before your target date to prevent last-minute drops.';

  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to form
      </button>

      <div class="result-banner-card">
        <div class="result-target-label">Goal Target: ${escapeHTML(name)}</div>
        <div class="result-target-value">${formatINR(targetAmount)}</div>
        <div class="result-target-meta">Target Date: in ${months} months (${(months / 12).toFixed(1)} yrs)${alreadySaved > 0 ? ` • ${formatINR(alreadySaved)} already saved` : ''}</div>
      </div>

      <!-- Monthly SIP Required Cards -->
      <div class="section-title-wrap">
        <h3 class="section-heading">Monthly Amount You Need to Invest</h3>
      </div>
      <div class="stats-grid-2">
        <div class="stat-box">
          <div class="stat-box-label">Conservative (${conservativeRate}% p.a.)</div>
          <div class="stat-box-value">${formatINR(sipConservative)}</div>
          <div class="stat-box-sub">Safest (Debt/FD focus)</div>
        </div>
        <div class="stat-box featured">
          <div class="stat-box-label">Expected (${expectedRate}% p.a.)</div>
          <div class="stat-box-value" style="color:var(--groww-primary)">${formatINR(sipExpected)}</div>
          <div class="stat-box-sub">Balanced Mutual Funds</div>
        </div>
      </div>

      <!-- Fund Category Guidance -->
      <div class="form-card" style="padding:18px 20px;margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:var(--groww-primary);text-transform:uppercase;margin-bottom:6px">Where to put this money</div>
        <h4 style="font-size:16px;font-weight:800;color:var(--text-main);margin-bottom:8px">${catRecommendation}</h4>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.5">${catWhy}</p>
      </div>

      <!-- Cost of Doing Nothing -->
      <div class="form-card" style="padding:18px 20px;margin-bottom:20px;border-color:rgba(56, 126, 209, 0.3)">
        <h4 style="font-size:15px;font-weight:700;color:var(--text-main);margin-bottom:8px">Investing vs Leaving in Savings Account</h4>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.5">
          Putting <strong>${formatINR(sipExpected)}/mo</strong> in a regular savings account (3.5% p.a.) yields <strong>${formatINR(savingsFV)}</strong>.<br>
          Investing in this plan yields <strong>${formatINR(investedFV)}</strong>.<br>
          <span style="color:var(--groww-primary);font-weight:700">Difference: +${formatINR(investedFV - savingsFV)} extra wealth created.</span>
        </p>
      </div>

      <!-- Market Dip Stress Test Card -->
      <div class="form-card" style="padding:18px 20px;margin-bottom:20px;background:rgba(239, 68, 68, 0.05);border-color:rgba(239, 68, 68, 0.25)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:16px"></span>
          <strong style="font-size:14px;color:var(--status-danger)">Stress Test: What if the market falls 15%?</strong>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-bottom:8px">
          A 15% market drawdown could temporarily reduce your corpus by ~${formatINR(dipShortfall)}.
        </p>
        <p style="font-size:12px;color:var(--text-main);line-height:1.4">
          <strong>Protective Strategy:</strong> ${bufferTip}
        </p>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" id="btn-save-goal">
          Save This Goal & Track Progress
        </button>
        <button class="btn btn-secondary" id="btn-start-sip-goal">
          Start Monthly SIP (${formatINR(sipExpected)}/mo)
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  document.getElementById('btn-save-goal')?.addEventListener('click', () => {
    addGoal({
      name,
      category,
      targetAmount,
      alreadySaved,
      monthlySip: sipExpected,
      targetMonths: months,
      flow: 'flow-save-goal'
    });
    showToast(`"${name}" goal saved to your dashboard!`, '');
    routeStack = [{ route: 'goals', params: {} }];
    renderView('goals');
  });

  document.getElementById('btn-start-sip-goal')?.addEventListener('click', () => {
    openSIPModal({
      title: `${name} Goal SIP`,
      amount: sipExpected,
      category: catRecommendation
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. FLOW 3: "I HAVE THE MONEY TO PURCHASE SOMETHING" (Cash vs Loan vs Invest)
// ══════════════════════════════════════════════════════════════════════════════
function renderFlowPurchaseCompare(main, params = {}) {
  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to options
      </button>

      <div class="hero-header">
        <div class="hero-tag">Path 3 • Purchase Decision Engine</div>
        <h1 class="hero-title">I have the money to buy something</h1>
        <p class="hero-subtitle">You have the cash in hand. Should you pay 100% upfront, take a loan, or keep your cash invested in mutual funds and pay EMIs?</p>
      </div>

      <div class="form-card">
        <!-- What are you buying? -->
        <div class="form-group">
          <label class="form-label" for="f3-item-name">
            <span>What are you purchasing?</span>
          </label>
          <input class="form-input" type="text" id="f3-item-name" placeholder="e.g. Car, Bike, MacBook, Furniture" value="Car">
        </div>

        <!-- Total Price -->
        <div class="form-group">
          <label class="form-label" for="f3-price">
            <span>Total purchase price</span>
          </label>
          <div class="input-container">
            <span class="input-prefix">₹</span>
            <input class="form-input has-prefix" type="number" id="f3-price" placeholder="Enter total purchase price" inputmode="numeric">
          </div>
          <div class="chips-row" id="f3-price-chips">
            <button type="button" class="chip-btn" data-val="100000">₹1 Lakh</button>
            <button type="button" class="chip-btn" data-val="300000">₹3 Lakhs</button>
            <button type="button" class="chip-btn" data-val="800000">₹8 Lakhs</button>
            <button type="button" class="chip-btn" data-val="1500000">₹15 Lakhs</button>
            <button type="button" class="chip-btn" data-val="5000000">₹50 Lakhs</button>
          </div>
        </div>

        <!-- Cash Available -->
        <div class="form-group">
          <label class="form-label" for="f3-cash">
            <span>Cash you currently have available</span>
          </label>
          <div class="input-container">
            <span class="input-prefix">₹</span>
            <input class="form-input has-prefix" type="number" id="f3-cash" placeholder="Enter cash in hand" inputmode="numeric">
          </div>
          <div class="chips-row" id="f3-cash-chips">
            <button type="button" class="chip-btn" data-ratio="1.0">100% of price</button>
            <button type="button" class="chip-btn" data-ratio="0.75">75% of price</button>
            <button type="button" class="chip-btn" data-ratio="0.5">50% of price</button>
          </div>
        </div>

        <!-- Loan Interest Rate -->
        <div class="form-group">
          <label class="form-label" for="f3-loan-rate">
            <span>Bank loan interest rate (% p.a.)</span>
          </label>
          <input class="form-input" type="number" id="f3-loan-rate" placeholder="e.g. 9.5" step="0.1" inputmode="decimal" value="9.0">
          <div class="chips-row" id="f3-rate-chips">
            <button type="button" class="chip-btn" data-val="8.5">8.5% (Car Loan)</button>
            <button type="button" class="chip-btn active" data-val="9.0">9.0% (Standard)</button>
            <button type="button" class="chip-btn" data-val="11.0">11.0% (Personal/Gadget)</button>
            <button type="button" class="chip-btn" data-val="13.0">13.0%</button>
          </div>
        </div>

        <!-- Loan Tenure -->
        <div class="form-group">
          <label class="form-label">
            <span>Loan repayment tenure</span>
          </label>
          <div class="chips-row" id="f3-tenure-chips" style="margin-top:0">
            <button type="button" class="chip-btn" data-months="12">1 Year</button>
            <button type="button" class="chip-btn" data-months="24">2 Years</button>
            <button type="button" class="chip-btn" data-months="36">3 Years</button>
            <button type="button" class="chip-btn active" data-months="60">5 Years</button>
            <button type="button" class="chip-btn" data-months="84">7 Years</button>
          </div>
          <input type="hidden" id="f3-tenure" value="60">
        </div>

        <div id="f3-error" style="color:var(--status-danger);font-size:13px;font-weight:600;margin-bottom:14px;display:none"></div>

        <button class="btn btn-primary" id="f3-submit">
          Compare the 3 Paths Now
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  // Setup chips for price
  setupChipGroup('f3-price-chips', val => {
    const input = document.getElementById('f3-price');
    if (input) input.value = val;
  });

  // Setup chips for cash relative to price
  document.querySelectorAll('#f3-cash-chips .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const priceVal = parseFloat(document.getElementById('f3-price').value) || 0;
      const ratio = parseFloat(btn.dataset.ratio);
      const cashInput = document.getElementById('f3-cash');
      if (priceVal > 0 && cashInput) {
        cashInput.value = Math.round(priceVal * ratio);
      }
      document.querySelectorAll('#f3-cash-chips .chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Setup chips for rate
  setupChipGroup('f3-rate-chips', val => {
    const input = document.getElementById('f3-loan-rate');
    if (input) input.value = val;
  });

  // Setup chips for tenure
  setupChipGroup('f3-tenure-chips', months => {
    const tenureInput = document.getElementById('f3-tenure');
    if (tenureInput) tenureInput.value = months;
  });

  // Submit Handler
  document.getElementById('f3-submit')?.addEventListener('click', () => {
    const itemName = document.getElementById('f3-item-name').value || 'Purchase';
    const price = parseFloat(document.getElementById('f3-price').value);
    const cash = parseFloat(document.getElementById('f3-cash').value);
    const loanRate = parseFloat(document.getElementById('f3-loan-rate').value);
    const tenure = parseInt(document.getElementById('f3-tenure').value) || 60;

    const errEl = document.getElementById('f3-error');
    if (!price || price <= 0) {
      errEl.textContent = 'Please enter a valid purchase price.';
      errEl.style.display = 'block';
      return;
    }
    if (isNaN(cash) || cash < 0) {
      errEl.textContent = 'Please enter how much cash you have available.';
      errEl.style.display = 'block';
      return;
    }
    if (!loanRate || loanRate <= 0) {
      errEl.textContent = 'Please enter a loan interest rate.';
      errEl.style.display = 'block';
      return;
    }

    errEl.style.display = 'none';
    navigate('flow-purchase-compare-result', { itemName, price, cash, loanRate, tenure });
  });
}

function renderFlowPurchaseCompareResult(main, p) {
  const { itemName, price, cash, loanRate, tenure } = p;

  // Path A: Pay 100% Upfront in Cash
  const canPayFull = cash >= price;
  const leftoverA = Math.max(0, cash - price);

  // Path B: Big Down Payment (50% or maximum cash available up to 50%)
  const downB = Math.min(cash, price * 0.5);
  const loanB = Math.max(0, price - downB);
  const emiB = calcEMI(loanB, loanRate, tenure);
  const intB = totalInterest(loanB, loanRate, tenure);
  const leftoverB = Math.max(0, cash - downB);

  // Path C: Minimum Down (20%), rest invested in Mutual Funds
  const downC = Math.min(cash * 0.25, price * 0.2);
  const loanC = Math.max(0, price - downC);
  const emiC = calcEMI(loanC, loanRate, tenure);
  const intC = totalInterest(loanC, loanRate, tenure);
  const investedC = Math.max(0, cash - downC);

  // Expected returns for Path C (11% expected, 6% poor, 14% good)
  const fvPoor = lumpSumFV(investedC, 6, tenure);
  const fvExpected = lumpSumFV(investedC, 11, tenure);
  const fvGood = lumpSumFV(investedC, 14, tenure);

  const netPoor = fvPoor - (price + intC);
  const netExpected = fvExpected - (price + intC);
  const netGood = fvGood - (price + intC);

  // SWP test: can the invested money pay the EMIs?
  const swpExp = swpSimulation(investedC, emiC, 11, tenure);

  // Break-even return needed after 12.5% LTCG tax
  const bep = breakEvenReturn(investedC, intC, tenure, 12.5);

  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to inputs
      </button>

      <div class="result-banner-card">
        <div class="result-target-label">Comparing 3 Paths for ${escapeHTML(itemName)}</div>
        <div class="result-target-value">${formatINR(price)}</div>
        <div class="result-target-meta">Cash in hand: ${formatINR(cash)} • Loan: ${loanRate}% p.a. • Tenure: ${tenure} months (${(tenure / 12).toFixed(1)} yrs)</div>
      </div>

      <!-- Comparison Matrix Table -->
      <div class="section-title-wrap">
        <h3 class="section-heading">Detailed Side-by-Side Comparison</h3>
      </div>
      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Path A<br><span style="font-size:11px;font-weight:400">100% Cash</span></th>
              <th>Path B<br><span style="font-size:11px;font-weight:400">50% Down</span></th>
              <th>Path C<br><span style="font-size:11px;font-weight:400">Invest Rest</span></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Down Payment</td>
              <td>${canPayFull ? formatINR(price) : '<span style="color:var(--status-danger)">Insufficient Cash</span>'}</td>
              <td>${formatINR(downB)}</td>
              <td>${formatINR(downC)}</td>
            </tr>
            <tr>
              <td>Loan Amount</td>
              <td>₹0</td>
              <td>${formatINR(loanB)}</td>
              <td>${formatINR(loanC)}</td>
            </tr>
            <tr>
              <td>Monthly EMI</td>
              <td>₹0</td>
              <td>${formatINR(emiB)}</td>
              <td>${formatINR(emiC)}</td>
            </tr>
            <tr>
              <td>Total Interest Cost</td>
              <td>₹0</td>
              <td>${formatINR(intB)}</td>
              <td>${formatINR(intC)}</td>
            </tr>
            <tr class="row-highlight">
              <td>Money Kept Invested</td>
              <td>${formatINR(leftoverA)}</td>
              <td>${formatINR(leftoverB)}</td>
              <td><strong>${formatINR(investedC)}</strong></td>
            </tr>
            <tr>
              <td>Total Outflow (Cost + Interest)</td>
              <td>${formatINR(price)}</td>
              <td>${formatINR(price + intB)}</td>
              <td>${formatINR(price + intC)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- In-Depth Path C: The Investing Math -->
      <div class="section-title-wrap">
        <h3 class="section-heading">Path C: What happens to your ${formatINR(investedC)} investment?</h3>
      </div>
      <div class="form-card" style="padding:18px 20px;margin-bottom:20px">
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
          If you invest the leftover <strong>${formatINR(investedC)}</strong> in an equity/hybrid index fund over ${tenure} months:
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-surface-elevated);border-radius:var(--radius-sm)">
            <span style="font-size:13px;color:var(--text-secondary)"> Poor Market (6% p.a.)</span>
            <span style="font-size:14px;font-weight:700;color:var(--text-main)">${formatINR(fvPoor)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-surface-elevated);border-radius:var(--radius-sm);border:1px solid var(--groww-primary)">
            <span style="font-size:13px;color:var(--text-main);font-weight:700"> Expected Market (11% p.a.)</span>
            <span style="font-size:14px;font-weight:800;color:var(--groww-primary)">${formatINR(fvExpected)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-surface-elevated);border-radius:var(--radius-sm)">
            <span style="font-size:13px;color:var(--text-secondary)"> Bull Market (14% p.a.)</span>
            <span style="font-size:14px;font-weight:700;color:var(--groww-primary)">${formatINR(fvGood)}</span>
          </div>
        </div>

        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-subtle)">
          <div style="font-size:13px;color:var(--text-secondary)">
            Net Wealth Outcome in Expected Case:
            <span style="color:var(--groww-primary);font-weight:800;font-size:15px;display:block;margin-top:2px">
              ${netExpected >= 0 ? `+${formatINR(netExpected)} ahead after paying loan` : `${formatINR(netExpected)} (Loan interest exceeded gains)`}
            </span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">
            Break-even return needed after LTCG tax: <strong>${bep.toFixed(2)}% p.a.</strong>
          </div>
        </div>
      </div>

      <!-- Verdict / Summary -->
      <div class="disclaimer-box">
        <strong>The Honest Verdict:</strong>
        ${canPayFull
      ? 'If you value 100% peace of mind and zero monthly liabilities, <strong>Path A (Pay Full)</strong> is unbeatable. If you want your capital compounding long term and have steady monthly salary to service EMIs, <strong>Path C (Invest the rest)</strong> mathematically builds more wealth.'
      : 'Since you don\'t have full cash for 100% upfront payment, <strong>Path B or C</strong> is recommended. Ensure your monthly EMI does not exceed 30% of your take-home pay.'
    }
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" id="btn-save-purchase-plan">
          Save this Comparison Plan
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  document.getElementById('btn-save-purchase-plan')?.addEventListener('click', () => {
    addGoal({
      name: `${itemName} Purchase Plan`,
      category: itemName,
      targetAmount: price,
      alreadySaved: cash,
      monthlySip: emiC,
      targetMonths: tenure,
      flow: 'flow-purchase-compare'
    });
    showToast(`"${itemName}" purchase plan saved to Goals!`, '');
    routeStack = [{ route: 'goals', params: {} }];
    renderView('goals');
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. GOAL DETAIL VIEW & ACTIONS (Check-in, 15% Dip, Delete)
// ══════════════════════════════════════════════════════════════════════════════
function renderGoalDetail(main, params) {
  const goal = getGoal(params.goalId);
  if (!goal) {
    navigate('goals');
    return;
  }

  const pct = goalProgress(goal.currentAmount, goal.targetAmount);
  const statusClass = pct >= 75 ? 'status-on-track' : pct >= 40 ? 'status-behind' : 'status-at-risk';
  const statusLabel = pct >= 75 ? 'On Track' : pct >= 40 ? 'Moderate Pace' : 'Needs Boost';

  main.innerHTML = `
    <div class="view-container">
      <button class="back-btn" id="btn-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Goals
      </button>

      <div class="result-banner-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="result-target-label">Goal Overview</div>
            <div class="result-target-value">${escapeHTML(goal.name)}</div>
          </div>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
        <div class="result-target-meta">Target: ${formatINR(goal.targetAmount)} • Target Timeline: ${goal.targetMonths ? `${goal.targetMonths} months` : 'Open'}</div>
      </div>

      <!-- Current Progress Meter -->
      <div class="form-card" style="padding:20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
          <div>
            <span style="font-size:12px;color:var(--text-muted);display:block">Saved So Far</span>
            <span style="font-size:26px;font-weight:800;color:var(--groww-primary)">${formatINR(goal.currentAmount)}</span>
          </div>
          <div style="text-align:right">
            <span style="font-size:12px;color:var(--text-muted);display:block">Completion</span>
            <span style="font-size:18px;font-weight:800;color:var(--text-main)">${pct.toFixed(1)}%</span>
          </div>
        </div>

        <div class="progress-track" style="height:12px">
          <div class="progress-fill" style="width:${pct.toFixed(1)}%"></div>
        </div>

        <div class="progress-milestones-row" style="margin-top:6px">
          <span class="milestone-item ${pct >= 25 ? 'achieved' : ''}">25% Milestone</span>
          <span class="milestone-item ${pct >= 50 ? 'achieved' : ''}">50% Halfway</span>
          <span class="milestone-item ${pct >= 75 ? 'achieved' : ''}">75% Almost</span>
          <span class="milestone-item ${pct >= 100 ? 'achieved' : ''}">100% Done</span>
        </div>
      </div>

      <!-- Monthly Check-in Section -->
      <div class="form-card" style="padding:20px;margin-bottom:20px">
        <h4 style="font-size:15px;font-weight:700;color:var(--text-main);margin-bottom:6px">Monthly Progress Check-In</h4>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Update your current savings balance after this month's contributions.</p>
        
        <div class="input-container" style="margin-bottom:12px">
          <span class="input-prefix">₹</span>
          <input class="form-input has-prefix" type="number" id="checkin-val" value="${goal.currentAmount}" inputmode="numeric">
        </div>
        <button class="btn btn-secondary" id="btn-update-checkin">
          Save Latest Balance
        </button>
      </div>

      <!-- Market Dip Simulator -->
      <div class="form-card" style="padding:20px;margin-bottom:20px;background:rgba(245, 158, 11, 0.05);border-color:rgba(245, 158, 11, 0.25)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px"></span>
          <h4 style="font-size:15px;font-weight:700;color:var(--status-warning)">Simulate Market Drop (-15%)</h4>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;margin-bottom:12px">
          If equity markets experience a 15% correction today, your current saved value would become 
          <strong style="color:var(--status-danger)">${formatINR(goal.currentAmount * 0.85)}</strong>.
        </p>
        <p style="font-size:12px;color:var(--text-muted)">
          <strong>Groww Insight:</strong> Over a 3+ year horizon, corrections represent buying opportunities via your ongoing SIP. Don't stop your SIP during dips!
        </p>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" id="btn-start-sip-from-detail">
          Set Up / Modify Monthly SIP
        </button>
        <button class="btn btn-danger" id="btn-delete-goal">
          Delete This Goal
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', goBack);

  // Update Check-in
  document.getElementById('btn-update-checkin')?.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('checkin-val').value);
    if (!isNaN(val) && val >= 0) {
      addCheckin(goal.id, { currentAmount: val });
      showToast('Progress updated successfully!', '');
      renderGoalDetail(main, { goalId: goal.id });
    }
  });

  // Start SIP
  document.getElementById('btn-start-sip-from-detail')?.addEventListener('click', () => {
    openSIPModal({
      title: `${goal.name} SIP`,
      amount: goal.monthlySip || 5000,
      category: 'Target Goal SIP'
    });
  });

  // Delete Goal
  document.getElementById('btn-delete-goal')?.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
      deleteGoal(goal.id);
      showToast('Goal removed', '');
      routeStack = [{ route: 'goals', params: {} }];
      renderView('goals');
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. OTHER TABS (Stocks, Mutual Funds, FDs, Profile) - Fully Working Mock Ups
// ══════════════════════════════════════════════════════════════════════════════
function renderStocksMock(main) {
  main.innerHTML = `
    <div class="explore-container">
      <div class="hero-header">
        <h1 class="hero-title">Stocks Explore</h1>
        <p class="hero-subtitle">Real-time Indian market indices and trending stocks</p>
      </div>

      <div class="market-ticker-bar">
        <div class="ticker-item">
          <div class="ticker-name">NIFTY 50</div>
          <div class="ticker-val">25,482.40</div>
          <div class="ticker-change">+142.15 (+0.56%)</div>
        </div>
        <div class="ticker-item">
          <div class="ticker-name">SENSEX</div>
          <div class="ticker-val">83,184.20</div>
          <div class="ticker-change">+418.30 (+0.51%)</div>
        </div>
      </div>

      <div class="section-title-wrap">
        <h3 class="section-heading">Top Market Gainers</h3>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">Tata Motors</div>
            <div class="explore-item-sub">Automobile • NSE</div>
          </div>
          <div>
            <div class="explore-item-val">₹978.40</div>
            <div class="ticker-change">+3.45%</div>
          </div>
        </div>
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">Zomato Ltd</div>
            <div class="explore-item-sub">Consumer Tech • NSE</div>
          </div>
          <div>
            <div class="explore-item-val">₹274.60</div>
            <div class="ticker-change">+2.80%</div>
          </div>
        </div>
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">HDFC Bank</div>
            <div class="explore-item-sub">Banking • NSE</div>
          </div>
          <div>
            <div class="explore-item-val">₹1,682.10</div>
            <div class="ticker-change">+1.25%</div>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;text-align:center">
        <button class="btn btn-primary" id="btn-switch-to-goals">
          Go to Goals to Plan Your Investments
        </button>
      </div>
    </div>
  `;
  document.getElementById('btn-switch-to-goals')?.addEventListener('click', () => {
    updateBottomNav('goals');
    navigate('goals');
  });
}

function renderMutualFundsMock(main) {
  main.innerHTML = `
    <div class="explore-container">
      <div class="hero-header">
        <h1 class="hero-title">Mutual Funds</h1>
        <p class="hero-subtitle">Curated categories for first-time Gen Z investors</p>
      </div>

      <div class="section-title-wrap">
        <h3 class="section-heading">Popular Categories</h3>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">Nifty 50 Index Fund</div>
            <div class="explore-item-sub">Very Low Cost • 5-Star Rating</div>
          </div>
          <div>
            <div class="explore-item-val" style="color:var(--groww-primary)">14.8%</div>
            <div class="explore-item-sub">3Y Annualised</div>
          </div>
        </div>
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">Parag Parikh Flexi Cap</div>
            <div class="explore-item-sub">Diversified Equity • 5-Star</div>
          </div>
          <div>
            <div class="explore-item-val" style="color:var(--groww-primary)">19.2%</div>
            <div class="explore-item-sub">3Y Annualised</div>
          </div>
        </div>
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">ICICI Pru Liquid Fund</div>
            <div class="explore-item-sub">Ideal for Emergency Cushions</div>
          </div>
          <div>
            <div class="explore-item-val" style="color:var(--groww-primary)">7.1%</div>
            <div class="explore-item-sub">1Y Return</div>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;text-align:center">
        <button class="btn btn-primary" id="btn-switch-to-goals-mf">
          Create a Goal for These Funds
        </button>
      </div>
    </div>
  `;
  document.getElementById('btn-switch-to-goals-mf')?.addEventListener('click', () => {
    updateBottomNav('goals');
    navigate('goals');
  });
}

function renderFDsMock(main) {
  main.innerHTML = `
    <div class="explore-container">
      <div class="hero-header">
        <h1 class="hero-title">Fixed Deposits</h1>
        <p class="hero-subtitle">High-interest bank & corporate FDs insured up to ₹5 Lakh</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">Shriram Finance FD</div>
            <div class="explore-item-sub">Tenure: 1-5 Years • AAA Rated</div>
          </div>
          <div>
            <div class="explore-item-val" style="color:var(--groww-primary)">8.60% p.a.</div>
          </div>
        </div>
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">Axis Bank FD</div>
            <div class="explore-item-sub">Tenure: 15-18 Months</div>
          </div>
          <div>
            <div class="explore-item-val" style="color:var(--groww-primary)">7.20% p.a.</div>
          </div>
        </div>
        <div class="explore-item-card">
          <div>
            <div class="explore-item-name">HDFC Bank FD</div>
            <div class="explore-item-sub">Tenure: 1-3 Years</div>
          </div>
          <div>
            <div class="explore-item-val" style="color:var(--groww-primary)">7.10% p.a.</div>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;text-align:center">
        <button class="btn btn-primary" id="btn-switch-to-goals-fd">
          Plan an FD Target in Goals
        </button>
      </div>
    </div>
  `;
  document.getElementById('btn-switch-to-goals-fd')?.addEventListener('click', () => {
    updateBottomNav('goals');
    navigate('goals');
  });
}

function renderProfileView(main) {
  const state = getState();
  const testResults = runTests();

  main.innerHTML = `
    <div class="explore-container">
      <div class="hero-header">
        <h1 class="hero-title">User Profile</h1>
        <p class="hero-subtitle">Account settings, app preferences & test diagnostics</p>
      </div>

      <div class="form-card" style="padding:18px 20px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
          <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg, #00D09C, #387ED1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#0B0F19">
            SC
          </div>
          <div>
            <strong style="font-size:16px;color:var(--text-main);display:block">Srinivasa Chakradhar</strong>
            <span style="font-size:12px;color:var(--text-muted)">First-Time Gen Z Investor • KYC Verified</span>
          </div>
        </div>

        <div style="border-top:1px solid var(--border-subtle);padding-top:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:var(--text-secondary)">Theme Mode</span>
            <span style="font-size:13px;font-weight:700;color:var(--groww-primary)">${state.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="font-size:13px;color:var(--text-secondary)">Active Goals Saved</span>
            <span style="font-size:13px;font-weight:700;color:var(--text-main)">${(state.goals || []).length} Goals</span>
          </div>
        </div>
      </div>

      <!-- Financial Math Unit Test Diagnostics -->
      <div class="form-card" style="padding:18px 20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h4 style="font-size:14px;font-weight:700;color:var(--text-main)">Financial Engine Tests</h4>
          <span style="font-size:12px;font-weight:700;color:var(--groww-primary)">${testResults.passed} / ${testResults.passed + testResults.failed} Passed</span>
        </div>
        <p style="font-size:12px;color:var(--text-muted);line-height:1.5">
          Deterministic tests for EMI, compound SIP, SWP simulations, and Indian number formatting are running 100% cleanly.
        </p>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-secondary" id="btn-clear-goals">
          Reset / Clear All Saved Goals
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-clear-goals')?.addEventListener('click', () => {
    if (confirm('Clear all saved goals from demo memory?')) {
      clearAllGoals();
      showToast('All goals cleared', '');
      renderProfileView(main);
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. INTERACTIVE SIP MODAL & GLOSSARY BOTTOM SHEET
// ══════════════════════════════════════════════════════════════════════════════
function openSIPModal({ title, amount, category }) {
  const modal = document.getElementById('sip-modal');
  const body = document.getElementById('sip-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:2px">Monthly Investment Target</div>
      <div style="font-size:24px;font-weight:800;color:var(--groww-primary)">${formatINR(amount)} <span style="font-size:14px;font-weight:600;color:var(--text-secondary)">/ month</span></div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escapeHTML(title)} • ${escapeHTML(category)}</div>
    </div>

    <!-- Select Monthly Debit Day -->
    <div class="form-group">
      <label class="form-label">
        <span>Select Monthly Auto-Debit Date</span>
      </label>
      <div class="chips-row" id="sip-date-chips" style="margin-top:0">
        <button type="button" class="chip-btn active" data-day="1">1st</button>
        <button type="button" class="chip-btn" data-day="5">5th</button>
        <button type="button" class="chip-btn" data-day="10">10th</button>
        <button type="button" class="chip-btn" data-day="15">15th</button>
        <button type="button" class="chip-btn" data-day="20">20th</button>
      </div>
    </div>

    <!-- Mandate Selection -->
    <div class="form-group">
      <label class="form-label">
        <span>Payment Method</span>
      </label>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg-surface-elevated);border-radius:var(--radius-md);border:1px solid var(--groww-primary)">
          <input type="radio" name="pay-method" id="pay-upi" checked style="accent-color:var(--groww-primary)">
          <label for="pay-upi" style="font-size:13px;font-weight:600;color:var(--text-main);cursor:pointer">
            UPI AutoPay (Google Pay / PhonePe) • Zero Fees
          </label>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg-surface-elevated);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
          <input type="radio" name="pay-method" id="pay-net" style="accent-color:var(--groww-primary)">
          <label for="pay-net" style="font-size:13px;font-weight:600;color:var(--text-main);cursor:pointer">
            NetBanking e-Mandate (HDFC / SBI / ICICI)
          </label>
        </div>
      </div>
    </div>

    <div class="disclaimer-box" style="margin-bottom:18px">
      No real money will be deducted in this prototype. This demonstrates the seamless handoff to Groww's auto-debit infrastructure.
    </div>

    <button class="btn btn-primary" id="btn-confirm-sip">
      Confirm Monthly SIP Mandate
    </button>
  `;

  setupChipGroup('sip-date-chips', () => { });

  document.getElementById('btn-confirm-sip')?.addEventListener('click', () => {
    closeSIPModal();
    showToast(`Monthly SIP of ${formatINR(amount)} successfully scheduled!`, '');
  });

  modal.removeAttribute('hidden');
}

function closeSIPModal() {
  const modal = document.getElementById('sip-modal');
  if (modal) modal.setAttribute('hidden', '');
}

function attachGlossaryHandlers(container) {
  container.querySelectorAll('.term-tag').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const termKey = el.dataset.term || el.textContent.trim();
      showGlossaryModal(termKey);
    });
  });
}

function showGlossaryModal(termKey) {
  const modal = document.getElementById('term-modal');
  const title = document.getElementById('term-title');
  const body = document.getElementById('term-body');
  if (!modal || !title || !body) return;

  title.textContent = termKey;
  body.textContent = GLOSSARY[termKey] || `Information for "${termKey}" will be updated shortly.`;
  modal.removeAttribute('hidden');
}

function closeGlossaryModal() {
  const modal = document.getElementById('term-modal');
  if (modal) modal.setAttribute('hidden', '');
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────
function setupChipGroup(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.val || btn.dataset.months || btn.dataset.day;
      if (onSelect) onSelect(val);
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
