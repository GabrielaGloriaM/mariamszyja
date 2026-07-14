const variants = {
  support100: { label: "Základní podpora", price: 100 },
  support500: { label: "Silnější podpora", price: 500 },
  support1000: { label: "Hlavní podpora", price: 1000 },
  custom: { label: "Jiná částka", price: 0 },
};

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
const transferSection = document.querySelector("#objednavka");

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

document.querySelector("[data-add-cart]")?.addEventListener("click", () => {
  const selected = getSelectedSupport();

  if (selected.price <= 0) {
    customAmountInput?.focus();
    return;
  }

  transferSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-cookie-essential], [data-cookie-all]").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.setItem("calendarCookieConsent", button.hasAttribute("data-cookie-all") ? "all" : "essential");
    document.querySelector("[data-cookie-banner]").style.display = "none";
  });
});

if (localStorage.getItem("calendarCookieConsent")) {
  document.querySelector("[data-cookie-banner]").style.display = "none";
}

updateSupportSummary();
