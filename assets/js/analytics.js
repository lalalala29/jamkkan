/* 잠깐. - 공통 GA4 측정
   모든 페이지에서 이 파일 하나를 불러오면 기본 방문 측정을 시작합니다.
   계산기에서는 JamkkanAnalytics.trackCalculation(category)를 호출합니다.
   쿠팡 제휴 버튼 클릭은 공통으로 자동 측정합니다. */
(function () {
  "use strict";

  const MEASUREMENT_ID = "G-L82K0QBWWB";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  function trackEvent(name, params) {
    window.gtag("event", name, params || {});
  }

  window.JamkkanAnalytics = {
    trackEvent,
    trackCalculation(category) {
      trackEvent("calculate", {
        calculator_type: String(category || "unknown"),
        page_path: window.location.pathname
      });
    }
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest(".affiliate-button");
    if (!link) return;

    const slot = link.closest(".affiliate-slot");
    const category = slot ? (slot.dataset.category || "제품") : "제품";

    trackEvent("coupang_click", {
      calculator_type: category,
      link_url: link.href,
      page_path: window.location.pathname
    });
  });
})();
