"use strict";


/* =========================================================
   잠깐. 공통 JavaScript

   공통 기능
   - 숫자/금액 포맷
   - 금액 입력 자동 콤마
   - 최대 자릿수 제한
   - 입력값 검증
   - 오류 표시
   - 오류 focus/select
   - Enter 처리
   - XSS 안전 DOM 생성
========================================================= */


/* =========================================================
   FORMAT
========================================================= */

function formatWon(value) {

  if (!Number.isFinite(value)) {
    return "-";
  }

  return Math.round(value)
    .toLocaleString("ko-KR") + "원";
}


function formatNumber(value) {

  if (!Number.isFinite(value)) {
    return "-";
  }

  return Math.round(value)
    .toLocaleString("ko-KR");
}


/* =========================================================
   INPUT VALUE
========================================================= */

/**
 * 문자열에서 숫자만 남김
 *
 * "1,200,000원" -> "1200000"
 * "abc123"       -> "123"
 */
function getDigitsOnly(value) {

  return String(value)
    .replace(/[^\d]/g, "");
}


/**
 * 금액 input의 실제 숫자값 반환
 */
function getMoneyValue(input) {

  const digits =
    getDigitsOnly(input.value);

  if (digits === "") {
    return NaN;
  }

  return Number(digits);
}


/**
 * 일반 number input 값 반환
 */
function getNumberValue(input) {

  if (
    input.value.trim() === ""
  ) {
    return NaN;
  }

  return input.valueAsNumber;
}


/**
 * rule 타입에 따라 숫자값 반환
 *
 * type: "money"
 * type: "number"
 */
function getInputNumber(rule) {

  if (
    rule.type === "money"
  ) {

    return getMoneyValue(
      rule.element
    );
  }

  return getNumberValue(
    rule.element
  );
}


/* =========================================================
   MAX LENGTH
========================================================= */

/**
 * 숫자 최대 자릿수 적용
 *
 * maxlength는 input type="number"에서
 * 정상적으로 동작하지 않으므로 JS에서 처리
 */
function limitInputLength(
  input,
  maxLength
) {

  if (
    !maxLength ||
    maxLength <= 0
  ) {
    return;
  }


  /*
    money 타입에서도 사용할 수 있도록
    숫자만 추출
  */
  let digits =
    getDigitsOnly(input.value);


  if (
    digits.length > maxLength
  ) {

    digits =
      digits.slice(
        0,
        maxLength
      );
  }


  return digits;
}


/* =========================================================
   MONEY INPUT
========================================================= */

/**
 * 금액 입력창 자동 포맷
 *
 * 1200000
 * -> 1,200,000
 */
function formatMoneyInput(
  input,
  maxLength
) {

  let digits =
    getDigitsOnly(input.value);


  if (
    maxLength &&
    digits.length > maxLength
  ) {

    digits =
      digits.slice(
        0,
        maxLength
      );
  }


  /*
    빈 값은 그대로 유지
  */
  if (digits === "") {

    input.value = "";

    return;
  }


  /*
    불필요한 앞쪽 0 제거
    단, 0 하나는 허용
  */
  digits =
    digits.replace(
      /^0+(?=\d)/,
      ""
    );


  const number =
    Number(digits);


  if (
    !Number.isFinite(number)
  ) {

    input.value = "";

    return;
  }


  input.value =
    number.toLocaleString(
      "ko-KR"
    );
}


/* =========================================================
   NUMBER INPUT LENGTH
========================================================= */

/**
 * 일반 number input 최대 자릿수 처리
 */
function formatNumberInput(
  input,
  maxLength
) {

  if (!maxLength) {
    return;
  }


  /*
    음수 입력 중 '-' 자체는
    validator에서 처리할 수 있도록 둠
  */
  if (
    input.value === "-"
  ) {
    return;
  }


  /*
    숫자와 소수점, -는 브라우저가
    type=number에서 기본 처리
  */

  const raw =
    input.value;


  /*
    부호와 소수점을 제외한 숫자 개수
  */
  const digitCount =
    (raw.match(/\d/g) || [])
      .length;


  if (
    digitCount <= maxLength
  ) {
    return;
  }


  /*
    정수형 입력을 기본 전제로
    최대 자릿수까지만 유지
  */
  const digits =
    getDigitsOnly(raw)
      .slice(
        0,
        maxLength
      );


  input.value =
    digits;
}


/* =========================================================
   ERROR
========================================================= */

function clearInputError(input) {

  if (!input) {
    return;
  }


  input.classList.remove(
    "input-error"
  );


  input.removeAttribute(
    "aria-invalid"
  );


  const group =
    input.closest(
      ".input-group"
    );


  if (!group) {
    return;
  }


  const error =
    group.querySelector(
      ".error-message"
    );


  if (error) {
    error.remove();
  }
}


