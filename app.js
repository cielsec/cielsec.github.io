const body = document.body;
const enterBtn = document.getElementById("enter-btn");
const hero = document.getElementById("hero");
const hub = document.getElementById("hub");
const hubButtons = document.querySelectorAll(".hub-btn");
const hubPanels = document.querySelectorAll(".hub-panel");
const projectCards = document.querySelectorAll(".project-card");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

const setScrollVar = () => {
  document.documentElement.style.setProperty("--scroll", `${window.scrollY}px`);
};

const showHub = () => {
  if (hero.classList.contains("is-exiting")) {
    return;
  }
  hero.classList.add("is-exiting");
  hero.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    hero.classList.remove("is-active");
    hub.classList.add("is-active");
    hub.removeAttribute("aria-hidden");
    hub.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 420);
};

const activatePanel = (target) => {
  hubButtons.forEach((btn) => btn.classList.remove("is-active"));
  hubPanels.forEach((panel) => panel.classList.remove("is-active"));
  const activeButton = document.querySelector(`.hub-btn[data-panel="${target}"]`);
  const activePanel = document.getElementById(`panel-${target}`);
  if (activeButton && activePanel) {
    activeButton.classList.add("is-active");
    activePanel.classList.add("is-active");
  }
};

const initCursor = () => {
  if (!cursorDot || !cursorRing) return;

  const updateCursor = (event) => {
    const { clientX, clientY } = event;
    cursorDot.style.left = `${clientX}px`;
    cursorDot.style.top = `${clientY}px`;
    cursorRing.style.left = `${clientX}px`;
    cursorRing.style.top = `${clientY}px`;
  };

  document.addEventListener("mousemove", updateCursor);
  document.addEventListener("mouseleave", () => body.classList.add("cursor-hidden"));
  document.addEventListener("mouseenter", () => body.classList.remove("cursor-hidden"));

  const hoverTargets = document.querySelectorAll("button, a");
  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => body.classList.add("cursor-hover"));
    target.addEventListener("mouseleave", () => body.classList.remove("cursor-hover"));
  });

  if (window.matchMedia("(pointer: coarse)").matches) {
    body.classList.add("cursor-hidden");
  }
};

enterBtn?.addEventListener("click", showHub);

hubButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activatePanel(button.dataset.panel);
  });
});

projectCards.forEach((card) => {
  const toggle = card.querySelector(".project-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const isOpen = card.classList.toggle("is-open");
    toggle.textContent = isOpen ? "Ocultar projeto" : "Mostrar projeto";
  });
});

window.addEventListener("scroll", setScrollVar, { passive: true });
window.addEventListener("load", setScrollVar);

initCursor();

