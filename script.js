(function () {
  const content = window.creatorSiteContent;

  if (!content) {
    return;
  }

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const emailHref = `mailto:${content.profile.email}`;

  document.title = `${content.profile.name} | ${content.profile.creatorName}`;
  setText("[data-profile-name]", content.profile.name);
  setText("[data-profile-headline]", content.profile.headline);
  setText("[data-profile-kicker]", content.profile.kicker);
  setText("[data-profile-role]", content.profile.role);
  setText("[data-profile-bio]", content.profile.bio);
  setText("[data-profile-about]", content.profile.about);
  setText("[data-brand-initials]", content.profile.initials);
  setText("[data-footer-name]", content.profile.name);

  document.querySelectorAll("[data-brand-avatar]").forEach((image) => {
    image.setAttribute("src", content.profile.avatar);
    image.setAttribute("alt", `${content.profile.name} portrait`);
  });

  document.querySelectorAll("[data-email-link]").forEach((link) => {
    link.setAttribute("href", emailHref);
    if (link.classList.contains("large")) {
      link.textContent = content.profile.email;
    }
  });

  const socialMarkup = content.socials
    .map(
      (item) => `
        <a href="${item.url}" target="_blank" rel="noopener">
          <span>${escapeHtml(item.label)}</span>
        </a>
      `,
    )
    .join("");

  document.querySelectorAll("[data-social-links]").forEach((node) => {
    node.innerHTML = socialMarkup;
  });

  const metrics = document.querySelector("[data-metrics]");
  metrics.innerHTML = content.metrics
    .map(
      (item) => `
        <article class="metric">
          <strong data-counter="${escapeHtml(item.value)}">${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(item.detail)}</small>
        </article>
      `,
    )
    .join("");

  const projects = document.querySelector("[data-projects]");
  projects.innerHTML = content.projects
    .map(
      (item, index) => `
        <article class="case-card" data-animate>
          <div class="case-index">${String(index + 1).padStart(2, "0")}</div>
          <div>
            <p class="case-meta">${escapeHtml(item.brand)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="case-format">${escapeHtml(item.format)}</p>
            <p>${escapeHtml(item.result)}</p>
          </div>
        </article>
      `,
    )
    .join("");

  const collaborations = document.querySelector("[data-collaborations]");
  const logoTile = (item) => `
    <article class="logo-tile" data-animate>
      <img src="${item.logo}" alt="${escapeHtml(item.name)} logo" loading="lazy">
      <span>${escapeHtml(item.name)}</span>
      <small>${escapeHtml(item.category)}</small>
    </article>
  `;
  collaborations.innerHTML = content.collaborations.map(logoTile).join("");

  const marquee = document.querySelector("[data-logo-marquee]");
  const marqueeItems = [...content.collaborations, ...content.collaborations];
  marquee.innerHTML = marqueeItems
    .map(
      (item) => `
        <div class="marquee-logo">
          <img src="${item.logo}" alt="" loading="lazy">
        </div>
      `,
    )
    .join("");

  const proofPoints = document.querySelector("[data-proof-points]");
  proofPoints.innerHTML = content.proofPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const pillars = document.querySelector("[data-pillars]");
  pillars.innerHTML = content.pillars
    .map(
      (item) => `
        <article class="pillar-card" data-animate>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `,
    )
    .join("");

  const services = document.querySelector("[data-services]");
  services.innerHTML = content.services
    .map(
      (item) => `
        <article class="service-card" data-animate>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `,
    )
    .join("");

  const process = document.querySelector("[data-process]");
  process.innerHTML = content.process
    .map(
      (item, index) => `
        <article class="process-step" data-animate>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <p>${escapeHtml(item)}</p>
        </article>
      `,
    )
    .join("");

  const header = document.querySelector("[data-header]");
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealNodes = document.querySelectorAll("[data-animate]");
  const revealIfAlreadyVisible = (node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      node.classList.add("is-visible");
      return true;
    }
    return false;
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  revealNodes.forEach((node) => {
    if (!revealIfAlreadyVisible(node)) {
      revealObserver.observe(node);
    }
  });

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const node = entry.target;
        const value = node.dataset.counter;
        const match = value.match(/^(\D?)(\d+(?:\.\d+)?)(.*)$/);
        if (!match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          node.textContent = value;
          counterObserver.unobserve(node);
          return;
        }
        const [, prefix, number, suffix] = match;
        const target = Number(number);
        const decimals = number.includes(".") ? 1 : 0;
        const start = performance.now();
        const duration = 900;

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          node.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            node.textContent = value;
          }
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(node);
      });
    },
    { threshold: 0.35 },
  );

  document.querySelectorAll("[data-counter]").forEach((node) => counterObserver.observe(node));

  const hero = document.querySelector(".hero");
  const portrait = document.querySelector(".hero-portrait");
  if (hero && portrait && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.setProperty("--portrait-x", `${x * 14}px`);
      portrait.style.setProperty("--portrait-y", `${y * 10}px`);
    });
  }
})();