function clearAllInputErrors(
  rules
) {

  rules.forEach(
    (rule) => {

      clearInputError(
        rule.element
      );
    }
  );
}


function showInputError(
  input,
  message
) {

  if (!input) {
    return;
  }


  clearInputError(input);


  input.classList.add(
    "input-error"
  );


  input.setAttribute(
    "aria-invalid",
    "true"
  );


  const group =
    input.closest(
      ".input-group"
    );


  if (group) {

    const error =
      document.createElement("p");


    error.className =
      "error-message";


    /*
      XSS 방어:
      innerHTML 사용하지 않음
    */
    error.textContent =
      String(message);


    group.appendChild(
      error
    );
  }


  input.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  window.setTimeout(
    () => {

      input.focus({
        preventScroll: true
      });


      if (
        typeof input.select ===
        "function"
      ) {

        input.select();
      }

    },
    250
  );
}


/* =========================================================
   VALIDATION
========================================================= */

function validateNumberInput(
  rule
) {

  const input =
    rule.element;


  if (!input) {
    return null;
  }


  /*
    빈값
  */
  if (
    input.value.trim() === ""
  ) {

    showInputError(
      input,
      `${rule.name}을(를) 입력해주세요.`
    );

    return null;
  }


  /*
    최대 자릿수
  */
  const digits =
    getDigitsOnly(
      input.value
    );


  if (
    rule.maxLength &&
    digits.length >
      rule.maxLength
  ) {

    showInputError(
      input,
      `${rule.name}은(는) 최대 ${rule.maxLength}자리까지 입력할 수 있습니다.`
    );

    return null;
  }


  const value =
    getInputNumber(rule);


  /*
    NaN / Infinity
  */
  if (
    !Number.isFinite(value)
  ) {

    showInputError(
      input,
      `${rule.name}에 올바른 숫자를 입력해주세요.`
    );

    return null;
  }


  /*
    정수
  */
  if (
    rule.integer === true &&
    !Number.isInteger(value)
  ) {

    showInputError(
      input,
      `${rule.name}은(는) 정수로 입력해주세요.`
    );

    return null;
  }


  /*
    0 허용 여부
  */
  if (
    rule.zeroAllowed === false &&
    value === 0
  ) {

    showInputError(
      input,
      `${rule.name}은(는) 0보다 크게 입력해주세요.`
    );

    return null;
  }


  /*
    최소값
  */
  if (
    typeof rule.min ===
      "number" &&
    value < rule.min
  ) {

    showInputError(
      input,

      rule.minMessage ||

      `${rule.name}은(는) ${formatNumber(rule.min)} 이상으로 입력해주세요.`
    );

    return null;
  }


  /*
    최대값
  */
  if (
    typeof rule.max ===
      "number" &&
    value > rule.max
  ) {

    showInputError(
      input,

      rule.maxMessage ||

      `${rule.name}은(는) ${formatNumber(rule.max)} 이하로 입력해주세요.`
    );

    return null;
  }


  return value;
}


function validateInputs(
  rules
) {

  clearAllInputErrors(
    rules
  );


  const values = {};


  for (
    const rule of rules
  ) {

    const value =
      validateNumberInput(
        rule
      );


    if (
      value === null
    ) {

      return null;
    }


    const key =
      rule.key ||
      rule.element.id;


    values[key] =
      value;
  }


  return values;
}


/* =========================================================
   INPUT EVENTS
========================================================= */

function bindInputEvents(
  rules,
  enterCallback
) {

  rules.forEach(
    (rule) => {

      const input =
        rule.element;


      if (!input) {
        return;
      }


      input.addEventListener(
        "input",
        () => {

          clearInputError(
            input
          );


          /*
            금액
          */
          if (
            rule.type ===
            "money"
          ) {

            formatMoneyInput(
              input,
              rule.maxLength
            );

            return;
          }


          /*
            일반 숫자
          */
          formatNumberInput(
            input,
            rule.maxLength
          );
        }
      );


      input.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();


            if (
              typeof enterCallback ===
              "function"
            ) {

              enterCallback();
            }
          }
        }
      );


      /*
        초기 HTML value도
        금액이면 콤마 포맷 적용
      */
      if (
        rule.type ===
        "money"
      ) {

        formatMoneyInput(
          input,
          rule.maxLength
        );
      }
    }
  );
}


/* =========================================================
   SAFE DOM
========================================================= */

function createStrongText(text) {

  const strong =
    document.createElement(
      "strong"
    );


  strong.textContent =
    String(text);


  return strong;
}


function createText(text) {

  return document
    .createTextNode(
      String(text)
    );
}


function createBreak() {

  return document
    .createElement("br");
}


/* =========================================================
   CALCULATION SAFETY
========================================================= */

function isValidCalculationNumber(
  ...values
) {

  return values.every(
    (value) =>
      Number.isFinite(value)
  );
}