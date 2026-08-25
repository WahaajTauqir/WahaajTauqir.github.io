const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointerGlow = document.querySelector(".pointer-glow");
const cursorDot = document.querySelector(".cursor-dot");

document.getElementById("year").textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.13 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

const scrollGateway = document.querySelector(".scroll-gateway");

if (scrollGateway && window.matchMedia("(pointer: fine)").matches) {
  scrollGateway.addEventListener("pointermove", (event) => {
    const rect = scrollGateway.getBoundingClientRect();
    scrollGateway.style.setProperty("--gateway-x", `${event.clientX - rect.left}px`);
    scrollGateway.style.setProperty("--gateway-y", `${event.clientY - rect.top}px`);
  });

  scrollGateway.addEventListener("pointerleave", () => {
    scrollGateway.style.setProperty("--gateway-x", "50%");
    scrollGateway.style.setProperty("--gateway-y", "50%");
  });
}

if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let dotX = pointerX;
  let dotY = pointerY;

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerGlow.style.transform = `translate(${pointerX - 240}px, ${pointerY - 240}px)`;
  });

  const animateCursor = () => {
    dotX += (pointerX - dotX) * 0.24;
    dotY += (pointerY - dotY) * 0.24;
    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  document.querySelectorAll("a, [data-tilt]").forEach((element) => {
    element.addEventListener("pointerenter", () => cursorDot.classList.add("is-hovering"));
    element.addEventListener("pointerleave", () => cursorDot.classList.remove("is-hovering"));
  });

  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 7;
      const rotateX = (0.5 - y) * 7;

      element.style.setProperty("--tilt-x", `${x * 100}%`);
      element.style.setProperty("--tilt-y", `${y * 100}%`);
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

const canvas = document.getElementById("signal-field");
const context = canvas.getContext("2d");
let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let deviceScale = Math.min(window.devicePixelRatio || 1, 2);
const mouse = { x: -1000, y: -1000 };

const createParticles = () => {
  const count = Math.min(72, Math.max(32, Math.floor(canvasWidth / 22)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    radius: Math.random() * 1.3 + 0.4,
  }));
};

const resizeCanvas = () => {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvasWidth * deviceScale;
  canvas.height = canvasHeight * deviceScale;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  createParticles();
};

const drawSignalField = () => {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach((particle, index) => {
    if (!prefersReducedMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < -10) particle.x = canvasWidth + 10;
    if (particle.x > canvasWidth + 10) particle.x = -10;
    if (particle.y < -10) particle.y = canvasHeight + 10;
    if (particle.y > canvasHeight + 10) particle.y = -10;

    const mouseDistance = Math.hypot(particle.x - mouse.x, particle.y - mouse.y);
    if (mouseDistance < 150 && mouseDistance > 0 && !prefersReducedMotion) {
      particle.x += ((particle.x - mouse.x) / mouseDistance) * 0.22;
      particle.y += ((particle.y - mouse.y) / mouseDistance) * 0.22;
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = mouseDistance < 150 ? "rgba(94, 231, 255, 0.85)" : "rgba(178, 188, 215, 0.45)";
    context.fill();

    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
      const other = particles[otherIndex];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 115) {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(116, 145, 205, ${(1 - distance / 115) * 0.14})`;
        context.lineWidth = 0.6;
        context.stroke();
      }
    }
  });

  requestAnimationFrame(drawSignalField);
};

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
window.addEventListener("pointerleave", () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

resizeCanvas();
drawSignalField();
