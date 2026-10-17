(function () {
  // Contact form submissions are delivered to this address.
  var CONTACT_EMAIL = "ebooks.grovix@gmail.com";

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

  // Contact form: validate, then deliver it to CONTACT_EMAIL via FormSubmit
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var submitBtn = document.getElementById("submitBtn");
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
    var payload = {
      "Name": d.get("name"),
      "Email": d.get("email"),
      "Company": d.get("company") || "-",
      "Intended use": d.get("use"),
      "Brief": d.get("message"),
      _replyto: d.get("email"),
      _subject: "New enquiry from grovix.co.in - " + d.get("name"),
      _template: "table",
      _honey: d.get("_honey")
    };
    submitBtn.disabled = true;
    note.className = "form-note";
    note.textContent = "Sending...";
    fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok || String(r.data.success) !== "true") throw new Error(r.data.message || "Send failed");
        form.reset();
        note.className = "form-note ok";
        note.textContent = "Thank you! We've received your request and will be in touch soon.";
      })
      .catch(function () {
        note.className = "form-note err";
        note.textContent = "Sorry, that didn't go through. Please email us at " + CONTACT_EMAIL + ".";
      })
      .finally(function () { submitBtn.disabled = false; });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
