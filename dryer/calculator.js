"use strict";

const ELECTRICITY_PER_USE = {
  small: { label: "10kg 안팎", won: 185 },
  medium: { label: "17~19kg", won: 290 },
  large: { label: "20kg 이상", won: 335 }
};

const priceInput = document.getElementById("price");
const capacityInput = document.getElementById("capacity");
const usesPerWeekInput = document.getElementById("usesPerWeek");
const yearsInput = document.getElementById("years");
const calculateButton = document.getElementById("calculateButton");
const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const resultSummary = document.getElementById("resultSummary");
const resultStale = document.getElementById("resultStale");
const totalUsesElement = document.getElementById("totalUses");
const electricityTotalElement = document.getElementById("electricityTotal");
const productCostPerUseElement = document.getElementById("productCostPerUse");
const totalCostLabel = document.getElementById("totalCostLabel");
const totalCostElement = document.getElementById("totalCost");
const costPerUseElement = document.getElementById("costPerUse");
const totalUsesFormula = document.getElementById("totalUsesFormula");
const electricityFormula = document.getElementById("electricityFormula");
const productCostFormula = document.getElementById("productCostFormula");
const totalCostFormula = document.getElementById("totalCostFormula");
const costPerUseFormula = document.getElementById("costPerUseFormula");
const resultMessage = document.getElementById("resultMessage");
const editButton = document.getElementById("editButton");
const resetButton = document.getElementById("resetButton");

const inputRules = [
  { element: priceInput, name: "건조기 가격", type: "money", min: 1, max: 10000000, maxLength: 8, integer: true, zeroAllowed: false },
  { element: usesPerWeekInput, name: "주당 사용횟수", type: "number", min: 1, max: 14, maxLength: 2, integer: true, zeroAllowed: false },
  { element: yearsInput, name: "사용기간", type: "number", min: 1, max: 20, maxLength: 2, integer: true, zeroAllowed: false }
];

const defaults = { price: "1000000", capacity: "large", usesPerWeek: "4", years: "7" };
let hasCalculated = false;

function calculate() {
  const v = validateInputs(inputRules);
  if (!v) return;

  const capacity = ELECTRICITY_PER_USE[capacityInput.value];
  if (!capacity) return;

  const totalUses = v.usesPerWeek * 52 * v.years;
  const electricityTotal = capacity.won * totalUses;
  const totalCost = v.price + electricityTotal;
  const productCostPerUse = v.price / totalUses;
  const costPerUse = totalCost / totalUses;
  const monthlyCost = totalCost / (v.years * 12);

  if (!isValidCalculationNumber(totalUses, electricityTotal, totalCost, productCostPerUse, costPerUse, monthlyCost)) return;

  resultSummary.textContent = `${capacity.label} · 주 ${v.usesPerWeek}회 · ${v.years}년 사용 · 전기료 1회 ${formatWon(capacity.won)} 대표값`;
  totalUsesElement.textContent = formatNumber(totalUses) + "회";
  electricityTotalElement.textContent = formatWon(electricityTotal);
  productCostPerUseElement.textContent = formatWon(productCostPerUse);
  totalCostLabel.textContent = `${v.years}년 예상 총비용`;
  totalCostElement.textContent = formatWon(totalCost);
  costPerUseElement.textContent = formatWon(costPerUse) + " / 1회";

  totalUsesFormula.textContent = `주 ${v.usesPerWeek}회 × 52주 × ${v.years}년 = ${formatNumber(totalUses)}회`;
  electricityFormula.textContent = `${formatWon(capacity.won)} × ${formatNumber(totalUses)}회 = ${formatWon(electricityTotal)}`;
  productCostFormula.textContent = `${formatWon(v.price)} ÷ ${formatNumber(totalUses)}회 ≈ ${formatWon(productCostPerUse)}`;
  totalCostFormula.textContent = `제품 ${formatWon(v.price)} + 예상 전기료 ${formatWon(electricityTotal)}`;
  costPerUseFormula.textContent = `${formatWon(totalCost)} ÷ ${formatNumber(totalUses)}회 ≈ ${formatWon(costPerUse)}`;

  resultMessage.replaceChildren(
    createText(`주 ${v.usesPerWeek}회 사용한다면 ${v.years}년 동안 약 `),
    createStrongText(`${formatNumber(totalUses)}번`),
    createText(" 사용하게 됩니다."),
    createBreak(), createBreak(),
    createText("제품가격과 예상 전기료를 사용기간 전체로 나누면 한 달에 약 "),
    createStrongText(formatWon(monthlyCost)),
    createText(", 건조 한 번에는 약 "),
    createStrongText(formatWon(costPerUse)),
    createText("을 쓰는 셈입니다. 이 비용으로 빨래를 직접 널고 걷는 과정을 줄이는 것이 나에게 그만한 가치가 있는지 판단해보세요.")
  );

  resultEmpty.style.display = "none";
  resultContent.style.display = "block";
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";
  hasCalculated = true;

  if (window.JamkkanAnalytics) {
    window.JamkkanAnalytics.trackCalculation("건조기");
  }

  setTimeout(() => document.querySelector(".result-box").scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

function markStale() {
  if (!hasCalculated) return;
  resultStale.style.display = "block";
  calculateButton.textContent = "변경한 값으로 다시 계산";
}

function moveToInputs() {
  const box = document.querySelector(".calculator-box");
  box.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    priceInput.focus({ preventScroll: true });
    priceInput.select();
  }, 250);
}

function reset() {
  priceInput.value = defaults.price;
  capacityInput.value = defaults.capacity;
  usesPerWeekInput.value = defaults.usesPerWeek;
  yearsInput.value = defaults.years;
  formatMoneyInput(priceInput, 8);
  clearAllInputErrors(inputRules);
  resultContent.style.display = "none";
  resultEmpty.style.display = "block";
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";
  hasCalculated = false;
  moveToInputs();
}

calculateButton.addEventListener("click", calculate);
editButton.addEventListener("click", moveToInputs);
resetButton.addEventListener("click", reset);
bindInputEvents(inputRules, calculate);
inputRules.forEach(rule => rule.element.addEventListener("input", markStale));
capacityInput.addEventListener("change", markStale);
