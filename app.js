// app.js — Ciel Sec
(() => {
  const enterBtn = document.getElementById("enterBtn");
  const year = document.getElementById("y");
  const gate = document.getElementById("gate");

  if (year) year.textContent = String(new Date().getFullYear());

  const enter = () => {
    document.body.classList.add("entered");
    enterBtn?.setAttribute("aria-expanded", "true");
    // Move foco pro conteúdo depois da transição
    window.setTimeout(() => {
      const firstLink = document.querySelector(".topbar a, .chip, .card a");
      firstLink?.focus?.();
      // scroll suave pro topo do conteúdo (caso esteja em telas menores)
      document.getElementById("desk")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 420);
  };

  enterBtn?.addEventListener("click", enter);

  // Teclado: Enter/Espaço na tela inicial
  gate?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      enter();
    }
  });

  // Filtro de cards por tags
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".card"));

  const setActiveChip = (btn) => {
    chips.forEach(c => c.classList.toggle("is-active", c === btn));
  };

  const filterCards = (key) => {
    cards.forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
      const show = key === "all" ? true : tags.includes(key);
      card.style.display = show ? "" : "none";
    });
  };

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const key = chip.getAttribute("data-filter") || "all";
      setActiveChip(chip);
      filterCards(key);
    });
  });
})();