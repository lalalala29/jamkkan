"use strict";

const MONTHLY_RUNNING_COST = 8000;

const priceInput = document.getElementById("price");
const yearsInput = document.getElementById("years");
const tripsInput = document.getElementById("trips");
const minutesPerTripInput = document.getElementById("minutesPerTrip");
const calculateButton = document.getElementById("calculateButton");
const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const resultSummary = document.getElementById("resultSummary");
const resultStale = document.getElementById("resultStale");
const totalCostLabel = document.getElementById("totalCostLabel");
const totalTripsLabel = document.getElementById("totalTripsLabel");
const savedHoursLabel = document.getElementById("savedHoursLabel");
const totalCostElement = document.getElementById("totalCost");
const totalTripsElement = document.getElementById("totalTrips");
const costPerTripElement = document.getElementById("costPerTrip");
const savedHoursElement = document.getElementById("savedHours");
const costPerHourElement = document.getElementById("costPerHour");
const totalCostFormula = document.getElementById("totalCostFormula");
const totalTripsFormula = document.getElementById("totalTripsFormula");
const costPerTripFormula = document.getElementById("costPerTripFormula");
const savedHoursFormula = document.getElementById("savedHoursFormula");
const costPerHourFormula = document.getElementById("costPerHourFormula");
const resultMessage = document.getElementById("resultMessage");
const editButton = document.getElementById("editButton");
const resetButton = document.getElementById("resetButton");

const inputRules = [
  { element: tripsInput, name: "주당 배출횟수", type: "number", min: 1, max: 21, maxLength: 2, integer: true, zeroAllowed: false },
  { element: minutesPerTripInput, name: "1회 배출시간", type: "number", min: 1, max: 60, maxLength: 2, integer: true, zeroAllowed: false },
  { element: priceInput, name: "음식물처리기 가격", type: "money", min: 1, max: 10000000, maxLength: 8, integer: true, zeroAllowed: false },
  { element: yearsInput, name: "사용기간", type: "number", min: 1, max: 20, maxLength: 2, integer: true, zeroAllowed: false }
];

const defaults = { price: "500000", years: "5", trips: "4", minutesPerTrip: "7" };
let hasCalculated = false;

function calculate() {
  const v = validateInputs(inputRules);
  if (!v) return;

  const totalTrips = v.trips * 52 * v.years;
  const runningCost = MONTHLY_RUNNING_COST * 12 * v.years;
  const totalCost = v.price + runningCost;
  const savedHours = v.trips * v.minutesPerTrip * 52 * v.years / 60;
  const costPerTrip = totalCost / totalTrips;
  const costPerHour = totalCost / savedHours;

  if (!isValidCalculationNumber(totalTrips, runningCost, totalCost, savedHours, costPerTrip, costPerHour) || savedHours <= 0) return;

  resultSummary.textContent = `주 ${v.trips}회 배출 · 1회 ${v.minutesPerTrip}분 · ${v.years}년 사용 · 유지비 월 ${formatWon(MONTHLY_RUNNING_COST)} 가정`;
  totalCostLabel.textContent = `${v.years}년 예상 총비용`;
  totalTripsLabel.textContent = `${v.years}년 동안 줄일 수 있는 배출횟수`;
  savedHoursLabel.textContent = `${v.years}년 동안 되찾는 배출시간`;
  totalCostElement.textContent = formatWon(totalCost);
  totalTripsElement.textContent = formatNumber(totalTrips) + "회";
  costPerTripElement.textContent = formatWon(costPerTrip);
  savedHoursElement.textContent = formatNumber(savedHours) + "시간";
  costPerHourElement.textContent = formatWon(costPerHour) + " / 1시간";
  totalCostFormula.textContent = `제품 ${formatWon(v.price)} + 유지비 월 ${formatWon(MONTHLY_RUNNING_COST)} × ${v.years * 12}개월 = ${formatWon(totalCost)}`;
  totalTripsFormula.textContent = `주 ${v.trips}회 × 52주 × ${v.years}년 = ${formatNumber(totalTrips)}회`;
  costPerTripFormula.textContent = `${formatWon(totalCost)} ÷ ${formatNumber(totalTrips)}회 ≈ ${formatWon(costPerTrip)}`;
  savedHoursFormula.textContent = `주 ${v.trips}회 × ${v.minutesPerTrip}분 × 52주 × ${v.years}년 ≈ ${formatNumber(savedHours)}시간`;
  costPerHourFormula.textContent = `${formatWon(totalCost)} ÷ ${formatNumber(savedHours)}시간 ≈ ${formatWon(costPerHour)}`;

  resultMessage.replaceChildren(
    createText("제품값과 예상 유지비를 합하면 "),
    createStrongText(`${v.years}년 총 ${formatWon(totalCost)}`),
    createText("입니다."),
    createBreak(), createBreak(),
    createText("현재 배출패턴을 기준으로 음식물쓰레기를 버리러 가는 약 "),
    createStrongText(`${formatNumber(savedHours)}시간`),
    createText("을 줄일 수 있고, 그 시간 1시간에 약 "),
    createStrongText(formatWon(costPerHour)),
    createText("을 쓰는 셈입니다. 통 비우기·세척 등 처리기 자체 관리시간은 제품별 차이가 커 계산에서 제외했습니다. 냄새·초파리 감소 같은 숫자로 표현하기 어려운 편리함까지 포함해 나에게 가치가 있는지 판단해보세요.")
  );

  resultEmpty.style.display = "none";
  resultContent.style.display = "block";
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";
  hasCalculated = true;
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
    tripsInput.focus({ preventScroll: true });
    tripsInput.select();
  }, 250);
}

function reset() {
  priceInput.value = defaults.price;
  yearsInput.value = defaults.years;
  tripsInput.value = defaults.trips;
  minutesPerTripInput.value = defaults.minutesPerTrip;
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
