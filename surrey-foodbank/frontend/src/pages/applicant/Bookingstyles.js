import { useEffect } from "react";
// claude.ai was used to create the booking stepper navigation styling
export const bookingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #1a3a5c;
    --teal: #2a7f9e;
    --teal-light: #3ca0c0;
    --red: #c0392b;
    --gray-50: #f8f9fa;
    --gray-100: #f1f3f5;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #868e96;
    --gray-700: #495057;
    --gray-900: #212529;
    --white: #ffffff;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
    --shadow-lg: 0 8px 24px rgba(0,0,0,.12);
    --transition: 0.18s ease;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--gray-100); color: var(--gray-900); }

  /* ── Shell ── */
  .ba-shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--gray-100); }

  /* ── Top nav ── */
  .ba-topnav {
    background: var(--white); border-bottom: 1px solid var(--gray-200);
    padding: 12px 32px; display: flex; align-items: center;
    justify-content: space-between; box-shadow: var(--shadow-sm);
  }
  .ba-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Playfair Display', serif; font-size: 18px;
    color: var(--navy); font-weight: 700; letter-spacing: .3px;
  }
  .ba-logo-icon { width: 36px; height: 36px; display: flex; align-items: flex-end; gap: 3px; padding-bottom: 2px; }
  .ba-logo-icon span { display: block; width: 6px; border-radius: 3px 3px 0 0; background: var(--teal); }
  .ba-logo-icon span:nth-child(1) { height: 22px; }
  .ba-logo-icon span:nth-child(2) { height: 14px; background: var(--red); }
  .ba-logo-icon span:nth-child(3) { height: 18px; }
  .ba-logout {
    background: none; border: 1px solid var(--gray-300); border-radius: 6px;
    padding: 6px 16px; font-size: 14px; color: var(--gray-700);
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: var(--transition);
  }
  .ba-logout:hover { background: var(--gray-100); color: var(--gray-900); }

  /* ── Card ── */
  .ba-card-wrap { flex: 1; display: flex; justify-content: center; padding: 32px 16px 48px; }
  .ba-card { background: var(--white); border-radius: 12px; box-shadow: var(--shadow-lg); width: 100%; max-width: 760px; overflow: hidden; }

  /* ── Banner ── */
  .ba-banner { background: var(--navy); padding: 20px 32px; text-align: center; }
  .ba-banner h1 { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--white); font-weight: 700; letter-spacing: .5px; }

  /* ── Stepper ── */
  .ba-stepper { display: flex; align-items: center; justify-content: center; padding: 20px 32px; border-bottom: 1px solid var(--gray-200); background: var(--white); }
  .ba-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
  .ba-step:not(:last-child)::after {
    content: ''; position: absolute; top: 14px; left: 50%;
    width: 100%; height: 2px; background: var(--gray-300); z-index: 0;
  }
  .ba-step.done:not(:last-child)::after,
  .ba-step.active:not(:last-child)::after { background: var(--teal); }
  .ba-step-circle {
    width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--gray-300);
    background: var(--white); display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; color: var(--gray-500); position: relative; z-index: 1; transition: var(--transition);
  }
  .ba-step.done .ba-step-circle { background: var(--teal); border-color: var(--teal); color: var(--white); }
  .ba-step.active .ba-step-circle { background: var(--white); border-color: var(--teal); color: var(--teal); box-shadow: 0 0 0 3px rgba(42,127,158,.15); }
  .ba-step-label { font-size: 11px; color: var(--gray-500); font-weight: 500; white-space: nowrap; letter-spacing: .3px; }
  .ba-step.done .ba-step-label, .ba-step.active .ba-step-label { color: var(--teal); font-weight: 600; }

  /* ── Step body ── */
  .ba-body { padding: 28px 40px 36px; }
  .ba-body h2 { font-size: 17px; font-weight: 600; color: var(--gray-900); margin-bottom: 20px; text-align: center; }

  /* ── Form ── */
  .ba-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
  .ba-field { display: flex; flex-direction: column; gap: 5px; }
  .ba-field.full { grid-column: 1 / -1; }
  .ba-label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .ba-label .req { color: var(--red); margin-left: 2px; }
  .ba-input, .ba-select {
    border: 1px solid var(--gray-300); border-radius: 6px; padding: 9px 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--gray-900);
    background: var(--white); outline: none; transition: border-color var(--transition), box-shadow var(--transition);
  }
  .ba-input:focus, .ba-select:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(42,127,158,.12); }
  .ba-select { appearance: none; cursor: pointer; }
  .ba-tiny-radio { display: flex; gap: 24px; margin-top: 8px; }
  .ba-radio-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
  .ba-info-tooltip {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: 50%; background: var(--teal);
    color: var(--white); font-size: 10px; font-weight: 700; cursor: help; position: relative;
  }
  .ba-info-tooltip:hover .ba-tooltip-text { opacity: 1; pointer-events: auto; }
  .ba-tooltip-text {
    position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
    background: var(--navy); color: var(--white); font-size: 12px; font-weight: 400;
    padding: 8px 12px; border-radius: 6px; width: 240px; line-height: 1.5;
    opacity: 0; pointer-events: none; transition: opacity .15s; z-index: 100;
  }

  /* ── Members ── */
  .ba-members-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .ba-member-row {
    display: flex; align-items: center; border: 1px solid var(--gray-200);
    border-radius: 8px; padding: 10px 14px; gap: 12px; cursor: pointer;
    transition: border-color var(--transition), background var(--transition);
  }
  .ba-member-row.checked { border-color: var(--teal); background: rgba(42,127,158,.04); }
  .ba-member-check {
    width: 18px; height: 18px; border-radius: 4px; border: 2px solid var(--gray-300);
    background: var(--white); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: var(--transition);
  }
  .ba-member-row.checked .ba-member-check { background: var(--teal); border-color: var(--teal); }
  .ba-member-check-icon { color: var(--white); font-size: 11px; font-weight: 700; }
  .ba-member-info { flex: 1; }
  .ba-member-name { font-size: 14px; font-weight: 600; color: var(--gray-900); }
  .ba-member-role { font-size: 12px; color: var(--gray-500); }
  .ba-member-actions { display: flex; gap: 8px; }
  .ba-member-edit { font-size: 11px; font-weight: 600; color: var(--teal); background: none; border: none; cursor: pointer; padding: 2px 4px; font-family: 'DM Sans', sans-serif; }
  .ba-member-delete { font-size: 11px; font-weight: 600; color: var(--red); background: none; border: none; cursor: pointer; padding: 2px 4px; font-family: 'DM Sans', sans-serif; }
  .ba-add-member-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px;
    border: 2px dashed var(--gray-300); border-radius: 8px; background: none; color: var(--teal);
    font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: var(--transition); width: 100%;
  }
  .ba-add-member-btn:hover { border-color: var(--teal); background: rgba(42,127,158,.04); }

  /* ── Calendar ── */
  .ba-cal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; justify-content: center; }
  .ba-cal-nav { display: flex; align-items: center; gap: 8px; }
  .ba-cal-btn {
    background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 6px;
    padding: 6px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--gray-700); cursor: pointer; font-weight: 500; transition: var(--transition);
  }
  .ba-cal-btn:hover { background: var(--gray-200); }
  .ba-cal-btn.today { background: var(--teal); border-color: var(--teal); color: var(--white); }
  .ba-cal-range { font-size: 14px; font-weight: 600; color: var(--gray-700); min-width: 180px; text-align: center; }
  .ba-cal-legend { display: flex; gap: 16px; justify-content: flex-end; margin-bottom: 10px; font-size: 12px; color: var(--gray-600); }
  .ba-cal-legend span { display: flex; align-items: center; gap: 5px; }
  .ba-legend-dot { width: 12px; height: 12px; border-radius: 3px; }
  .ba-legend-dot.avail { background: var(--teal-light); }
  .ba-legend-dot.booked { background: var(--gray-300); }
  .ba-cal-grid { overflow-x: auto; border-radius: 8px; border: 1px solid var(--gray-200); }
  .ba-cal-table { width: 100%; border-collapse: collapse; min-width: 540px; table-layout: fixed; }
  .ba-cal-th {
    background: var(--gray-50); font-size: 12px; font-weight: 600; color: var(--gray-700);
    padding: 8px 4px; text-align: center; border-bottom: 1px solid var(--gray-200);
    border-right: 1px solid var(--gray-200); letter-spacing: .3px;
  }
  .ba-cal-th:first-child { min-width: 54px; }
  .ba-cal-th:last-child { border-right: none; }
  .ba-cal-td { border-bottom: 1px solid var(--gray-100); border-right: 1px solid var(--gray-100); padding: 0; vertical-align: top; }
  .ba-cal-td:last-child { border-right: none; }
  .ba-cal-td.time-col {
    background: var(--gray-50); font-size: 11px; color: var(--gray-600); font-weight: 500;
    text-align: right; padding: 3px 8px 3px 4px; border-right: 1px solid var(--gray-200);
    white-space: nowrap; vertical-align: middle;
  }
  .ba-slot { height: 18px; cursor: pointer; transition: filter .15s; width: 100%; }
  .ba-slot.avail { background: var(--teal-light); opacity: .85; }
  .ba-slot.avail:hover { opacity: 1; filter: brightness(1.07); }
  .ba-slot.unavail { background: var(--gray-200); cursor: default; }
  .ba-slot.selected { background: var(--navy); opacity: 1; }
  .ba-selected-pill {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--navy); color: var(--white); border-radius: 8px;
    padding: 10px 16px; font-size: 13px; font-weight: 500;
  }
  .ba-pill-time { font-weight: 700; font-size: 14px; }
  .ba-pill-clear { background: none; border: none; color: rgba(255,255,255,.7); cursor: pointer; font-size: 14px; padding: 0; line-height: 1; transition: color .15s; }
  .ba-pill-clear:hover { color: var(--white); }

  /* ── Review ── */
  .ba-review-grid { border: 1px solid var(--gray-200); border-radius: 8px; overflow: hidden; }
  .ba-review-row { display: grid; grid-template-columns: 160px 1fr; border-bottom: 1px solid var(--gray-200); }
  .ba-review-row:last-child { border-bottom: none; }
  .ba-review-label { padding: 11px 16px; font-size: 13px; font-weight: 600; color: var(--gray-700); background: var(--gray-50); border-right: 1px solid var(--gray-200); }
  .ba-review-val { padding: 11px 16px; font-size: 13px; color: var(--gray-900); line-height: 1.5; }

  /* ── Thank you ── */
  .ba-thankyou { text-align: center; padding: 8px 0 20px; }
  .ba-thankyou-icon {
    width: 64px; height: 64px; border-radius: 50%; background: var(--teal);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; font-size: 28px; color: var(--white);
  }
  .ba-thankyou h2 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--navy); margin-bottom: 12px; }
  .ba-thankyou p { font-size: 15px; color: var(--gray-700); line-height: 1.65; max-width: 440px; margin: 0 auto 8px; }
  .ba-thankyou .appt-time { font-weight: 700; color: var(--navy); font-size: 18px; margin: 16px auto; text-align: center !important; display: block; width: 100%; max-width: 100%; }
  
  /* ── Buttons & footer ── */
  .ba-footer { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px 28px; border-top: 1px solid var(--gray-200); }
  .ba-btn { padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: var(--transition); }
  .ba-btn-primary { background: var(--teal); color: var(--white); }
  .ba-btn-primary:hover { background: #236e89; }
  .ba-btn-secondary { background: var(--gray-100); border: 1px solid var(--gray-300); color: var(--gray-700); }
  .ba-btn-secondary:hover { background: var(--gray-200); }
  .ba-btn-confirm { background: var(--teal); color: var(--white); padding: 11px 36px; font-size: 15px; }
  .ba-btn-confirm:hover { background: #236e89; }
  .ba-btn-done { background: var(--navy); color: var(--white); }

  /* ── Timer ── */
  .ba-timer-wrap { margin: 16px auto 0; max-width: 420px; width: 100%; }
  .ba-timer-label { font-size: 13px; font-weight: 600; text-align: center; margin-bottom: 8px; }
  .ba-timer-bar-bg { height: 8px; background: var(--gray-200); border-radius: 99px; overflow: hidden; }
  .ba-timer-bar-fill { height: 100%; border-radius: 99px; }

  .ba-error { color: var(--red); font-size: 12px; margin-top: 3px; }

  @media (max-width: 600px) {
    .ba-body { padding: 20px 20px 28px; }
    .ba-footer { padding: 16px 20px 24px; }
    .ba-form-grid { grid-template-columns: 1fr; }
    .ba-review-row { grid-template-columns: 120px 1fr; }
    .ba-banner h1 { font-size: 18px; }
  }
`;

export function useBookingStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = bookingStyles;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
}