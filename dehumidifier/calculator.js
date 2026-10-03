"use strict";

/* 제습기 계산기
   한국소비자원 2024 제습기 9개 제품 시험:
   월 171시간 사용 시 월간 전기요금 평균 약 8,000원.
   이를 시간당 비용으로 환산하여 사용시간/개월에 맞춰 계산한다. */

const MONTHLY_REFERENCE_COST = 8000;
const MONTHLY_REFERENCE_HOURS = 171;
const HOURLY_COST = MONTHLY_REFERENCE_COST / MONTHLY_REFERENCE_HOURS;

const priceInput = document.getElementById("price");
const hoursInput = document.getElementById("hoursPerDay");
const seasonInput = document.getElementById("season");
const yearsInput = document.getElementById("years");
const calculateButton = document.getElementById("calculateButton");
const editButton = document.getElementById("editButton");
const resetButton = document.getElementById("resetButton");
const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const resultStale = document.getElementById("resultStale");
const resultSummary = document.getElementById("resultSummary");
const dailyCostEl = document.getElementById("dailyCost");
const monthlyCostEl = document.getElementById("monthlyCost");
const seasonCostEl = document.getElementById("seasonCost");
const totalCostEl = document.getElementById("totalCost");
const totalCostLabel = document.getElementById("totalCostLabel");
const monthlyTotalEl = document.getElementById("monthlyTotal");
const dailyFormula = document.getElementById("dailyFormula");
const monthlyFormula = document.getElementById("monthlyFormula");
const seasonFormula = document.getElementById("seasonFormula");
const totalCostFormula = document.getElementById("totalCostFormula");
const monthlyTotalFormula = document.getElementById("monthlyTotalFormula");
const resultMessage = document.getElementById("resultMessage");

const inputRules = [
  { element: priceInput, key: "price", name: "제품가격", type: "money", integer: true, zeroAllowed: false, min: 10000, max: 99999999, maxLength: 8 },
  { element: hoursInput, key: "hours", name: "하루 사용시간", type: "number", integer: true, zeroAllowed: false, min: 1, max: 24, maxLength: 2, maxMessage: "하루 사용시간은 24시간 이하로 입력해주세요." }
];

const defaults = { price: "300000", hours: "6", season: "3", years: "5" };
let hasCalculated = false;

function calculate() {
  const v = validateInputs(inputRules);
  if (!v) return;

  const hours = v.hours;
  const months = Number(seasonInput.value);
  const years = Number(yearsInput.value);
  if (![1,3,6,9,12].includes(months) || ![1,3,5,7,10].includes(years)) return;

  const dailyCost = HOURLY_COST * hours;
  const monthlyCost = dailyCost * 30;
  const seasonCost = monthlyCost * months;
  const electricityTotal = seasonCost * years;
  const totalCost = v.price + electricityTotal;
  const monthlyTotal = totalCost / (years * 12);

  if (!isValidCalculationNumber(dailyCost, monthlyCost, seasonCost, electricityTotal, totalCost, monthlyTotal)) return;

  resultSummary.textContent = `하루 ${hours}시간 · 연 ${months}개월 · ${years}년 사용`;
  dailyCostEl.textContent = formatWon(dailyCost);
  monthlyCostEl.textContent = formatWon(monthlyCost);
  seasonCostEl.textContent = formatWon(seasonCost);
  totalCostEl.textContent = formatWon(totalCost);
  totalCostLabel.textContent = `${years}년 예상 총비용`;
  monthlyTotalEl.textContent = formatWon(monthlyTotal) + " / 월";

  dailyFormula.textContent = `하루 ${hours}시간 사용 기준`;
  monthlyFormula.textContent = `30일 사용 기준`;
  seasonFormula.textContent = `연 ${months}개월 사용 기준`;
  totalCostFormula.textContent = `제품 ${formatWon(v.price)} + ${years}년 예상 전기료 ${formatWon(electricityTotal)}`;
  monthlyTotalFormula.textContent = `${formatWon(totalCost)} ÷ ${years * 12}개월 ≈ ${formatWon(monthlyTotal)}`;

  resultMessage.replaceChildren(
    createText(`하루 ${hours}시간, 1년에 ${months}개월 정도 쓴다면 한 달 약 `),
    createStrongText(formatWon(monthlyCost)),
    createText(`, 1년 중 사용하는 기간에는 약 `),
    createStrongText(formatWon(seasonCost)),
    createText("이 예상됩니다."),
    createBreak(), createBreak(),
    createText(`${years}년 동안 제품가격까지 합치면 약 `),
    createStrongText(formatWon(totalCost)),
    createText("입니다.")
  );

  resultEmpty.style.display = "none";
  resultContent.style.display = "block";
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";
  hasCalculated = true;
  if (window.JamkkanAnalytics) window.JamkkanAnalytics.trackCalculation("제습기");
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
  hoursInput.value = defaults.hours;
  seasonInput.value = defaults.season;
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
[seasonInput, yearsInput].forEach(el => el.addEventListener("change", markStale));
