(function () {
  const video = document.getElementById("heroVideo");
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const header = document.querySelector(".site-header");
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactFormStatus");
  const mqNavDesktop = window.matchMedia("(min-width: 1024px)");

  function stripHeroPoster() {
    if (!video) return;
    video.removeAttribute("poster");
    video.poster = "";
  }

  function playHeroVideo() {
    if (!video || video.error) return;
    stripHeroPoster();
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    var p = video.play();
    if (p !== undefined) {
      p.catch(function () {});
    }
  }

  if (video) {
    stripHeroPoster();

    video.addEventListener("playing", stripHeroPoster);

    ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"].forEach(function (evt) {
      video.addEventListener(evt, playHeroVideo);
    });

    video.addEventListener("seeked", stripHeroPoster);

    var loopLead = 0.15;
    video.addEventListener("timeupdate", function () {
      if (!video.duration || isNaN(video.duration)) return;
      if (video.currentTime >= video.duration - loopLead) {
        video.currentTime = 0;
      }
    });

    video.addEventListener("ended", function () {
      video.currentTime = 0;
      playHeroVideo();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        video.pause();
      } else {
        playHeroVideo();
      }
    });

    function tryPlayAfterGesture() {
      playHeroVideo();
      document.removeEventListener("pointerdown", tryPlayAfterGesture);
      document.removeEventListener("touchstart", tryPlayAfterGesture);
    }
    document.addEventListener("pointerdown", tryPlayAfterGesture, { passive: true });
    document.addEventListener("touchstart", tryPlayAfterGesture, { passive: true });

    playHeroVideo();
    window.setTimeout(playHeroVideo, 400);
    window.setTimeout(playHeroVideo, 1200);
  }

  if (navToggle && siteNav) {
    function setNavOpen(open) {
      document.body.classList.toggle("nav-open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    navToggle.addEventListener("click", function () {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    function onResizeNav() {
      if (mqNavDesktop.matches) {
        setNavOpen(false);
      }
    }

    mqNavDesktop.addEventListener("change", onResizeNav);
    window.addEventListener("resize", onResizeNav);
  }

  if (header) {
    function onScrollHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".hero .reveal").forEach(function (el) {
    el.classList.add("is-visible");
  });

  if (!reduceMotion) {
    var revealEls = Array.prototype.filter.call(document.querySelectorAll(".reveal"), function (el) {
      return !el.closest(".hero");
    });
    if (revealEls.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (contactForm && contactStatus) {
    var emailTo = "xyz@mail.com";

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactStatus.textContent = "";
      contactStatus.classList.remove("is-error", "is-success");

      var name = (document.getElementById("contactName") || {}).value.trim();
      var email = (document.getElementById("contactEmail") || {}).value.trim();
      var message = (document.getElementById("contactMessage") || {}).value.trim();

      if (!name || !email || !message) {
        contactStatus.textContent = "Please fill in every field.";
        contactStatus.classList.add("is-error");
        return;
      }

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        contactStatus.textContent = "Please enter a valid email.";
        contactStatus.classList.add("is-error");
        return;
      }

      var subject = encodeURIComponent("Divine Water — " + name);
      var body = encodeURIComponent(message + "\n\n—\n" + email);
      window.location.href = "mailto:" + emailTo + "?subject=" + subject + "&body=" + body;

      contactStatus.textContent = "Your email app should open. If it does not, write to " + emailTo + ".";
      contactStatus.classList.add("is-success");
    });
  }
})();
