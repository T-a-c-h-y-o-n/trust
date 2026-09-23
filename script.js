const CHECKOUT_URL = "https://tachyon80.gumroad.com/l/gcgqhg";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js-motion");

const checkoutLinks = document.querySelectorAll("[data-checkout]");
const checkoutNotice = document.getElementById("checkout-notice");

checkoutLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!CHECKOUT_URL) {
      event.preventDefault();
      if (checkoutNotice) {
        checkoutNotice.hidden = false;
        checkoutNotice.focus();
      }
      return;
    }

    window.location.assign(CHECKOUT_URL);
  });
});

const sampleForm = document.getElementById("sample-form");
const sampleInput = document.getElementById("sample-domain");
const sampleOutput = document.getElementById("sample-domain-output");
const sampleError = document.getElementById("sample-error");
const sampleSuccess = document.getElementById("sample-success");
const sampleSubmit = sampleForm?.querySelector('button[type="submit"]');
const evidenceCode = document.querySelector(".evidence-row code");
const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mljdbqbq";

function normaliseDomain(value) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[/?#].*$/, "")
    .toLowerCase();
}

async function submitSampleToFormspree(domain) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain, source: "trust-sample-form" }),
  });
  if (!res.ok) {
    throw new Error(`Formspree ${res.status}`);
  }
}

function syncSampleSubmitState() {
  if (!sampleSubmit || !sampleInput) return;
  const domain = normaliseDomain(sampleInput.value);
  sampleSubmit.disabled = !domainPattern.test(domain);
}

if (sampleForm && sampleInput) {
  const samplePlaceholderDomain = "yourbusiness.co.uk";

  sampleInput.addEventListener("focus", () => {
    if (normaliseDomain(sampleInput.value) === samplePlaceholderDomain) {
      sampleInput.value = "";
      syncSampleSubmitState();
    }
  });

  sampleInput.addEventListener("input", syncSampleSubmitState);
  syncSampleSubmitState();

  sampleForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const domain = normaliseDomain(sampleInput.value);

    if (sampleSuccess) {
      sampleSuccess.hidden = true;
    }

    if (!domainPattern.test(domain)) {
      if (sampleError) {
        sampleError.hidden = false;
      }
      sampleInput.setAttribute("aria-invalid", "true");
      syncSampleSubmitState();
      sampleInput.focus();
      return;
    }

    if (sampleError) {
      sampleError.hidden = true;
      sampleError.textContent = "Enter a domain such as yourbusiness.co.uk.";
    }
    sampleInput.removeAttribute("aria-invalid");

    if (sampleOutput) {
      sampleOutput.textContent = domain;
    }
    if (evidenceCode) {
      evidenceCode.textContent = `_dmarc.${domain} -> not found`;
      evidenceCode.classList.remove("is-flash");
      void evidenceCode.offsetWidth;
      evidenceCode.classList.add("is-flash");
      window.setTimeout(() => evidenceCode.classList.remove("is-flash"), 900);
    }

    if (sampleSubmit) {
      sampleSubmit.disabled = true;
    }
    try {
      await submitSampleToFormspree(domain);
      if (sampleSuccess) {
        sampleSuccess.hidden = false;
      }
      if (sampleError) {
        sampleError.hidden = true;
      }
    } catch {
      if (sampleError) {
        sampleError.hidden = false;
        sampleError.textContent = "Could not send right now. Please email info@ai2eo.com.";
      }
      if (sampleSuccess) {
        sampleSuccess.hidden = true;
      }
    } finally {
      syncSampleSubmitState();
    }
  });
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function formatStatValue(el, value) {
  const format = el.dataset.countFormat || "int";
  const prefix = el.dataset.countPrefix || "";
  const suffix = el.dataset.countSuffix || "";
  const from = Number(el.dataset.countFrom ?? 0);

  if (format === "range") {
    const to = Number(el.dataset.countTo ?? value);
    return `${value}-${to}`;
  }

  if (format === "text") {
    return el.dataset.countFinal || el.textContent.trim();
  }

  return `${prefix}${Math.round(value)}${suffix}`;
}

function animateStat(el) {
  if (el.dataset.counted === "1") return;

  const format = el.dataset.countFormat || "int";
  if (format === "text") {
    el.dataset.counted = "1";
    el.classList.add("is-counting");
    return;
  }

  const from = Number(el.dataset.countFrom ?? 0);
  const to = Number(el.dataset.countTo ?? from);
  const range = el.dataset.countFormat === "range";
  const duration = 900;
  const start = performance.now();

  el.dataset.counted = "1";
  el.classList.add("is-counting");

  if (prefersReducedMotion) {
    el.textContent = range ? `${from}-${to}` : formatStatValue(el, to);
    return;
  }

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(t);
    const current = from + (to - from) * eased;

    if (range) {
      const mid = Math.round(current);
      el.textContent = `${from}-${Math.max(from, Math.min(to, mid))}`;
      if (t >= 1) el.textContent = `${from}-${to}`;
    } else {
      el.textContent = formatStatValue(el, current);
    }

    if (t < 1) {
      requestAnimationFrame(frame);
    } else if (range) {
      el.textContent = `${from}-${to}`;
    } else {
      el.textContent = formatStatValue(el, to);
    }
  }

  requestAnimationFrame(frame);
}

function setStagger(nodes, step = 70, base = 0) {
  nodes.forEach((node, index) => {
    if (node.style.getPropertyValue("--stagger")) return;
    node.style.setProperty("--stagger", `${base + index * step}ms`);
  });
}

const header = document.querySelector(".site-header");
function updateHeaderScroll() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}
updateHeaderScroll();
window.addEventListener("scroll", updateHeaderScroll, { passive: true });

const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
const staggerGroups = [
  document.querySelectorAll(".proof-item"),
  document.querySelectorAll(".check-row"),
  document.querySelectorAll(".process-step"),
  document.querySelectorAll(".report-contents li"),
  document.querySelectorAll(".faq-list details"),
];

staggerGroups.forEach((group, groupIndex) => {
  setStagger(Array.from(group), 70 + groupIndex * 10, 40);
});

const statNodes = Array.from(document.querySelectorAll(".stat, .price[data-count-to]"));

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
  document.querySelectorAll(".proof-item, .check-row, .process-step, .report-contents li, .faq-list details")
    .forEach((node) => node.classList.add("is-visible"));
  statNodes.forEach((el) => {
    const to = Number(el.dataset.countTo);
    if (Number.isFinite(to) && el.dataset.countFormat !== "text") {
      el.textContent = formatStatValue(el, to);
      if (el.dataset.countFormat === "range") {
        el.textContent = `${el.dataset.countFrom}-${to}`;
      }
    }
    el.dataset.counted = "1";
  });
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.matches(".stat, .price")) {
          animateStat(entry.target);
        }
        if (entry.target.matches(".proof-strip, .price-card")) {
          entry.target.querySelectorAll(".stat").forEach(animateStat);
        }
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.18 }
  );

  revealNodes.forEach((node) => observer.observe(node));
  document
    .querySelectorAll(".proof-item, .check-row, .process-step, .report-contents li, .faq-list details")
    .forEach((node) => observer.observe(node));
  statNodes.forEach((node) => observer.observe(node));

  // Safety: if something never intersects (short viewport / edge), force visible after load.
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          node.classList.add("is-visible");
        }
      });
      document.querySelectorAll(".stat:not([data-counted='1'])").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          animateStat(el);
        }
      });
    }, 400);
  });
}
