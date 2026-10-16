(function () {
  // Contact requests are sent to this address via the visitor's email client.
  var CONTACT_EMAIL = "hello@grovix.co.in";

  var nav = document.querySelector(".nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  // Mobile menu
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Nav border on scroll
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Plan buttons preselect the license type in the form
  var planSelect = document.getElementById("planSelect");
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () { planSelect.value = btn.dataset.plan; });
  });

  // Contact form: validate, then open a pre-filled email
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (field) {
      var ok = field.value.trim() !== "" && (field.type !== "email" || /^\S+@\S+\.\S+$/.test(field.value));
      field.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      note.className = "form-note err";
      note.textContent = "Please fill in your name, a valid email and your requirements.";
      return;
    }
    var d = new FormData(form);
    var body = [
      "Name: " + d.get("name"),
      "Email: " + d.get("email"),
      "Company: " + (d.get("company") || "-"),
      "License type: " + d.get("plan"),
      "",
      d.get("message")
    ].join("\n");
    window.location.href = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent("Sample dataset request - " + d.get("name")) +
      "&body=" + encodeURIComponent(body);
    note.className = "form-note ok";
    note.textContent = "Thanks! Your email app should open with your request ready to send.";
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
