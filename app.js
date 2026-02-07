(() => {
  const body = document.body;

  const hero = document.getElementById("hero");
  const hub = document.getElementById("hub");
  const enterBtn = document.getElementById("enter-btn");

  const linesEl = document.getElementById("boot-lines");
  const currentEl = document.getElementById("boot-current");
  const actionsEl = document.getElementById("hero-actions");

  const hubButtons = document.querySelectorAll(".hub-btn");
  const hubPanels = document.querySelectorAll(".hub-panel");

  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ===== Scroll var (parallax) =====
  let scrollTicking = false;
  const setScrollVar = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--scroll", `${window.scrollY}px`);
      scrollTicking = false;
    });
  };
  window.addEventListener("scroll", setScrollVar, { passive: true });
  window.addEventListener("load", setScrollVar);

  // ===== Cursor custom (sem duplicação) =====
  const initCursor = () => {
    if (!cursorDot || !cursorRing) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = `${mx}px`;
      cursorDot.style.top = `${my}px`;
      body.classList.remove("cursor-hidden");
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursorRing.style.left = `${rx}px`;
      cursorRing.style.top = `${ry}px`;
      requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", () => body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => body.classList.remove("cursor-hidden"));

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("button, a, summary")) body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", () => body.classList.remove("cursor-hover"));

    if (window.matchMedia("(pointer: coarse)").matches) {
      body.classList.add("cursor-hidden");
    }

    tick();
  };

  // ===== Tabs =====
  const activatePanel = (target) => {
    hubButtons.forEach(btn => {
      const on = btn.dataset.panel === target;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    hubPanels.forEach(panel => {
      const on = panel.dataset.panelId === target;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  };

  hubButtons.forEach(btn => {
    btn.addEventListener("click", () => activatePanel(btn.dataset.panel));
  });

  // ===== Projects: texto Mostrar/Ocultar =====
  document.querySelectorAll("details.project-details").forEach(det => {
    const sum = det.querySelector("[data-summary]");
    if (!sum) return;
    det.addEventListener("toggle", () => {
      sum.textContent = det.open ? "Ocultar" : "Mostrar";
    });
  });

  // ===== Terminal Boot (com estilos) =====
  const seg = (text, cls) => ({ text, cls });

  const boot = [
    // prompt + comando
    { parts: [
      seg("┌──(", "term-dim"),
      seg("ciel", "term-user"),
      seg("㉿", "term-dim"),
      seg("kali", "term-host"),
      seg(")-[~]", "term-dim"),
    ], nl: true, wait: 160 },
    { parts: [
      seg("└─$ ", "term-prompt"),
      seg("whoami", "term-cmd"),
    ], nl: false, wait: 240 },
    { parts: [ seg("ciel", "term-ok") ], nl: true, wait: 220 },

    { parts: [ seg("└─$ ", "term-prompt"), seg('echo "conhecimento é poder"', "term-cmd") ], nl: false, wait: 220 },
    { parts: [ seg("conhecimento é poder", "term-dim") ], nl: true, wait: 200 },

    { parts: [ seg("└─$ ", "term-prompt"), seg('echo "disciplina > ego"', "term-cmd") ], nl: false, wait: 220 },
    { parts: [ seg("disciplina > ego", "term-dim") ], nl: true, wait: 200 },

    { parts: [ seg("└─$ ", "term-prompt"), seg('echo "silêncio. precisão. controle."', "term-cmd") ], nl: false, wait: 220 },
    { parts: [ seg("silêncio. precisão. controle.", "term-dim") ], nl: true, wait: 210 },

    { parts: [ seg("└─$ ", "term-prompt"), seg("init --modules panel projects tools", "term-cmd") ], nl: false, wait: 260 },
    { parts: [ seg("[OK] ", "term-ok"), seg("carregando módulos...", "term-dim") ], nl: true, wait: 180 },
    { parts: [ seg("[OK] ", "term-ok"), seg("preparando interface...", "term-dim") ], nl: true, wait: 180 },
    { parts: [ seg("[OK] ", "term-ok"), seg("pronto.", "term-dim") ], nl: true, wait: 180 },
  ];

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));

  const renderParts = (parts) => {
    return parts.map(p => `<span class="${p.cls}">${escapeHtml(p.text)}</span>`).join("");
  };

  async function typeParts(parts, speed = 10) {
    if (!currentEl) return;

    // Digita char por char, mantendo classes por bloco
    let html = "";
    for (const p of parts) {
      const text = p.text;
      for (let i = 0; i < text.length; i++) {
        const partial = escapeHtml(text.slice(0, i + 1));
        const doneBefore = html;
        const thisSpan = `<span class="${p.cls}">${partial}</span>`;
        currentEl.innerHTML = doneBefore + thisSpan + `<span class="cursor" aria-hidden="true"></span>`;
        await sleep(speed);
      }
      html += `<span class="${p.cls}">${escapeHtml(text)}</span>`;
    }
    currentEl.innerHTML = html + `<span class="cursor" aria-hidden="true"></span>`;
  }

  function commitCurrentLine() {
    if (!linesEl || !currentEl) return;
    const line = document.createElement("div");
    line.className = "term-line";
    // remove cursor da cópia
    const clone = currentEl.cloneNode(true);
    const cur = clone.querySelector(".cursor");
    if (cur) cur.remove();
    line.innerHTML = clone.innerHTML.trim();
    linesEl.appendChild(line);
    linesEl.scrollTop = linesEl.scrollHeight;
    // limpa linha atual
    currentEl.innerHTML = `<span class="cursor" aria-hidden="true"></span>`;
  }

  async function runBoot() {
    if (!linesEl || !currentEl) return;

    // reset terminal
    linesEl.innerHTML = "";
    currentEl.innerHTML = `<span class="cursor" aria-hidden="true"></span>`;

    // esconde botão até final
    if (actionsEl) {
      actionsEl.classList.add("hero-actions-hidden");
      actionsEl.classList.remove("hero-actions-visible");
    }

    await sleep(220);

    for (const step of boot) {
      await typeParts(step.parts, 10);
      commitCurrentLine();
      if (step.nl) {
        // quebra visual (já commitou)
      }
      await sleep(step.wait);
    }

    // mostra botão
    if (actionsEl) {
      actionsEl.classList.remove("hero-actions-hidden");
      actionsEl.classList.add("hero-actions-visible");
    }
  }

  // ===== Transição de tela =====
  const goHub = () => {
    if (!hero || !hub) return;
    if (hero.classList.contains("is-exiting")) return;

    body.classList.add("is-wiping");
    hero.classList.add("is-exiting");
    hero.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      hero.classList.remove("is-active", "is-exiting");

      hub.classList.add("is-active");
      hub.setAttribute("aria-hidden", "false");
      hub.focus?.();

      body.classList.remove("is-wiping");
    }, 520);
  };

  const goHero = () => {
    if (!hero || !hub) return;

    body.classList.add("is-wiping");

    setTimeout(() => {
      hub.classList.remove("is-active");
      hub.setAttribute("aria-hidden", "true");

      hero.classList.add("is-active");
      hero.setAttribute("aria-hidden", "false");

      body.classList.remove("is-wiping");

      runBoot();
    }, 420);
  };

  enterBtn?.addEventListener("click", goHub);

  document.addEventListener("click", (e) => {
    const back = e.target.closest?.('[data-action="back"]');
    if (back) goHero();
  });

  // ===== Init =====
  initCursor();
  window.addEventListener("load", runBoot);
})();
