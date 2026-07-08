/* ============================================================
   TERRAH ORIGEM — Interações
   Vanilla JS, sem dependências. Funciona offline e em file://
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Tema (claro/escuro) ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("terrah-theme"); } catch (e) {}
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("terrah-theme", next); } catch (e) {}
    });
  }

  /* ---------- Header com scroll ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById("navBurger");
  var navList = document.getElementById("navList");

  function closeMenu() {
    navList.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger && navList) {
    burger.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Link ativo conforme a seção ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav__link");

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "100000px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Parallax discreto ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  var parallaxBgs = document.querySelectorAll("[data-parallax-bg]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && (parallaxEls.length || parallaxBgs.length)) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        parallaxEls.forEach(function (el) {
          var speed = parseFloat(el.getAttribute("data-parallax")) || 0.05;
          el.style.transform = "translateY(" + (y * speed) + "px)";
        });
        parallaxBgs.forEach(function (bg) {
          var rect = bg.parentElement.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            bg.style.transform = "translateY(" + (rect.top * -0.12) + "px)";
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Lightbox da galeria ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var currentIndex = 0;
  var lastFocused = null;

  function openLightbox(index) {
    currentIndex = index;
    var item = galleryItems[index];
    var img = item.querySelector("img");
    lightboxImg.src = item.getAttribute("data-full");
    lightboxImg.alt = img ? img.alt : "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocused = document.activeElement;
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function stepLightbox(dir) {
    var next = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    openLightbox(next);
  }

  if (lightbox && galleryItems.length) {
    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function () { openLightbox(i); });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () { stepLightbox(-1); });
    lightboxNext.addEventListener("click", function () { stepLightbox(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  /* ---------- Slider de depoimentos ---------- */
  var track = document.getElementById("sliderTrack");
  var prevBtn = document.getElementById("prevSlide");
  var nextBtn = document.getElementById("nextSlide");
  var dotsWrap = document.getElementById("sliderDots");

  if (track && dotsWrap) {
    var slides = track.children.length;
    var slideIndex = 0;
    var autoTimer = null;

    for (var i = 0; i < slides; i++) {
      var dot = document.createElement("button");
      dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
      (function (idx) {
        dot.addEventListener("click", function () { goToSlide(idx, true); });
      })(i);
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.children;

    function goToSlide(index, manual) {
      slideIndex = (index + slides) % slides;
      track.style.transform = "translateX(-" + (slideIndex * 100) + "%)";
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle("is-active", d === slideIndex);
      }
      if (manual) restartAuto();
    }

    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function () { goToSlide(slideIndex + 1); }, 6000);
    }

    prevBtn.addEventListener("click", function () { goToSlide(slideIndex - 1, true); });
    nextBtn.addEventListener("click", function () { goToSlide(slideIndex + 1, true); });

    /* Swipe no celular */
    var touchStartX = 0;
    track.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) goToSlide(slideIndex + (delta < 0 ? 1 : -1), true);
    }, { passive: true });

    restartAuto();
  }

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var nome = form.nome.value.trim();
      var telefone = form.telefone.value.trim();
      var email = form.email.value.trim();
      var mensagem = form.mensagem.value.trim();

      var texto =
        "Olá! Vim pelo site da Terrah Origem.\n\n" +
        "*Nome:* " + nome + "\n" +
        "*Telefone:* " + telefone + "\n" +
        "*Email:* " + email + "\n\n" +
        "*Mensagem:*\n" + mensagem;

      var url = "https://wa.me/5535999653199?text=" + encodeURIComponent(texto);
      window.open(url, "_blank", "noopener");
      form.reset();
    });
  }

  /* ---------- Ano do rodapé ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
