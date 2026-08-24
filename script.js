(function () {
  const fallbackContent = window.creatorSiteContent;
  const localizedContent = window.creatorSiteLocalizedContent || { en: fallbackContent };
  const languageOptions = window.creatorSiteLanguages || [fallbackContent?.language].filter(Boolean);

  if (!fallbackContent) {
    return;
  }

  const supportedLanguageCodes = Object.keys(localizedContent);
  const defaultLanguage = "en";
  const languageStorageKey = "techHamzaterLanguage";
  const params = new URLSearchParams(window.location.search);
  const requestedLanguage = params.get("lang");
  let storedLanguage = "";

  try {
    storedLanguage = window.localStorage.getItem(languageStorageKey) || "";
  } catch (error) {
    storedLanguage = "";
  }

  const browserLanguage = (navigator.language || "").slice(0, 2).toLowerCase();
  const initialLanguage = [requestedLanguage, storedLanguage, browserLanguage, defaultLanguage]
    .map((code) => (code || "").toLowerCase())
    .find((code) => supportedLanguageCodes.includes(code));
  const currentLanguage = initialLanguage || defaultLanguage;
  const content = localizedContent[currentLanguage] || fallbackContent;

  document.documentElement.lang = content.language?.htmlLang || currentLanguage;
  document.documentElement.dir = content.language?.dir || "ltr";

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

  const getContentValue = (path) =>
    path.split(".").reduce((source, key) => (source && source[key] != null ? source[key] : undefined), content.ui);

  const applyInterfaceText = () => {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = getContentValue(node.dataset.i18n);
      if (value != null) {
        node.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      const value = getContentValue(node.dataset.i18nAria);
      if (value != null) {
        node.setAttribute("aria-label", value);
      }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
      const value = getContentValue(node.dataset.i18nAlt);
      if (value != null) {
        node.setAttribute("alt", value);
      }
    });
  };

  const setMeta = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) {
      node.setAttribute("content", value);
    }
  };

  const renderLanguageSwitcher = () => {
    document.querySelectorAll("[data-language-switcher]").forEach((switcher) => {
      const activeLanguage =
        languageOptions.find((language) => language.code === currentLanguage) || languageOptions[0];
      const activeLabel = `${activeLanguage.nativeLabel} / ${activeLanguage.label}`;
      const menuId = `language-menu-${Math.random().toString(36).slice(2, 8)}`;

      switcher.innerHTML = `
        <button
          type="button"
          class="language-trigger"
          data-language-trigger
          aria-label="${escapeHtml(activeLabel)}"
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="${menuId}"
          title="${escapeHtml(activeLabel)}"
        >
          <span aria-hidden="true">${escapeHtml(activeLanguage.flag)}</span>
        </button>
        <div class="language-menu" id="${menuId}" data-language-menu role="menu" hidden>
          ${languageOptions
            .map((language) => {
              const isActive = language.code === currentLanguage;
              const label = `${language.nativeLabel} / ${language.label}`;

              return `
                <button
                  type="button"
                  class="language-option ${isActive ? "is-active" : ""}"
                  data-language-option="${escapeHtml(language.code)}"
                  role="menuitem"
                  aria-label="${escapeHtml(label)}"
                  ${isActive ? 'aria-current="true"' : ""}
                >
                  <span class="language-option-flag" aria-hidden="true">${escapeHtml(language.flag)}</span>
                  <span class="language-option-name">${escapeHtml(language.nativeLabel)}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      `;
    });

    const closeLanguageMenus = () => {
      document.querySelectorAll("[data-language-switcher]").forEach((switcher) => {
        const trigger = switcher.querySelector("[data-language-trigger]");
        const menu = switcher.querySelector("[data-language-menu]");

        switcher.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
        if (menu) {
          menu.hidden = true;
        }
      });
    };

    document.querySelectorAll("[data-language-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();

        const switcher = trigger.closest("[data-language-switcher]");
        const menu = switcher?.querySelector("[data-language-menu]");
        const willOpen = !switcher?.classList.contains("is-open");

        closeLanguageMenus();

        if (switcher && menu && willOpen) {
          switcher.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          menu.hidden = false;
        }
      });
    });

    document.querySelectorAll("[data-language-option]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLanguage = button.dataset.languageOption;
        if (!nextLanguage || nextLanguage === currentLanguage) {
          closeLanguageMenus();
          return;
        }

        try {
          window.localStorage.setItem(languageStorageKey, nextLanguage);
        } catch (error) {
          // Language selection still works through the URL when storage is unavailable.
        }

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("lang", nextLanguage);
        window.location.href = nextUrl.toString();
      });
    });

    document.addEventListener("click", closeLanguageMenus);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLanguageMenus();
      }
    });
  };

  const emailHref = `mailto:${content.profile.email}`;

  document.title = `${content.profile.name} | ${content.profile.creatorName}`;
  setMeta('meta[name="description"]', content.meta?.description);
  setMeta('meta[property="og:title"]', document.title);
  setMeta('meta[property="og:description"]', content.meta?.socialDescription || content.meta?.description);
  setMeta('meta[name="twitter:title"]', document.title);
  setMeta('meta[name="twitter:description"]', content.meta?.socialDescription || content.meta?.description);
  applyInterfaceText();
  renderLanguageSwitcher();
  setText("[data-profile-name]", content.profile.name);
  setText("[data-profile-headline]", content.profile.headline);
  setText("[data-profile-kicker]", content.profile.kicker);
  setText("[data-profile-role]", content.profile.role);
  setText("[data-profile-bio]", content.profile.bio);
  setText("[data-profile-about]", content.profile.about);
  setText("[data-profile-handle]", content.profile.handle);
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
      <img src="${item.logo}" alt="${escapeHtml(item.name)} logo" loading="lazy" decoding="async">
      <span>${escapeHtml(item.name)}</span>
      <small>${escapeHtml(item.category)}</small>
    </article>
  `;
  collaborations.innerHTML = content.collaborations.map(logoTile).join("");

  const marquee = document.querySelector("[data-logo-marquee]");
  const marqueeSetMarkup = content.collaborations
    .map(
      (item) => `
        <div class="marquee-logo" aria-hidden="true">
          <img src="${item.logo}" alt="" loading="lazy" decoding="async" fetchpriority="low">
        </div>
      `,
    )
    .join("");
  marquee.innerHTML = `
    <div class="logo-marquee-set">${marqueeSetMarkup}</div>
    <div class="logo-marquee-set" aria-hidden="true">${marqueeSetMarkup}</div>
  `;

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
    const creationLeadCount = Math.min(3, Math.max(0, content.creations.length - 1));
    const visualCreations = [
      ...content.creations.slice(-creationLeadCount).map((item, offset) => ({
        item,
        realIndex: content.creations.length - creationLeadCount + offset,
      })),
      ...content.creations.slice(0, content.creations.length - creationLeadCount).map((item, realIndex) => ({
        item,
        realIndex,
      })),
    ];
    const initialCreationIndex = Math.max(
      0,
      visualCreations.findIndex(({ realIndex }) => realIndex === 0),
    );

    const renderCreationCard = ({ item, realIndex }, visualIndex) => {
      const posterPath =
        item.poster ||
        (item.video ? item.video.replace("/creations/", "/creations/posters/").replace(/\.mp4$/, ".png") : "");
      const videoMarkup = item.video
        ? `
          ${
            posterPath
              ? `<img class="creation-poster" data-src="${escapeHtml(posterPath)}" alt="" loading="lazy" decoding="async" draggable="false">`
              : ""
          }
          <video
            data-src="${escapeHtml(item.video)}"
            muted
            loop
            playsinline
            preload="none"
            draggable="false"
            controlslist="nodownload noplaybackrate noremoteplayback"
            disablepictureinpicture
            disableremoteplayback
          ></video>
        `
        : posterPath
          ? `<img class="creation-poster" src="${escapeHtml(posterPath)}" alt="" loading="lazy" draggable="false">`
        : "";
      const cardAttributes = `
        class="creation-card"
        data-real-index="${realIndex}"
        data-visual-index="${visualIndex}"
      `;
      const cardInner = `
        <div class="creation-phone tone-${(realIndex % 4) + 1}">
          ${videoMarkup}
          <div class="creation-screen-glow" aria-hidden="true"></div>
          <span class="creation-runtime">${escapeHtml(item.runtime)}</span>
          ${item.url ? `<span class="creation-link-badge">${escapeHtml(content.ui.actions.openReel)}</span>` : ""}
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

    creations.dataset.creationCount = String(content.creations.length);
    creations.dataset.initialIndex = String(initialCreationIndex);
    creations.innerHTML = visualCreations.map(renderCreationCard).join("");

    creations.querySelectorAll("video").forEach((video) => {
      video.controls = false;
      video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
      video.disablePictureInPicture = true;
      video.disableRemotePlayback = true;
      video.addEventListener(
        "loadeddata",
        () => {
          video.closest(".creation-card")?.classList.add("is-video-ready");
        },
        { once: true },
      );
    });
  }

  const creationDeck = document.querySelector("[data-creation-deck]");
  if (creationDeck) {
    const creationGrid = creationDeck.querySelector("[data-creations]");
    const creationCards = [...creationDeck.querySelectorAll(".creation-card")];
    const creationControls = [...document.querySelectorAll("[data-creation-control]")];
    const initialCreationIndex = Number(creationGrid?.dataset.initialIndex || 0);
    let activeCreationIndex = initialCreationIndex;
    let deckIsVisible = false;
    let isSettingInitialDeckPosition = true;

    const hydrateCreationPoster = (card) => {
      const poster = card?.querySelector(".creation-poster");

      if (!poster || poster.currentSrc || poster.getAttribute("src") || !poster.dataset.src) {
        return;
      }

      poster.src = poster.dataset.src;
    };

    const hydrateCreationVideo = (video) => {
      if (!video || video.currentSrc || !video.dataset.src) {
        return;
      }

      hydrateCreationPoster(video.closest(".creation-card"));
      video.src = video.dataset.src;
      video.load();
    };

    const getCardCenterLeft = (card) =>
      card.offsetLeft - (creationDeck.clientWidth - card.offsetWidth) / 2;

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

    const scrollToCreation = (targetIndex) => {
      const targetVisualIndex = Math.max(0, Math.min(creationCards.length - 1, targetIndex));
      const targetCard = creationCards[targetVisualIndex];

      activeCreationIndex = targetVisualIndex;
      centerCreationCard(targetCard);
    };

    const updateCreationControls = () => {
      creationControls.forEach((button) => {
        const isPrevious = button.dataset.creationControl === "prev";
        button.disabled = isPrevious
          ? activeCreationIndex <= 0
          : activeCreationIndex >= creationCards.length - 1;
      });
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
        const isNearActive = Math.abs(index - activeIndex) <= 1;
        const video = card.querySelector("video");
        card.classList.toggle("is-active", isActive);

        if (deckIsVisible) {
          hydrateCreationPoster(card);
        }

        if (!video) {
          return;
        }

        if (deckIsVisible && isNearActive) {
          hydrateCreationVideo(video);
        }

        if (isActive && deckIsVisible) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });

      activeCreationIndex = activeIndex;
      updateCreationControls();
    };

    let deckRaf = 0;
    const requestDeckUpdate = () => {
      window.cancelAnimationFrame(deckRaf);
      deckRaf = window.requestAnimationFrame(updateCreationDeck);
    };

    creationDeck.addEventListener("scroll", requestDeckUpdate, { passive: true });
    window.addEventListener("resize", requestDeckUpdate);

    creationControls.forEach((button) => {
      button.addEventListener("click", () => {
        isSettingInitialDeckPosition = false;
        const direction = button.dataset.creationControl === "next" ? 1 : -1;
        scrollToCreation(activeCreationIndex + direction);
      });
    });

    const deckObserver = new IntersectionObserver(
      ([entry]) => {
        deckIsVisible = entry.isIntersecting;
        requestDeckUpdate();
      },
      { rootMargin: "900px 0px", threshold: 0.01 },
    );

    deckObserver.observe(creationDeck);
    creationDeck.addEventListener("pointerdown", () => {
      isSettingInitialDeckPosition = false;
    });
    creationDeck.addEventListener("contextmenu", (event) => {
      if (event.target.closest(".creation-card, .creation-phone, video")) {
        event.preventDefault();
      }
    });
    creationDeck.addEventListener("dragstart", (event) => {
      if (event.target.closest(".creation-card, .creation-phone, video, img")) {
        event.preventDefault();
      }
    });

    const centerInitialCreation = () => {
      if (!isSettingInitialDeckPosition) {
        return;
      }

      activeCreationIndex = initialCreationIndex;
      centerCreationCard(creationCards[initialCreationIndex], "auto");
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
