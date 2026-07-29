/* ============================================================
   WAITLIST PAGE — ambient background(s) + MailerLite-ready forms.
   Works for any number of .wl-form blocks on the page (hero + CTA).
   Camera is a static, feathered image — no dissolve engine here.
   ============================================================ */
(function () {
  "use strict";

  if (window.KF_ATMO) KF_ATMO.init("bgCanvas");
  if (window.KF_NODES) KF_NODES.init("nodeCanvas");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.querySelectorAll(".wl-form").forEach(function (form) {
    const block = form.closest(".wl-form-block") || form.parentElement;
    const input = form.querySelector(".wl-email");
    const hint = block.querySelector(".wl-hint");
    const micro = block.querySelector(".wl-micro");
    const success = block.querySelector(".wl-success");
    const note = block.querySelector(".wl-allmail");
    const btn = form.querySelector("button");

    function setHint(msg, isErr) {
      if (!hint) return;
      hint.textContent = msg || "";
      hint.classList.toggle("err", !!isErr);
    }

    form.addEventListener("submit", function (e) {
      const hp = form.querySelector(".wl-hp");
      if (hp && hp.value) { e.preventDefault(); return; } // honeypot tripped, silently drop

      const val = (input.value || "").trim();
      if (!EMAIL_RE.test(val)) {
        e.preventDefault();
        setHint("Enter a valid email address.", true);
        form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
        input.focus();
        return;
      }
      // valid — let the native POST to the hidden iframe proceed. Response isn't
      // readable cross-origin, so we optimistically confirm.
      setHint("", false);
      btn.disabled = true; btn.textContent = "Joining…";
      setTimeout(function () {
        form.style.display = "none";
        if (hint) hint.style.display = "none";
        if (micro) micro.style.display = "none";
        if (success) success.classList.add("show");
        if (note) note.classList.add("show");
      }, 700);
    });
  });
})();
