(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Header hairline appears only once the page moves.
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu: focus trap, Escape, and background inert.
  const menu = $("#menu");
  const menuToggle = $("#menu-toggle");
  const menuClose = $("#menu-close");
  const pageRegions = [$(".site-header"), $("main"), $("footer")].filter(Boolean);
  let lastFocus = null;

  function menuKeydown(event) {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = $$("a[href], button:not([disabled])", menu).filter(
      (el) => el.offsetParent !== null
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    pageRegions.forEach((el) => {
      el.inert = true;
    });
    menuClose.focus();
    document.addEventListener("keydown", menuKeydown);
  }

  function closeMenu(restoreFocus = true) {
    if (menu.hidden) return;
    menu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    pageRegions.forEach((el) => {
      el.inert = false;
    });
    document.removeEventListener("keydown", menuKeydown);
    if (restoreFocus && lastFocus) lastFocus.focus();
  }

  menuToggle.addEventListener("click", openMenu);
  menuClose.addEventListener("click", () => closeMenu());
  $$("a", menu).forEach((link) => link.addEventListener("click", () => closeMenu(false)));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu(false);
  });

  // Local dates, compared as YYYY-MM-DD strings.
  function toISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseISO(value) {
    return new Date(`${value}T00:00:00`);
  }

  function addDays(value, days) {
    const date = parseISO(value);
    date.setDate(date.getDate() + days);
    return toISO(date);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);
  const tomorrowISO = addDays(todayISO, 1);

  const arrive = $("#arrive");
  const depart = $("#depart");
  const bookingStatus = $("#booking-status");

  arrive.min = todayISO;
  depart.min = tomorrowISO;

  arrive.addEventListener("change", () => {
    if (!arrive.value) return;
    const nextDay = addDays(arrive.value, 1);
    depart.min = nextDay;
    if (depart.value && depart.value < nextDay) depart.value = nextDay;
    bookingStatus.textContent = "";
  });

  depart.addEventListener("change", () => {
    bookingStatus.textContent = "";
  });

  // Enquiry form dates.
  const enquireArrive = $("#arrive-2");
  const enquireDepart = $("#depart-2");
  const enquireStatus = $("#enquire-status");
  const enquireName = $("#name");
  const enquireGuests = $("#guests-2");
  const enquireMessage = $("#message");

  enquireArrive.min = todayISO;
  enquireDepart.min = tomorrowISO;

  enquireArrive.addEventListener("change", () => {
    if (!enquireArrive.value) return;
    const nextDay = addDays(enquireArrive.value, 1);
    enquireDepart.min = nextDay;
    if (enquireDepart.value && enquireDepart.value < nextDay) {
      enquireDepart.value = nextDay;
    }
  });

  function setError(input, errorId) {
    const error = document.getElementById(errorId);
    if (error) error.hidden = false;
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input, errorId) {
    const error = document.getElementById(errorId);
    if (error) error.hidden = true;
    input.removeAttribute("aria-invalid");
  }

  const enquiryFields = [
    [enquireName, "name-error"],
    [enquireArrive, "arrive-2-error"],
    [enquireDepart, "depart-2-error"],
  ];

  enquiryFields.forEach(([input, errorId]) => {
    input.addEventListener("input", () => {
      clearError(input, errorId);
      enquireStatus.textContent = "";
    });
  });

  $("#hero-booking").addEventListener("submit", (event) => {
    event.preventDefault();
    bookingStatus.textContent = "";

    if (!arrive.value || !depart.value) {
      bookingStatus.textContent = "Choose an arrival and departure date.";
      (!arrive.value ? arrive : depart).focus();
      return;
    }

    if (arrive.value < todayISO) {
      bookingStatus.textContent = "Arrival can't be in the past.";
      arrive.focus();
      return;
    }

    if (depart.value <= arrive.value) {
      bookingStatus.textContent = "Departure must be after arrival.";
      depart.focus();
      return;
    }

    enquireArrive.value = arrive.value;
    enquireDepart.min = addDays(arrive.value, 1);
    enquireDepart.value = depart.value;
    enquireGuests.value = $("#guests").value;

    bookingStatus.textContent = "Dates noted. Review them below.";
    $("#enquire-form").scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      if (window.innerWidth > 860) enquireName.focus({ preventScroll: true });
    }, 700);
  });

  $("#enquire-form").addEventListener("submit", (event) => {
    event.preventDefault();
    enquireStatus.textContent = "";
    enquireStatus.classList.remove("is-error");
    let valid = true;

    if (enquireName.value.trim().length < 2) {
      setError(enquireName, "name-error");
      valid = false;
    } else {
      clearError(enquireName, "name-error");
    }

    if (!enquireArrive.value || enquireArrive.value < todayISO) {
      setError(enquireArrive, "arrive-2-error");
      valid = false;
    } else {
      clearError(enquireArrive, "arrive-2-error");
    }

    if (!enquireDepart.value || enquireDepart.value <= enquireArrive.value) {
      setError(enquireDepart, "depart-2-error");
      valid = false;
    } else {
      clearError(enquireDepart, "depart-2-error");
    }

    if (!valid) {
      enquireStatus.textContent = "Please check the highlighted fields.";
      enquireStatus.classList.add("is-error");
      const firstInvalid = $('[aria-invalid="true"]', $("#enquire-form"));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const guests = enquireGuests.options[enquireGuests.selectedIndex].text;
    const note = enquireMessage.value.trim();
    const name = enquireName.value.trim();
    const dateFormat = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const pretty = (value) => dateFormat.format(parseISO(value));
    const notePart = note ? ` · ${note.replace(/\.+$/, "")}` : "";

    enquireStatus.textContent =
      `${name} · ${pretty(enquireArrive.value)} to ${pretty(enquireDepart.value)} · ${guests}${notePart}. ` +
      "Nothing has been sent; this is a design study.";
  });

  // Local time in Rome, refreshed twice a minute.
  const localTime = $("#local-time");
  const timeFormat = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  function tick() {
    if (localTime) localTime.textContent = timeFormat.format(new Date());
  }

  tick();
  window.setInterval(tick, 30000);

  // Image reveals. Content stays visible without IntersectionObserver or with reduced motion.
  const reveals = $$(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    document.documentElement.classList.remove("js");
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    reveals.forEach((el) => observer.observe(el));
  }
})();
