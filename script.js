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

  const creations = document.querySelector("[data-creations]");
  if (creations && content.creations) {
    const creationItems = content.creations;
    const cloneBuffer = Math.min(4, creationItems.length);
    const leadingClones = creationItems.slice(-cloneBuffer).map((item, index) => ({
      item,
      realIndex: creationItems.length - cloneBuffer + index,
      cloneSide: "before",
    }));
    const originalItems = creationItems.map((item, index) => ({
      item,
      realIndex: index,
      cloneSide: "original",
    }));
    const trailingClones = creationItems.slice(0, cloneBuffer).map((item, index) => ({
      item,
      realIndex: index,
      cloneSide: "after",
    }));
    const circularItems = [...leadingClones, ...originalItems, ...trailingClones];

    const renderCreationCard = ({ item, realIndex, cloneSide }, visualIndex) => {
      const isClone = cloneSide !== "original";
      const posterPath =
        item.poster ||
        (item.video ? item.video.replace("/creations/", "/creations/posters/").replace(/\.mp4$/, ".png") : "");
      const videoMarkup = item.video
        ? `
          <video
            src="${escapeHtml(item.video)}"
            ${posterPath ? `poster="${escapeHtml(posterPath)}"` : ""}
            muted
            loop
            playsinline
            preload="none"
          ></video>
        `
        : "";
      const cardAttributes = `
        class="creation-card${isClone ? " is-clone" : ""}"
        data-real-index="${realIndex}"
        data-visual-index="${visualIndex}"
        data-loop-side="${cloneSide}"
        ${isClone ? 'aria-hidden="true" tabindex="-1"' : ""}
      `;
      const cardInner = `
        <div class="creation-phone tone-${(realIndex % 4) + 1}">
          ${videoMarkup}
          <div class="creation-screen-glow" aria-hidden="true"></div>
          <span class="creation-runtime">${escapeHtml(item.runtime)}</span>
          ${item.url ? '<span class="creation-link-badge">Open Reel</span>' : ""}
          <span class="play-mark" aria-hidden="true"></span>
          <div class="creation-overlay">
            <p>${escapeHtml(item.platform)} / ${escapeHtml(item.format)}</p>
            <h3>${escapeHtml(item.title)}</h3>
          </div>
        </div>
        <div class="creation-copy">
          <p>${escapeHtml(item.description)}</p>
        </div>
      `;

      if (item.url) {
        return `
          <a ${cardAttributes} href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
            ${cardInner}
          </a>
        `;
      }

      return `
        <article ${cardAttributes}>
          ${cardInner}
        </article>
      `;
    };

    creations.dataset.cloneBuffer = String(cloneBuffer);
    creations.dataset.creationCount = String(creationItems.length);
    creations.innerHTML = circularItems.map(renderCreationCard).join("");
  }

  const creationDeck = document.querySelector("[data-creation-deck]");
  if (creationDeck) {
    const creationGrid = creationDeck.querySelector("[data-creations]");
    const creationCards = [...creationDeck.querySelectorAll(".creation-card")];
    const realCreationCount = Number(creationGrid?.dataset.creationCount || creationCards.length);
    const cloneBuffer = Number(creationGrid?.dataset.cloneBuffer || 0);
    const originalStartIndex = cloneBuffer;
    const originalEndIndex = Math.max(originalStartIndex, originalStartIndex + realCreationCount - 1);
    let activeCreationIndex = originalStartIndex;
    let deckIsVisible = true;
    let loopTimer = 0;
    let resetTimer = 0;
    let isResettingLoop = false;
    let isSettingInitialDeckPosition = true;

    const clearLoopState = () => {
      window.clearTimeout(loopTimer);
      creationDeck.classList.remove("is-looping", "is-looping-forward", "is-looping-backward");
    };

    const getCardCenterLeft = (card) =>
      card.offsetLeft - (creationDeck.clientWidth - card.offsetWidth) / 2;

    const getOriginalIndexForCard = (card) => {
      const realIndex = Number(card?.dataset.realIndex || 0);
      return originalStartIndex + realIndex;
    };

    const centerCreationCard = (card, behavior = "smooth") => {
      if (!card) {
        return;
      }

      const left = getCardCenterLeft(card);

      if (behavior === "auto") {
        creationDeck.scrollLeft = left;
        return;
      }

      creationDeck.scrollTo({
        left,
        behavior,
      });
    };

    const jumpToOriginalTwin = () => {
      if (isResettingLoop || realCreationCount === creationCards.length) {
        return;
      }

      const activeCard = creationCards[activeCreationIndex];
      const targetIndex = getOriginalIndexForCard(activeCard);
      const activeIsClone = activeCreationIndex < originalStartIndex || activeCreationIndex > originalEndIndex;

      if (!activeIsClone || !creationCards[targetIndex]) {
        return;
      }

      isResettingLoop = true;
      activeCreationIndex = targetIndex;
      creationDeck.classList.add("is-resetting");
      centerCreationCard(creationCards[targetIndex], "auto");

      window.requestAnimationFrame(() => {
        creationDeck.classList.remove("is-resetting");
        isResettingLoop = false;
        requestDeckUpdate();
      });
    };

    const scheduleLoopReset = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(jumpToOriginalTwin, 120);
    };

    const scrollToCreation = (targetIndex, direction) => {
      const targetVisualIndex = Math.max(0, Math.min(creationCards.length - 1, targetIndex));
      const targetCard = creationCards[targetVisualIndex];
      const isWrapping =
        (direction > 0 && activeCreationIndex === originalEndIndex && targetVisualIndex === originalEndIndex + 1) ||
        (direction < 0 && activeCreationIndex === originalStartIndex && targetVisualIndex === originalStartIndex - 1);

      if (isWrapping) {
        clearLoopState();
        creationDeck.classList.add(
          "is-looping",
          direction > 0 ? "is-looping-forward" : "is-looping-backward",
        );
        loopTimer = window.setTimeout(clearLoopState, 820);
      }

      activeCreationIndex = targetVisualIndex;
      centerCreationCard(targetCard);
    };

    const updateCreationDeck = () => {
      const deckRect = creationDeck.getBoundingClientRect();
      const deckCenter = deckRect.left + deckRect.width / 2;
      let activeIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      creationCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(deckCenter - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          activeIndex = index;
        }

        const progress = Math.max(-2, Math.min(2, (cardCenter - deckCenter) / Math.max(rect.width, 1)));
        const absProgress = Math.min(1, Math.abs(progress));
        const focus = Math.max(0, 1 - absProgress);

        card.style.setProperty("--card-progress", progress.toFixed(3));
        card.style.setProperty("--card-abs", absProgress.toFixed(3));
        card.style.setProperty("--card-focus", focus.toFixed(3));
        card.style.setProperty("--card-shift", `${(progress * -1.35).toFixed(3)}rem`);
        card.style.setProperty("--card-y", `${(absProgress * 1.6).toFixed(3)}rem`);
        card.style.setProperty("--card-rotate-y", `${(progress * -18).toFixed(3)}deg`);
        card.style.setProperty("--card-rotate-z", `${(progress * -2.2).toFixed(3)}deg`);
        card.style.setProperty("--card-scale", (1 - absProgress * 0.075).toFixed(3));
        card.style.setProperty("--card-opacity", (0.62 + focus * 0.38).toFixed(3));
        card.style.setProperty("--shine-opacity", (focus * 0.18).toFixed(3));
        card.style.setProperty("--shine-shift", `${(progress * -18).toFixed(3)}%`);
        card.style.setProperty("--phone-shine-opacity", (0.16 + focus * 0.28).toFixed(3));
        card.style.setProperty("--phone-shine-shift", `${(progress * -14).toFixed(3)}%`);
        card.style.zIndex = String(Math.round(focus * 100));
      });

      creationCards.forEach((card, index) => {
        const isActive = index === activeIndex;
        const video = card.querySelector("video");
        card.classList.toggle("is-active", isActive);

        if (!video) {
          return;
        }

        if (isActive && deckIsVisible) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });

      activeCreationIndex = activeIndex;

      const activeIsClone = activeIndex < originalStartIndex || activeIndex > originalEndIndex;
      if (activeIsClone) {
        scheduleLoopReset();
      }
    };

    let deckRaf = 0;
    const requestDeckUpdate = () => {
      window.cancelAnimationFrame(deckRaf);
      deckRaf = window.requestAnimationFrame(updateCreationDeck);
    };

    creationDeck.addEventListener("scroll", requestDeckUpdate, { passive: true });
    window.addEventListener("resize", requestDeckUpdate);

    document.querySelectorAll("[data-creation-control]").forEach((button) => {
      button.addEventListener("click", () => {
        isSettingInitialDeckPosition = false;
        const direction = button.dataset.creationControl === "next" ? 1 : -1;
        scrollToCreation(activeCreationIndex + direction, direction);
      });
    });

    const deckObserver = new IntersectionObserver(
      ([entry]) => {
        deckIsVisible = entry.isIntersecting;
        requestDeckUpdate();
      },
      { threshold: 0.22 },
    );

    deckObserver.observe(creationDeck);
    creationDeck.addEventListener("pointerdown", () => {
      isSettingInitialDeckPosition = false;
    });

    const centerInitialCreation = () => {
      if (!isSettingInitialDeckPosition) {
        return;
      }

      activeCreationIndex = originalStartIndex;
      centerCreationCard(creationCards[originalStartIndex], "auto");
      requestDeckUpdate();
    };

    window.requestAnimationFrame(() => {
      centerInitialCreation();
      window.setTimeout(() => {
        centerInitialCreation();
        isSettingInitialDeckPosition = false;
      }, 220);
    });
  }

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
