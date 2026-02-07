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
