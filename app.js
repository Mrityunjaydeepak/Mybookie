/* Mybookie demo site JS
   - Animated type line
   - On-scroll reveal
   - Stat counters
   - Mobile drawer
   - Library render + filter + search
   - Join modal
   - Typing Arena mini-game (Play modal)
*/

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Topbar compact on scroll
  const topbar = $("#topbar");
  const onScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("isCompact", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile drawer
  const drawer = $("#drawer");
  const hamburger = $("#hamburger");
  const drawerClose = $("#drawerClose");

  const openDrawer = () => {
    if (!drawer || !hamburger) return;
    drawer.classList.add("isOpen");
    drawer.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
  };
  const closeDrawer = () => {
    if (!drawer || !hamburger) return;
    drawer.classList.remove("isOpen");
    drawer.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
  };

  if (hamburger) hamburger.addEventListener("click", () => (drawer.classList.contains("isOpen") ? closeDrawer() : openDrawer()));
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) closeDrawer();
    });
  }

  // Smooth scroll for same-page anchors (keeps things clean)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const el = id && $(id);
    if (!el) return;

    e.preventDefault();
    closeDrawer();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Reveal on scroll
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((ent) => ent.isIntersecting && ent.target.classList.add("inView")),
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Typewriter
  const typeLine = $("#typeLine");
  if (typeLine && typeLine.dataset.text) {
    const txt = typeLine.dataset.text.trim();
    let i = 0;
    const speed = 18;
    const tick = () => {
      i++;
      typeLine.textContent = txt.slice(0, i);
      if (i < txt.length) setTimeout(tick, speed);
    };
    setTimeout(tick, 350);
  }

  // Counters
  const counterSpans = $$("[data-count]");
  if (counterSpans.length) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (!ent.isIntersecting) return;
          const el = ent.target;
          counterIO.unobserve(el);
          const target = Number(el.getAttribute("data-count")) || 0;
          const start = 0;
          const dur = 950;
          const t0 = performance.now();
          const step = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const val = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3)));
            el.textContent = String(val);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.35 }
    );
    counterSpans.forEach((s) => counterIO.observe(s));
  }

  // Modals: Join + Play
  const joinModal = $("#joinModal");
  const playModal = $("#playModal");
  const openModal = (m) => {
    if (!m) return;
    m.classList.add("isOpen");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeModal = (m) => {
    if (!m) return;
    m.classList.remove("isOpen");
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const bindModal = (m, closeBtnSel) => {
    if (!m) return;
    const closeBtn = $(closeBtnSel);
    if (closeBtn) closeBtn.addEventListener("click", () => closeModal(m));
    m.addEventListener("click", (e) => {
      const wantsClose = e.target && e.target.getAttribute && e.target.getAttribute("data-close") === "1";
      if (wantsClose) closeModal(m);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && m.classList.contains("isOpen")) closeModal(m);
    });
  };

  bindModal(joinModal, "#joinClose");
  bindModal(playModal, "#playClose");

  const joinButtons = [
    "#btnJoinTop", "#btnJoinHero", "#btnJoinHow", "#btnJoinFooter", "#openJoinFooter",
    "#btnJoinAboutTop", "#btnJoinAboutHero", "#btnJoinAboutBottom", "#btnJoinAboutFooter",
    "#btnJoinDrawer", "#btnJoinAboutDrawer"
  ];
  joinButtons.forEach((sel) => {
    const b = $(sel);
    if (b) b.addEventListener("click", (e) => {
      e.preventDefault();
      closeDrawer();
      openModal(joinModal);
      const name = $("#name");
      if (name) setTimeout(() => name.focus(), 50);
    });
  });

  const playButtons = ["#btnPlayTop", "#btnPlayHero", "#btnPlayCard", "#btnPlayHow", "#btnPlayFooter", "#btnPlayDrawer"];
  playButtons.forEach((sel) => {
    const b = $(sel);
    if (b) b.addEventListener("click", () => {
      closeDrawer();
      openModal(playModal);
      arena.reset(true);
    });
  });

  // Join form (demo)
  const joinForm = $("#joinForm");
  if (joinForm) {
    joinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(joinForm);
      const name = String(fd.get("name") || "Player").trim();
      closeModal(joinModal);
      toast(`Welcome, ${name}. Profile created (demo).`);
      joinForm.reset();
    });
  }

  // Library
  const bookGrid = $("#bookGrid");
  const filtersEl = $("#filters");
  const searchInput = $("#searchInput");

  const books = [
    { id: 1, title: "Neon Heist", genre: "Thriller", level: "Rookie", mode: "Boss Fight", blurb: "A fast cyber-chase where each chapter unlocks a timed typing duel." },
    { id: 2, title: "Midnight Pixels", genre: "Sci-Fi", level: "Rookie", mode: "Sprint", blurb: "Short scenes, high stakes—perfect for quick sessions and streaks." },
    { id: 3, title: "The Quiet Dragon", genre: "Fantasy", level: "Bronze", mode: "Quest", blurb: "Read to collect lore, then type spells to open hidden paths." },
    { id: 4, title: "Code & Coffee", genre: "Slice of Life", level: "Bronze", mode: "Calm", blurb: "A cozy story with optional practice challenges for accuracy lovers." },
    { id: 5, title: "The Last Scoreboard", genre: "Mystery", level: "Silver", mode: "Arena", blurb: "Clues are earned by completing clean typing streaks under pressure." },
    { id: 6, title: "Orbit of Letters", genre: "Poetry", level: "Rookie", mode: "Precision", blurb: "Slow down. Type beautifully. Accuracy gives the biggest XP." },
    { id: 7, title: "Monsoon Runner", genre: "Adventure", level: "Bronze", mode: "Quest", blurb: "Progress through storms and checkpoints—like levels in a game." },
    { id: 8, title: "The Gray Kingdom", genre: "Fantasy", level: "Silver", mode: "Boss Fight", blurb: "Longer chapters + tougher duels. The rewards feel earned." },
    { id: 9, title: "Signal: Lost & Found", genre: "Sci-Fi", level: "Bronze", mode: "Sprint", blurb: "Each scene ends with a 30-second typing burst for bonus XP." }
  ];

  const genres = ["All", ...Array.from(new Set(books.map(b => b.genre)))];

  const state = {
    genre: "All",
    q: ""
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));

  const renderFilters = () => {
    if (!filtersEl) return;
    filtersEl.innerHTML = genres.map(g => `
      <button class="filterBtn ${g === state.genre ? "isActive" : ""}" data-genre="${esc(g)}" type="button">
        ${esc(g)}
      </button>
    `).join("");
    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-genre]");
      if (!btn) return;
      state.genre = btn.getAttribute("data-genre");
      renderFilters();
      renderBooks();
    });
  };

  const bookCoverHue = (id) => {
    // deterministic pseudo-style
    const h = (id * 47) % 360;
    return `radial-gradient(circle at 20% 30%, hsla(${h}, 90%, 70%, .22), transparent 55%),
            radial-gradient(circle at 70% 70%, hsla(${(h + 140) % 360}, 90%, 65%, .18), transparent 55%),
            linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.02))`;
  };

  const renderBooks = () => {
    if (!bookGrid) return;

    const q = state.q.trim().toLowerCase();
    const list = books.filter(b => {
      const matchGenre = state.genre === "All" ? true : b.genre === state.genre;
      const hay = `${b.title} ${b.genre} ${b.level} ${b.mode} ${b.blurb}`.toLowerCase();
      const matchQ = q ? hay.includes(q) : true;
      return matchGenre && matchQ;
    });

    if (!list.length) {
      bookGrid.innerHTML = `
        <div class="card reveal inView" style="grid-column: 1 / -1;">
          <div class="bookTitle">No results</div>
          <div class="bookMeta">Try a different keyword or switch the filter.</div>
        </div>
      `;
      return;
    }

    bookGrid.innerHTML = list.map(b => `
      <article class="card reveal inView" data-book="${b.id}">
        <div class="cover" style="background: ${bookCoverHue(b.id)};"></div>

        <div class="cardTop">
          <div class="bookTitle">${esc(b.title)}</div>
          <div class="chip">${esc(b.genre)}</div>
        </div>

        <div class="bookMeta">${esc(b.blurb)}</div>

        <div class="badges">
          <span class="badge level">Level: ${esc(b.level)}</span>
          <span class="badge mode">Mode: ${esc(b.mode)}</span>
        </div>

        <div class="cardBtns">
          <button class="btn btnGhost" data-action="read" type="button">Read</button>
          <button class="btn btnPrimary" data-action="play" type="button">Play</button>
        </div>
      </article>
    `).join("");
  };

  if (filtersEl) renderFilters();
  if (bookGrid) renderBooks();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.q = e.target.value || "";
      renderBooks();
    });
  }

  // Book interactions
  if (bookGrid) {
    bookGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const card = e.target.closest("[data-book]");
      const id = Number(card?.getAttribute("data-book")) || 0;
      const book = books.find(b => b.id === id);
      const act = btn.getAttribute("data-action");

      if (!book) return;

      if (act === "read") {
        toast(`Opening "${book.title}" (demo). Replace this with your reader screen.`);
      }
      if (act === "play") {
        openModal(playModal);
        arena.reset(true, book);
      }
    });
  }

  // Toast (lightweight)
  let toastT = null;
  const toast = (msg) => {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "18px";
      el.style.bottom = "18px";
      el.style.zIndex = "120";
      el.style.maxWidth = "min(560px, 92vw)";
      el.style.padding = "12px 14px";
      el.style.borderRadius = "16px";
      el.style.border = "1px solid rgba(255,255,255,.12)";
      el.style.background = "rgba(12,14,18,.92)";
      el.style.backdropFilter = "blur(14px)";
      el.style.boxShadow = "0 16px 45px rgba(0,0,0,.55)";
      el.style.color = "rgba(255,255,255,.92)";
      el.style.transform = "translateY(10px)";
      el.style.opacity = "0";
      el.style.transition = "opacity .22s ease, transform .22s ease";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    clearTimeout(toastT);
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    toastT = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
    }, 2600);
  };

  // Typing Arena
  const arena = {
    quoteEl: $("#arenaQuote"),
    inputEl: $("#arenaInput"),
    timerEl: $("#arenaTimer"),
    xpEl: $("#arenaXP"),
    levelEl: $("#arenaLevel"),
    kpiWpm: $("#kpiWpm"),
    kpiAcc: $("#kpiAcc"),
    kpiStreak: $("#kpiStreak"),
    btnNew: $("#arenaNew"),
    btnStart: $("#arenaStart"),
    btnJoin: $("#arenaJoin"),

    quotes: [
      "Discipline is easiest when it feels like play.",
      "Small sessions build big skills—one clean streak at a time.",
      "Read the story. Type the moment. Level up your focus.",
      "Speed without accuracy is noise. Accuracy becomes power.",
      "Today’s progress is tomorrow’s confidence."
    ],

    state: {
      running: false,
      t: 30,
      startTime: 0,
      streak: 0,
      xp: 0,
      text: "",
      bookHint: ""
    },

    pickQuote(book) {
      const base = this.quotes[Math.floor(Math.random() * this.quotes.length)];
      if (book?.title) return `“${base}” — ${book.title}`;
      return `“${base}”`;
    },

    setQuote(text) {
      this.state.text = text;
      this.renderQuote("");
    },

    renderQuote(typed) {
      if (!this.quoteEl) return;
      const target = this.state.text || "";
      const t = typed || "";
      let good = "";
      let bad = "";
      let rest = "";

      for (let i = 0; i < target.length; i++) {
        const c = target[i];
        const tc = t[i];
        if (tc == null) { rest = target.slice(i); break; }
        if (tc === c && bad.length === 0) good += c;
        else bad += c; // once wrong starts, mark remaining as bad until correction
      }

      // If user typed longer, consider extra as bad contextually
      const extra = t.length > target.length ? t.slice(target.length) : "";

      this.quoteEl.innerHTML = `
        <span class="good">${esc(good)}</span><span class="bad">${esc(bad)}</span><span class="rest">${esc(rest)}</span>
        ${extra ? `<span class="bad">${esc(extra)}</span>` : ""}
      `;
    },

    computeStats(typed) {
      const target = this.state.text;
      const typedLen = typed.length;
      const minLen = Math.min(target.length, typedLen);

      let correct = 0;
      for (let i = 0; i < minLen; i++) if (typed[i] === target[i]) correct++;

      const acc = typedLen === 0 ? 0 : Math.max(0, Math.round((correct / typedLen) * 100));
      const elapsedMin = Math.max(0.001, (performance.now() - this.state.startTime) / 60000);
      const words = typedLen / 5;
      const wpm = Math.max(0, Math.round(words / elapsedMin));

      return { acc, wpm, correct };
    },

    setUI() {
      if (this.timerEl) this.timerEl.textContent = `Time: ${this.state.t}s`;
      if (this.xpEl) this.xpEl.textContent = `XP: ${this.state.xp}`;
      if (this.levelEl) {
        const lvl = this.state.streak >= 5 ? "Elite" : this.state.streak >= 3 ? "Pro" : this.state.streak >= 1 ? "Rookie+" : "Rookie";
        this.levelEl.textContent = `Level: ${lvl}`;
      }
      if (this.kpiStreak) this.kpiStreak.textContent = String(this.state.streak);
    },

    reset(focus = false, book = null) {
      this.stop();
      this.state.t = 30;
      this.state.running = false;
      this.state.startTime = 0;
      this.state.text = this.pickQuote(book);
      this.state.bookHint = book?.title ? book.title : "";
      if (this.inputEl) this.inputEl.value = "";
      if (this.kpiWpm) this.kpiWpm.textContent = "0";
      if (this.kpiAcc) this.kpiAcc.textContent = "0%";
      this.setQuote(this.state.text);
      this.setUI();
      if (this.btnStart) this.btnStart.textContent = "Start match";
      if (focus && this.inputEl) setTimeout(() => this.inputEl.focus(), 50);
    },

    start() {
      if (!this.inputEl) return;
      if (this.state.running) return;

      this.state.running = true;
      this.state.t = 30;
      this.state.startTime = performance.now();
      this.inputEl.disabled = false;
      this.inputEl.focus();
      if (this.btnStart) this.btnStart.textContent = "Running…";

      const tick = () => {
        if (!this.state.running) return;
        this.state.t -= 1;
        this.setUI();
        if (this.state.t <= 0) {
          this.finish();
          return;
        }
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
    },

    stop() {
      this.state.running = false;
      if (this.btnStart) this.btnStart.textContent = "Start match";
    },

    finish() {
      this.state.running = false;
      if (!this.inputEl) return;

      const typed = this.inputEl.value || "";
      const { acc, wpm } = this.computeStats(typed);
      const complete = typed === this.state.text;

      // XP logic (simple + satisfying)
      const xpGain = Math.round((acc * 0.6) + Math.min(120, wpm) * 0.4);
      const bonus = complete ? 40 : 0;
      const total = Math.max(0, xpGain + bonus);

      this.state.xp += total;

      if (complete && acc >= 95) this.state.streak += 1;
      else this.state.streak = Math.max(0, this.state.streak - 1);

      this.setUI();
      if (this.btnStart) this.btnStart.textContent = "Start match";
      toast(`Match ended: ${wpm} WPM • ${acc}% • +${total} XP${complete ? " (clear!)" : ""}`);
    }
  };

  if (arena.btnNew) arena.btnNew.addEventListener("click", () => arena.reset(true));
  if (arena.btnStart) arena.btnStart.addEventListener("click", () => arena.start());
  if (arena.btnJoin) arena.btnJoin.addEventListener("click", () => openModal(joinModal));

  if (arena.inputEl) {
    arena.inputEl.addEventListener("input", () => {
      const typed = arena.inputEl.value || "";
      arena.renderQuote(typed);

      if (!arena.state.running) return;

      const { acc, wpm } = arena.computeStats(typed);
      if (arena.kpiWpm) arena.kpiWpm.textContent = String(wpm);
      if (arena.kpiAcc) arena.kpiAcc.textContent = `${acc}%`;

      // Auto-finish if exact match
      if (typed === arena.state.text) arena.finish();
    });
  }

  // Ensure input disabled when modal closed (nice UX)
  const playClose = $("#playClose");
  if (playClose) playClose.addEventListener("click", () => arena.stop());

})();
