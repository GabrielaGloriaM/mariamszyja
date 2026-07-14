const variants = {
  support100: { label: "Základní podpora", price: 100 },
  support500: { label: "Silnější podpora", price: 500 },
  support1000: { label: "Hlavní podpora", price: 1000 },
  custom: { label: "Jiná částka", price: 0 },
};

const EXTERNAL_SUPPORT_URL = "";
const TAG_MANAGER_ID = "GTM-M6MSNH75";

let activeVariant = "support100";
let quantity = 1;

const formatPrice = (value) =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);

const activePrice = document.querySelector("[data-active-price]");
const orderTotal = document.querySelector("[data-order-total]");
const transferAmount = document.querySelector("[data-transfer-amount]");
const qtyOutput = document.querySelector("[data-qty]");
const customAmountWrap = document.querySelector("[data-custom-amount-wrap]");
const customAmountInput = document.querySelector("[data-custom-amount]");
const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookieSettingsPanel = document.querySelector("[data-cookie-settings-panel]");
const cookieCategoryInputs = document.querySelectorAll("[data-cookie-category]");

function getSelectedSupport() {
  if (activeVariant === "custom") {
    const customPrice = Math.max(0, Math.round(Number(customAmountInput?.value || 0)));
    return {
      id: "custom",
      label: "Jiná částka",
      price: customPrice,
    };
  }

  return { id: activeVariant, ...variants[activeVariant] };
}

function updateSupportSummary() {
  const current = getSelectedSupport();
  const total = current.price * quantity;
  const label = current.price > 0 ? formatPrice(total) : "Zadejte částku";

  activePrice.textContent = label;
  orderTotal.textContent = label;
  if (transferAmount) transferAmount.textContent = label;
  if (qtyOutput) qtyOutput.textContent = String(quantity);

  customAmountWrap?.classList.toggle("is-hidden", activeVariant !== "custom");
}

document.querySelectorAll("input[name='variant']").forEach((input) => {
  input.addEventListener("change", () => {
    activeVariant = input.value;
    updateSupportSummary();

    if (activeVariant === "custom") {
      customAmountInput?.focus();
    }
  });
});

customAmountInput?.addEventListener("input", updateSupportSummary);

document.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  updateSupportSummary();
});

document.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
  quantity = Math.min(20, quantity + 1);
  updateSupportSummary();
});

document.querySelectorAll("[data-add-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = getSelectedSupport();

    if (selected.price <= 0) {
      customAmountInput?.focus();
      return;
    }

    if (!EXTERNAL_SUPPORT_URL) {
      alert("Platební stránka se připravuje. Finální odkaz doplníme před spuštěním kampaně.");
      return;
    }

    const url = new URL(EXTERNAL_SUPPORT_URL);
    url.searchParams.set("amount", String(selected.price * quantity));
    url.searchParams.set("source", "mariamszyja.cz");
    window.location.href = url.toString();
  });
});

function loadTagManager() {
  if (!TAG_MANAGER_ID || window.googleTagManagerLoaded) return;

  window.googleTagManagerLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(TAG_MANAGER_ID)}`;
  document.head.appendChild(script);
}

function normalizeCookieConsent(value) {
  if (value === "analytics") {
    return { necessary: true, analytics: true, marketing: false };
  }

  if (value === "essential") {
    return { necessary: true, analytics: false, marketing: false };
  }

  if (typeof value === "string") {
    try {
      return normalizeCookieConsent(JSON.parse(value));
    } catch {
      return { necessary: true, analytics: false, marketing: false };
    }
  }

  return {
    necessary: true,
    analytics: Boolean(value?.analytics),
    marketing: Boolean(value?.marketing),
  };
}

function applyCookieConsent(consent) {
  if (cookieBanner) cookieBanner.style.display = "none";

  if (consent.analytics || consent.marketing) {
    loadTagManager();
  }
}

function setCookieConsent(value) {
  const consent = normalizeCookieConsent(value);
  localStorage.setItem("mariamCookieConsent", JSON.stringify(consent));
  applyCookieConsent(consent);
}

document.querySelectorAll("[data-cookie-essential]").forEach((button) => {
  button.addEventListener("click", () => {
    setCookieConsent({ analytics: false, marketing: false });
  });
});

document.querySelector("[data-cookie-all]")?.addEventListener("click", () => {
  setCookieConsent({ analytics: true, marketing: true });
});

document.querySelector("[data-cookie-settings]")?.addEventListener("click", () => {
  cookieSettingsPanel?.classList.toggle("is-hidden");
});

document.querySelector("[data-cookie-save]")?.addEventListener("click", () => {
  const selected = { analytics: false, marketing: false };

  cookieCategoryInputs.forEach((input) => {
    selected[input.dataset.cookieCategory] = input.checked;
  });

  setCookieConsent(selected);
});

document.querySelector("[data-cookie-reset]")?.addEventListener("click", () => {
  localStorage.removeItem("mariamCookieConsent");
  if (cookieBanner) cookieBanner.style.display = "grid";
  cookieSettingsPanel?.classList.remove("is-hidden");
  cookieCategoryInputs.forEach((input) => {
    input.checked = false;
  });
});

const savedCookieConsent = localStorage.getItem("mariamCookieConsent");

if (savedCookieConsent) {
  const consent = normalizeCookieConsent(savedCookieConsent);
  cookieCategoryInputs.forEach((input) => {
    input.checked = Boolean(consent[input.dataset.cookieCategory]);
  });
  applyCookieConsent(consent);
}

updateSupportSummary();
