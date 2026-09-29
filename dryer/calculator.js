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
const usesPerYearElement = document.getElementById("usesPerYear");
const totalUsesLabel = document.getElementById("totalUsesLabel");
const electricityTotalElement = document.getElementById("electricityTotal");
const electricityLabel = document.getElementById("electricityLabel");
const electricityFormula = document.getElementById("electricityFormula");
const costPerUseElement = document.getElementById("costPerUse");
const usesPerYearFormula = document.getElementById("usesPerYearFormula");
const costPerUseFormula = document.getElementById("costPerUseFormula");
const finalResult = document.getElementById("finalResult");
const finalFormula = document.getElementById("finalFormula");
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

  const usesPerYear = v.usesPerWeek * 52;
  const totalUses = usesPerYear * v.years;
  const electricityTotal = capacity.won * totalUses;
  const totalCost = v.price + electricityTotal;
  const costPerUse = totalCost / totalUses;

  if (!isValidCalculationNumber(usesPerYear, totalUses, electricityTotal, totalCost, costPerUse)) return;

  resultSummary.textContent = `${capacity.label} · 주 ${v.usesPerWeek}회 · ${v.years}년`;
  totalUsesLabel.textContent = `${v.years}년 예상 사용횟수`;
  usesPerYearElement.textContent = `약 ${formatNumber(totalUses)}회`;
  electricityLabel.textContent = `${v.years}년 예상 전기료`;
  electricityTotalElement.textContent = formatWon(electricityTotal);
  electricityFormula.textContent = `1회 예상 전기료 ${formatWon(capacity.won)} × ${formatNumber(totalUses)}회 · ${capacity.label}급 1등급 건조기 대표값`;
  costPerUseElement.textContent = formatWon(costPerUse);

  usesPerYearFormula.textContent = `주 ${v.usesPerWeek}회 × 52주 × ${v.years}년`;
  costPerUseFormula.textContent = `제품가격 + 예상 전기료 ${formatWon(electricityTotal)} ÷ ${formatNumber(totalUses)}회`;

  finalResult.innerHTML = `약 2시간대에 건조하고,<br/>${v.years}년간 약 ${formatNumber(totalUses)}번 사용`;
  finalFormula.innerHTML = `1회당 예상비용 약 ${formatWon(costPerUse)}<br/>건조시간은 공개 시험 참고값 · 사용횟수와 비용은 입력값 기준`;

  resultMessage.replaceChildren(
    createText("KCA 공개 시험에서는 9~10kg급, 표시용량 50% 면 시험부하 기준 약 "),
    createStrongText("2시간대"),
    createText("에 건조가 끝났습니다. 선택한 용량의 예상시간이 아닌 공개 시험 참고값입니다."),
    createBreak(), createBreak(),
    createText(`주 ${v.usesPerWeek}회, ${v.years}년 사용 기준 예상 전기료는 `),
    createStrongText(formatWon(electricityTotal)),
    createText(`이며 제품가격까지 포함한 1회당 예상비용은 ${formatWon(costPerUse)}입니다.`)
  );

  resultEmpty.style.display = "none";
  resultContent.style.display = "block";
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";
  hasCalculated = true;

  if (window.JamkkanAnalytics) window.JamkkanAnalytics.trackCalculation("건조기");
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
  setTimeout(() => { priceInput.focus({ preventScroll: true }); priceInput.select(); }, 250);
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