(() => {
  const hero = document.getElementById("hero");
  const hub = document.getElementById("hub");
  const linesEl = document.getElementById("boot-lines");
  const actions = document.getElementById("hero-actions");
  const enterBtn = document.getElementById("enter-btn");

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Ajusta scroll parallax no fundo (se você usa --scroll no CSS)
  window.addEventListener("scroll", () => {
    document.documentElement.style.setProperty("--scroll", `${window.scrollY}px`);
  }, { passive: true });

  // Cursor custom (opcional)
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (dot) dot.style.left = mx + "px", dot.style.top = my + "px";
    document.body.classList.remove("cursor-hidden");
  });

  // easing do ring
  const tick = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    if (ring) ring.style.left = rx + "px", ring.style.top = ry + "px";
    requestAnimationFrame(tick);
  };
  tick();

  // hover state
  const hoverables = ["button", "a", "summary"];
  document.addEventListener("mouseover", (e) => {
    if (hoverables.some(s => e.target.closest?.(s))) document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", () => document.body.classList.remove("cursor-hover"));

  // ===== Terminal boot =====
  const bootLines = [
    { t: `┌──(${wrap("ciel","user")}㉿${wrap("kali","host")})-[~]\n└─$ ${wrap("whoami","cmd")}`, d: 450 },
    { t: `${wrap("ciel","ok")}`, d: 350 },
    { t: `└─$ ${wrap("echo \"conhecimento é poder\"","cmd")}`, d: 450 },
    { t: `${wrap("conhecimento é poder","dim")}`, d: 300 },
    { t: `└─$ ${wrap("echo \"disciplina > ego\"","cmd")}`, d: 430 },
    { t: `${wrap("disciplina > ego","dim")}`, d: 320 },
    { t: `└─$ ${wrap("echo \"silêncio. precisão. controle.\"","cmd")}`, d: 480 },
    { t: `${wrap("silêncio. precisão. controle.","dim")}`, d: 320 },
    { t: `└─$ ${wrap("init --modules panel projects tools","cmd")}`, d: 520 },
    { t: `${wrap("[OK]","ok")} carregando módulos...`, d: 380 },
    { t: `${wrap("[OK]","ok")} preparando interface...`, d: 340 },
    { t: `${wrap("[OK]","ok")} pronto.`, d: 200 }
  ];

  function wrap(text, cls){
    const map = {
      user: "term-user",
      host: "term-host",
      cmd: "cmd",
      ok: "term-ok",
      dim: "term-dim",
      warn: "term-warn"
    };
    return `<span class="${map[cls] || ""}">${escapeHtml(text)}</span>`;
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  async function typeLine(html, speed = 12){
    const line = document.createElement("div");
    line.className = "term-line";
    linesEl.appendChild(line);

    // typing “fake”: revela caractere por caractere, mantendo tags simples
    // estratégia: converte tudo em texto temporário removendo tags e depois injeta no final
    const plain = html.replace(/<[^>]+>/g, "");
    let out = "";
    for (let i = 0; i < plain.length; i++){
      out += plain[i];
      line.textContent = out;
      await sleep(speed);
    }
    // no fim, coloca versão com spans
    line.innerHTML = html;
    linesEl.scrollTop = linesEl.scrollHeight;
  }

  async function boot(){
    if (!linesEl) return;

    linesEl.innerHTML = "";
    await sleep(250);

    for (const l of bootLines){
      await typeLine(l.t, 10);
      await sleep(l.d);
    }

    // Mostra botão no final
    if (actions){
      actions.classList.remove("hero-actions-hidden");
      actions.classList.add("hero-actions-visible");
    }
  }

  // ===== Troca de tela com wipe =====
  function showHub(){
    // ativa wipe
    document.body.classList.add("is-wiping");

    // animação + troca
    setTimeout(() => {
      hero.classList.add("is-exiting");
      setTimeout(() => {
        hero.classList.remove("is-active", "is-exiting");
        hero.setAttribute("aria-hidden", "true");

        hub.classList.add("is-active");
        hub.setAttribute("aria-hidden", "false");
        hub.focus?.();

        document.body.classList.remove("is-wiping");
      }, 420);
    }, 80);
  }

  // clique
  enterBtn?.addEventListener("click", showHub);

  // inicia boot ao carregar
  window.addEventListener("load", boot);

  // botão voltar (se existir)
  document.addEventListener("click", (e) => {
    const back = e.target.closest?.('[data-action="back"]');
    if (!back) return;

    document.body.classList.add("is-wiping");
    setTimeout(() => {
      hub.classList.remove("is-active");
      hub.setAttribute("aria-hidden", "true");

      hero.classList.add("is-active");
      hero.setAttribute("aria-hidden", "false");

      document.body.classList.remove("is-wiping");

      // re-roda boot e esconde botão até terminar
      if (actions){
        actions.classList.add("hero-actions-hidden");
        actions.classList.remove("hero-actions-visible");
      }
      boot();
    }, 320);
  });

  // ===== Tabs do hub (se você já usa data-panel) =====
  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".hub-btn");
    if (!btn) return;

    const panel = btn.getAttribute("data-panel");
    if (!panel) return;

    document.querySelectorAll(".hub-btn").forEach(b => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });

    document.querySelectorAll(".hub-panel").forEach(p => {
      const on = p.getAttribute("data-panel-id") === panel;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  });
})();

