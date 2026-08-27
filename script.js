const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

/* Reveal sections as they enter the viewport. */
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

/* Hero news rail: buttons, keyboard arrows, and native touch scrolling. */
const newsFeed = document.querySelector(".hero-news-feed");
const newsItems = Array.from(document.querySelectorAll(".hero-news-item"));
const newsPrevious = document.querySelector("[data-news-previous]");
const newsNext = document.querySelector("[data-news-next]");
const newsCurrent = document.querySelector("[data-news-current]");
const newsTotal = document.querySelector("[data-news-total]");

if (newsFeed && newsItems.length && newsPrevious && newsNext && newsCurrent && newsTotal) {
  let newsIndex = 0;
  let newsScrollFrame;

  const formatNewsIndex = (value) => String(value).padStart(2, "0");

  const getVisibleNewsCount = () => {
    const itemHeight = newsItems[0].getBoundingClientRect().height;
    return Math.max(1, Math.floor((newsFeed.clientHeight + 1) / itemHeight));
  };

  const updateNewsControls = () => {
    const visibleCount = getVisibleNewsCount();
    const lastVisibleIndex = Math.min(newsIndex + visibleCount, newsItems.length);
    newsCurrent.textContent = visibleCount > 1
      ? `${formatNewsIndex(newsIndex + 1)}–${formatNewsIndex(lastVisibleIndex)}`
      : formatNewsIndex(newsIndex + 1);
    newsTotal.textContent = formatNewsIndex(newsItems.length);
    newsPrevious.disabled = newsIndex === 0;
    newsNext.disabled = newsIndex >= newsItems.length - visibleCount;
  };

  const showNewsItem = (index) => {
    const maxIndex = Math.max(0, newsItems.length - getVisibleNewsCount());
    newsIndex = Math.max(0, Math.min(index, maxIndex));
    newsFeed.scrollTo({
      top: newsItems[newsIndex].offsetTop - newsItems[0].offsetTop,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    updateNewsControls();
  };

  newsPrevious.addEventListener("click", () => showNewsItem(newsIndex - 1));
  newsNext.addEventListener("click", () => showNewsItem(newsIndex + 1));

  newsFeed.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      showNewsItem(newsIndex + (event.key === "ArrowDown" ? 1 : -1));
    }
  });

  newsFeed.addEventListener("scroll", () => {
    cancelAnimationFrame(newsScrollFrame);
    newsScrollFrame = requestAnimationFrame(() => {
      const itemHeight = newsItems[0].getBoundingClientRect().height;
      const maxIndex = Math.max(0, newsItems.length - getVisibleNewsCount());
      const nextIndex = Math.round(newsFeed.scrollTop / itemHeight);
      newsIndex = Math.max(0, Math.min(nextIndex, maxIndex));
      updateNewsControls();
    });
  }, { passive: true });

  window.addEventListener("resize", () => showNewsItem(newsIndex));

  updateNewsControls();
}

/* Scroll gateway spotlight follows the pointer. */
const scrollGateway = document.querySelector(".scroll-gateway");

if (scrollGateway && hasFinePointer) {
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

/* Tilt and magnetic hover — desktop pointers only. */
if (!prefersReducedMotion && hasFinePointer) {
  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 7;
      const rotateX = (0.5 - y) * 7;

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

/* Signal field — particle canvas behind the hero.
   It fades out as the hero scrolls away so content sections sit on a calm background,
   and skips drawing entirely once hidden. */
const signalCanvas = document.getElementById("signal-field");
const signalContext = signalCanvas.getContext("2d");
const signalBaseOpacity = parseFloat(getComputedStyle(signalCanvas).opacity) || 1;
const heroFadeRatio = 0.85; // fraction of the viewport height over which the field fades out
const pointerRepelRadius = 150;
const linkDistance = 115;
const pointer = { x: -1000, y: -1000 };

let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let deviceScale = Math.min(window.devicePixelRatio || 1, 2);

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
  canvasWidth = document.documentElement.clientWidth;
  canvasHeight = window.innerHeight;
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  signalCanvas.width = canvasWidth * deviceScale;
  signalCanvas.height = canvasHeight * deviceScale;
  signalCanvas.style.width = `${canvasWidth}px`;
  signalCanvas.style.height = `${canvasHeight}px`;
  signalContext.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  createParticles();
};

const getHeroVisibility = () => 1 - Math.min(window.scrollY / (canvasHeight * heroFadeRatio), 1);

const drawSignalField = () => {
  const heroVisibility = getHeroVisibility();
  signalCanvas.style.opacity = (signalBaseOpacity * heroVisibility).toFixed(3);

  if (heroVisibility === 0) {
    requestAnimationFrame(drawSignalField);
    return;
  }

  signalContext.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach((particle, index) => {
    if (!prefersReducedMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < -10) particle.x = canvasWidth + 10;
    if (particle.x > canvasWidth + 10) particle.x = -10;
    if (particle.y < -10) particle.y = canvasHeight + 10;
    if (particle.y > canvasHeight + 10) particle.y = -10;

    const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
    const isNearPointer = pointerDistance < pointerRepelRadius;

    if (isNearPointer && pointerDistance > 0 && !prefersReducedMotion) {
      particle.x += ((particle.x - pointer.x) / pointerDistance) * 0.22;
      particle.y += ((particle.y - pointer.y) / pointerDistance) * 0.22;
    }

    signalContext.beginPath();
    signalContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    signalContext.fillStyle = isNearPointer ? "rgba(94, 231, 255, 0.85)" : "rgba(178, 188, 215, 0.45)";
    signalContext.fill();

    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
      const other = particles[otherIndex];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < linkDistance) {
        signalContext.beginPath();
        signalContext.moveTo(particle.x, particle.y);
        signalContext.lineTo(other.x, other.y);
        signalContext.strokeStyle = `rgba(116, 145, 205, ${(1 - distance / linkDistance) * 0.14})`;
        signalContext.lineWidth = 0.6;
        signalContext.stroke();
      }
    }
  });

  requestAnimationFrame(drawSignalField);
};

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});
window.addEventListener("pointerleave", () => {
  pointer.x = -1000;
  pointer.y = -1000;
});

resizeCanvas();
drawSignalField();
