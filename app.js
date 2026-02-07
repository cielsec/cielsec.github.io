(() => {
  const year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  const cursor = document.querySelector(".cursor");
  const cursorBlur = document.querySelector(".cursor-blur");
  const spotlight = document.querySelector(".spotlight");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let rafId;

  const move = () => {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    if (cursor) cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
    if (cursorBlur) cursorBlur.style.transform = `translate(${currentX}px, ${currentY}px)`;
    if (spotlight) {
      spotlight.style.setProperty("--mx", `${currentX}px`);
      spotlight.style.setProperty("--my", `${currentY}px`);
    }

    rafId = requestAnimationFrame(move);
  };

  const start = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!document.body.classList.contains("has-pointer")) {
      document.body.classList.add("has-pointer");
    }
    if (!rafId) rafId = requestAnimationFrame(move);
  };

  window.addEventListener("mousemove", start);
  window.addEventListener("touchmove", (event) => {
    if (!event.touches.length) return;
    targetX = event.touches[0].clientX;
    targetY = event.touches[0].clientY;
  });

  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("has-pointer");
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });
})();
