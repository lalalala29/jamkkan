/* 잠깐. - 공통 제휴 링크 컴포넌트
   각 페이지의 .affiliate-slot 에 data-category / data-url 만 지정합니다.
   data-url 이 비어 있으면 영역 자체를 노출하지 않습니다. */
(function () {
  "use strict";

  const slots = document.querySelectorAll(".affiliate-slot");

  slots.forEach((slot) => {
    const category = (slot.dataset.category || "제품").trim();
    const url = (slot.dataset.url || "").trim();

    if (!url) {
      slot.hidden = true;
      return;
    }

    const box = document.createElement("section");
    box.className = "affiliate-box";
    box.setAttribute("aria-label", `${category} 구매 참고`);

    const kicker = document.createElement("p");
    kicker.className = "affiliate-kicker";
    kicker.textContent = "DECIDED TO BUY?";

    const title = document.createElement("h3");
    title.className = "affiliate-title";
    title.textContent = "구매하기로 결정하셨나요?";

    const description = document.createElement("p");
    description.className = "affiliate-description";
    description.textContent = `계산 결과를 확인한 뒤 구매를 고려하고 있다면 ${category} 판매 제품을 확인해보세요.`;

    const link = document.createElement("a");
    link.className = "affiliate-button";
    link.href = url;
    link.target = "_blank";
    link.rel = "sponsored nofollow noopener noreferrer";
    link.textContent = `${category} 제품 보러가기 →`;

    const disclosure = document.createElement("p");
    disclosure.className = "affiliate-disclosure";
    disclosure.textContent = "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

    box.append(kicker, title, description, link, disclosure);
    slot.replaceChildren(box);
    slot.hidden = false;
  });
})();
