"use strict";

/* =========================================================
   식기세척기 계산기 V1 FINAL
========================================================= */

const householdInput = document.getElementById("household");
const dishLevelInput = document.getElementById("dishLevel");
const priceInput = document.getElementById("price");
const yearsInput = document.getElementById("years");
const usesInput = document.getElementById("uses");
const currentMinutesInput = document.getElementById("currentMinutes");
const remainingMinutesInput = document.getElementById("remainingMinutes");
const calculateButton = document.getElementById("calculateButton");

const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const resultSummary = document.getElementById("resultSummary");
const resultStale = document.getElementById("resultStale");

const totalCostLabel = document.getElementById("totalCostLabel");
const totalUsesLabel = document.getElementById("totalUsesLabel");
const savedHoursLabel = document.getElementById("savedHoursLabel");

const totalCostElement = document.getElementById("totalCost");
const totalUsesElement = document.getElementById("totalUses");
const costPerUseElement = document.getElementById("costPerUse");
const savedHoursElement = document.getElementById("savedHours");
const costPerHourElement = document.getElementById("costPerHour");

const totalCostFormula = document.getElementById("totalCostFormula");
const totalUsesFormula = document.getElementById("totalUsesFormula");
const costPerUseFormula = document.getElementById("costPerUseFormula");
const savedHoursFormula = document.getElementById("savedHoursFormula");
const costPerHourFormula = document.getElementById("costPerHourFormula");

const resultMessage = document.getElementById("resultMessage");
const capacityTitle = document.getElementById("capacityTitle");
const capacityDescription = document.getElementById("capacityDescription");
const editButton = document.getElementById("editButton");
const resetButton = document.getElementById("resetButton");

const dishwasherInputRules = [
  {
    element: householdInput, name: "가구원 수", type: "number",
    min: 1, max: 10, maxLength: 2, integer: true, zeroAllowed: false,
    maxMessage: "가구원 수는 10명 이하로 입력해주세요."
  },
  {
    element: priceInput, name: "식기세척기 가격", type: "money",
    min: 1, max: 10000000, maxLength: 8, integer: true, zeroAllowed: false,
    maxMessage: "식기세척기 가격은 1,000만원 이하로 입력해주세요."
  },
  {
    element: yearsInput, name: "사용기간", type: "number",
    min: 1, max: 30, maxLength: 2, integer: true, zeroAllowed: false,
    maxMessage: "사용기간은 30년 이하로 입력해주세요."
  },
  {
    element: usesInput, name: "주당 사용횟수", type: "number",
    min: 1, max: 21, maxLength: 2, integer: true, zeroAllowed: false,
    maxMessage: "일주일 사용횟수는 21회 이하로 입력해주세요."
  },
  {
    element: currentMinutesInput, name: "현재 설거지 시간", type: "number",
    min: 1, max: 180, maxLength: 3, integer: true, zeroAllowed: false,
    maxMessage: "한 번의 설거지 시간은 180분 이하로 입력해주세요."
  },
  {
    element: remainingMinutesInput, name: "식기세척기 사용 후 직접 하는 시간", type: "number",
    min: 0, max: 180, maxLength: 3, integer: true, zeroAllowed: true,
    maxMessage: "직접 하는 시간은 180분 이하로 입력해주세요."
  },
];

const defaultValues = {
  household: "2",
  dishLevel: "low",
  price: "1200000",
  years: "7",
  uses: "7",
  currentMinutes: "25",
  remainingMinutes: "10"
};

const DETERGENT_COST_PER_USE = 540;

let hasCalculated = false;

function validateDishwasherRelations(values) {
  if (values.remainingMinutes >= values.currentMinutes) {
    showInputError(
      remainingMinutesInput,
      "식기세척기 사용 후 직접 하는 시간은 현재 설거지 시간보다 적게 입력해주세요."
    );
    return false;
  }

  if (!["low", "high"].includes(dishLevelInput.value)) {
    dishLevelInput.value = "low";
  }

  return true;
}

function getCapacityGuide(household, dishLevel) {
  if (household >= 1 && household <= 2) {
    return dishLevel === "low"
      ? {
          title: "3~4인용부터 비교해보세요.",
          description: "1~2인 가구에서 식기량이 적은 경우 한국소비자원 가이드는 3~4인용 제품을 제시합니다."
        }
      : {
          title: "6인용을 함께 비교해보세요.",
          description: "1~2인 가구에서 식기량이 많은 경우 한국소비자원 가이드는 6인용 제품을 제시합니다."
        };
  }

  if (household >= 3 && household <= 4) {
    return dishLevel === "low"
      ? {
          title: "6인용부터 비교해보세요.",
          description: "3~4인 가구에서 식기량이 적은 경우 한국소비자원 가이드는 6인용 제품을 제시합니다."
        }
      : {
          title: "12~14인용을 비교해보세요.",
          description: "3~4인 가구에서 식기량이 많은 경우 한국소비자원 가이드는 12~14인용 제품을 제시합니다."
        };
  }

  return {
    title: "실제 식기량과 설치공간을 기준으로 비교해보세요.",
    description: "현재 적용한 한국소비자원 가이드는 1~4인 가구 기준을 제시합니다. 5인 이상은 특정 용량을 임의로 제시하지 않습니다."
  };
}

