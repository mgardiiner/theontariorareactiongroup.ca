<template>
  <!-- A fold-out walkthrough for the one field that trips people up: which Zoom
       link to paste, and where the host finds it. -->
  <details class="zlh">
    <summary class="zlh-summary">Where do I find the registration link?</summary>
    <div class="zlh-body">
      <p class="zlh-lead">
        Only the meeting <strong>host</strong> can get this link, and their Zoom account needs to be a
        paid one (Pro or higher). Send them these steps:
      </p>
      <ol class="zlh-steps">
        <li>Sign in at <strong>zoom.us</strong> and open <strong>Meetings</strong> in the left menu.</li>
        <li>Click the meeting, then <strong>Edit</strong>.</li>
        <li>Under <strong>Registration</strong>, tick <strong>Required</strong>. Leave approval on <em>Automatic</em> so people get their join link right away. Save.</li>
        <li>Back on the meeting page, scroll to <strong>Registration Link</strong> and press <strong>Copy</strong>.</li>
        <li>Send you that link — paste it into the box above.</li>
      </ol>
      <div class="zlh-check">
        <p class="zlh-good">✓ &nbsp;Right: <code>https://…zoom.us/meeting/<strong>register</strong>/…</code></p>
        <p class="zlh-bad">✕ &nbsp;Wrong: <code>https://…zoom.us/<strong>j</strong>/123456789</code> — that's the join link. It skips registration, so nobody gets a confirmation email.</p>
      </div>
      <p class="zlh-note">
        No link yet? Leave the box empty. The site shows “Registration opens soon” until you add one.
      </p>
    </div>
  </details>
</template>

<style scoped>
.zlh {
  margin-top: 6px;
  border: 1px solid #e3ddd0;
  border-radius: 8px;
  background: #fff;
  font-size: 13.5px;
  line-height: 1.5;
  color: #4a4658;
}
.zlh-summary {
  cursor: pointer;
  padding: 10px 14px;
  font-weight: 600;
  color: var(--primary, #1e0177);
  list-style: none;
}
.zlh-summary::-webkit-details-marker { display: none; }
.zlh-summary::before {
  content: '?';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary, #1e0177);
  color: #fff;
  font-size: 12px;
  margin-right: 8px;
}
.zlh-body { padding: 0 14px 14px; }
.zlh-lead { margin: 0 0 10px; }
.zlh-steps { margin: 0 0 12px; padding-left: 22px; }
.zlh-steps li { margin-bottom: 5px; }
.zlh-check {
  background: #faf8ff;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.zlh-check p { margin: 0; }
.zlh-check p + p { margin-top: 6px; }
.zlh-good { color: #1f6b3a; }
.zlh-bad { color: #9b2c2c; }
.zlh-check code {
  font-size: 12.5px;
  background: rgba(0,0,0,0.04);
  padding: 1px 5px;
  border-radius: 4px;
  color: inherit;
}
.zlh-note { margin: 0; color: #7a7388; }
</style>
