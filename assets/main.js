(function () {
  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // ---------- theme ----------
  var saved = store("theme");
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
  var themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("theme", next);
    });
  }

  // ---------- nav: mobile menu, scrolled state, active section ----------
  var nav = document.querySelector(".nav");
  var links = document.querySelector(".nav-links");
  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0 }); });

  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          reveal.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { reveal.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- news: show more ----------
  var moreBtn = document.querySelector(".more-btn");
  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      var hidden = document.querySelectorAll(".news li.extra");
      var expanding = moreBtn.getAttribute("aria-expanded") !== "true";
      hidden.forEach(function (li) { li.classList.toggle("hidden", !expanding); });
      moreBtn.setAttribute("aria-expanded", expanding ? "true" : "false");
      moreBtn.textContent = expanding ? "Show less" : "Show all news";
    });
  }

  // ---------- publications: filter + search ----------
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var search = document.querySelector(".search");
  var pubs = Array.prototype.slice.call(document.querySelectorAll(".pub"));
  var empty = document.querySelector(".pubs-empty");
  var current = "all";

  function applyFilter() {
    var q = (search && search.value || "").trim().toLowerCase();
    var shown = 0;
    pubs.forEach(function (p) {
      var tags = (p.getAttribute("data-tags") || "").split(" ");
      var okTag = current === "all" || tags.indexOf(current) !== -1;
      var okText = !q || p.textContent.toLowerCase().indexOf(q) !== -1;
      var show = okTag && okText;
      p.classList.toggle("hidden", !show);
      if (show) shown++;
    });
    if (empty) empty.style.display = shown ? "none" : "block";
  }
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      current = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      applyFilter();
    });
  });
  if (search) search.addEventListener("input", applyFilter);

  // ---------- bibtex toggle + copy ----------
  var toast = document.querySelector(".toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { showToast("Copy failed"); }
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-bib]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = document.getElementById(btn.getAttribute("data-bib"));
      var open = box.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.parentNode.querySelector("code");
      copyText(code.textContent, function () { showToast("BibTeX copied"); });
    });
  });
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      copyText(btn.getAttribute("data-copy"), function () { showToast("Email copied"); });
    });
  });

  var year = document.querySelector(".year");
  if (year) year.textContent = new Date().getFullYear();
})();