function calculateDishwasher() {
  const values = validateInputs(dishwasherInputRules);
  if (!values || !validateDishwasherRelations(values)) return;

  const {
    household, price, years, uses,
    currentMinutes, remainingMinutes
  } = values;

  const dishLevel = dishLevelInput.value;
  const totalUses = uses * 52 * years;
  const detergentTotal = DETERGENT_COST_PER_USE * totalUses;
  const totalCost = price + detergentTotal;
  const costPerUse = totalCost / totalUses;
  const savedMinutesPerUse = currentMinutes - remainingMinutes;
  const savedHours = (savedMinutesPerUse * totalUses) / 60;
  const costPerHour = totalCost / savedHours;

  if (
    !isValidCalculationNumber(
      detergentTotal, totalCost, totalUses, costPerUse,
      savedMinutesPerUse, savedHours, costPerHour
    ) ||
    totalUses <= 0 ||
    savedHours <= 0
  ) {
    showInputError(
      currentMinutesInput,
      "입력값으로 정상적인 계산을 할 수 없습니다. 시간을 다시 확인해주세요."
    );
    return;
  }

  renderDishwasherResult({
    household, dishLevel, price, years, uses,
    currentMinutes, remainingMinutes,
    detergentTotal, totalCost, totalUses, costPerUse,
    savedMinutesPerUse, savedHours, costPerHour
  });

  hasCalculated = true;
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";

  if (window.JamkkanAnalytics) {
    window.JamkkanAnalytics.trackCalculation("식기세척기");
  }
}

function renderDishwasherResult(result) {
  const {
    household, dishLevel, price, years, uses,
    currentMinutes, remainingMinutes,
    detergentTotal, totalCost, totalUses, costPerUse,
    savedMinutesPerUse, savedHours, costPerHour
  } = result;

  const dishText = dishLevel === "low" ? "식기량 적은 편" : "식기량 많은 편";

  resultSummary.textContent =
    `${household}인 가구 · ${dishText} · 주 ${uses}회 · ${years}년 사용 · 1회 ${currentMinutes}→${remainingMinutes}분`;

  totalCostLabel.textContent = `${years}년 예상 총비용`;
  totalUsesLabel.textContent = `${years}년 예상 사용횟수`;
  savedHoursLabel.textContent = `${years}년 동안 되찾는 시간`;

  totalCostElement.textContent = formatWon(totalCost);
  totalUsesElement.textContent = formatNumber(totalUses) + "회";
  costPerUseElement.textContent = formatWon(costPerUse);
  savedHoursElement.textContent = formatNumber(savedHours) + "시간";
  costPerHourElement.textContent = formatWon(costPerHour) + " / 1시간";

  totalCostFormula.textContent =
    `제품 ${formatWon(price)} + 예상 세제비 ${formatWon(DETERGENT_COST_PER_USE)} × ${formatNumber(totalUses)}회 = ${formatWon(totalCost)}`;

  totalUsesFormula.textContent =
    `주 ${uses}회 × 52주 × ${years}년 = ${formatNumber(totalUses)}회`;

  costPerUseFormula.textContent =
    `${formatWon(totalCost)} ÷ ${formatNumber(totalUses)}회 ≈ ${formatWon(costPerUse)}`;

  savedHoursFormula.textContent =
    `한 번에 ${savedMinutesPerUse}분 절약 × ${formatNumber(totalUses)}회 ≈ ${formatNumber(savedHours)}시간`;

  costPerHourFormula.textContent =
    `${formatWon(totalCost)} ÷ ${formatNumber(savedHours)}시간 ≈ ${formatWon(costPerHour)}`;

  resultMessage.replaceChildren(
    createText("제품가격만 보면 "),
    createStrongText(formatWon(price)),
    createText("이지만, 세제비를 1회 "),
    createStrongText(formatWon(DETERGENT_COST_PER_USE)),
    createText("으로 잡으면 "),
    createStrongText(`${years}년 동안 약 ${formatWon(detergentTotal)}`),
    createText("이 추가됩니다."),
    createBreak(),
    createBreak(),
    createText("그 총비용을 되찾는 시간으로 나누면 1시간을 약 "),
    createStrongText(formatWon(costPerHour)),
    createText("에 사는 셈입니다. 이 시간이 나에게 그만한 가치가 있는지 판단해보세요.")
  );

  const capacityGuide = getCapacityGuide(household, dishLevel);
  capacityTitle.textContent = capacityGuide.title;
  capacityDescription.textContent = capacityGuide.description;

  resultEmpty.style.display = "none";
  resultContent.style.display = "block";

  window.setTimeout(() => {
    document.querySelector(".result-box").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);
}

function markResultStale() {
  if (!hasCalculated) return;
  resultStale.style.display = "block";
  calculateButton.textContent = "변경한 값으로 다시 계산";
}

function moveToInputs() {
  const box = document.querySelector(".calculator-box");
  box.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    householdInput.focus({ preventScroll: true });
    if (typeof householdInput.select === "function") {
      householdInput.select();
    }
  }, 250);
}

function resetCalculator() {
  householdInput.value = defaultValues.household;
  dishLevelInput.value = defaultValues.dishLevel;
  priceInput.value = defaultValues.price;
  yearsInput.value = defaultValues.years;
  usesInput.value = defaultValues.uses;
  currentMinutesInput.value = defaultValues.currentMinutes;
  remainingMinutesInput.value = defaultValues.remainingMinutes;

  formatMoneyInput(priceInput, 8);
  clearAllInputErrors(dishwasherInputRules);

  resultContent.style.display = "none";
  resultEmpty.style.display = "block";
  resultStale.style.display = "none";
  calculateButton.textContent = "계산해보기";
  hasCalculated = false;

  moveToInputs();
}

calculateButton.addEventListener("click", calculateDishwasher);
editButton.addEventListener("click", moveToInputs);
resetButton.addEventListener("click", resetCalculator);

bindInputEvents(dishwasherInputRules, calculateDishwasher);

dishwasherInputRules.forEach((rule) => {
  rule.element.addEventListener("input", markResultStale);
});

dishLevelInput.addEventListener("change", markResultStale);
