"use strict";

const HUMIDIFIER_TYPES = {
  ultrasonic: { label: "초음파식", seasonCost: 5500, help: "물을 미세하게 진동시켜 분사해요. 전기료가 낮은 편이고 세척 관리가 중요해요." },
  heated: { label: "가열식", seasonCost: 84000, help: "물을 가열해 수증기로 내보내요. 따뜻하게 가습하지만 전기료가 높은 편이에요." },
  hybrid: { label: "복합식", seasonCost: 27300, help: "두 가지 이상의 가습 방식을 결합해요. 작동 방식에 따라 전기 사용량이 달라질 수 있어요." },
  evaporative: { label: "기화식", seasonCost: 5400, help: "물을 머금은 필터 등에 바람을 통과시켜 증발시켜요. 전기료는 낮은 편이지만 필터 비용이 들 수 있어요." }
};
const priceInput=document.getElementById("price"), typeInput=document.getElementById("type"), typeHelp=document.getElementById("typeHelp"), hoursInput=document.getElementById("hoursPerDay"), seasonInput=document.getElementById("season"), yearsInput=document.getElementById("years");
const calculateButton=document.getElementById("calculateButton"), resultEmpty=document.getElementById("resultEmpty"), resultContent=document.getElementById("resultContent"), resultSummary=document.getElementById("resultSummary"), resultStale=document.getElementById("resultStale");
const dailyCostEl=document.getElementById("dailyCost"), monthlyCostEl=document.getElementById("monthlyCost"), electricityTotalEl=document.getElementById("electricityTotal"), totalCostEl=document.getElementById("totalCost"), monthlyTotalEl=document.getElementById("monthlyTotal");
const dailyFormula=document.getElementById("dailyFormula"), monthlyFormula=document.getElementById("monthlyFormula"), electricityTotalFormula=document.getElementById("electricityTotalFormula"), totalCostFormula=document.getElementById("totalCostFormula"), monthlyTotalFormula=document.getElementById("monthlyTotalFormula"), electricityTotalLabel=document.getElementById("electricityTotalLabel"), totalCostLabel=document.getElementById("totalCostLabel"), resultMessage=document.getElementById("resultMessage");
const editButton=document.getElementById("editButton"), resetButton=document.getElementById("resetButton");
const inputRules=[
 {element:priceInput,name:"가습기 가격",type:"money",min:1,max:10000000,maxLength:8,integer:true,zeroAllowed:false},
 {element:hoursInput,name:"하루 사용시간",type:"number",min:1,max:24,maxLength:2,integer:true,zeroAllowed:false}
];
const defaults={price:"150000",type:"ultrasonic",hours:"8",season:"6",years:"3"};
let hasCalculated=false;
function updateTypeHelp(){ const t=HUMIDIFIER_TYPES[typeInput.value]; if(t) typeHelp.textContent=t.help; }
function calculate(){
 const v=validateInputs(inputRules); if(!v)return;
 const t=HUMIDIFIER_TYPES[typeInput.value], months=Number(seasonInput.value), years=Number(yearsInput.value); if(!t||![6,9,12].includes(months)||![1,2,3,5,7,10].includes(years))return;
 const usageRatio=(v.hoursPerDay/8)*(months/6);
 const annualCost=t.seasonCost*usageRatio;
 const monthlyCost=annualCost/months;
 const dailyCost=monthlyCost/30;
 const maintenanceTotal=annualCost*years;
 const totalCost=v.price+maintenanceTotal;
 const monthlyTotal=totalCost/(years*12);
 if(!isValidCalculationNumber(annualCost,dailyCost,monthlyCost,maintenanceTotal,totalCost,monthlyTotal))return;
 resultSummary.textContent=`${t.label} · 하루 ${v.hoursPerDay}시간 · 연 ${months}개월 · ${years}년 사용`;
 dailyCostEl.textContent=formatWon(dailyCost); monthlyCostEl.textContent=formatWon(monthlyCost); electricityTotalEl.textContent=formatWon(maintenanceTotal); totalCostEl.textContent=formatWon(totalCost); monthlyTotalEl.textContent=formatWon(monthlyTotal)+" / 월";
 electricityTotalLabel.textContent=`${years}년 예상 전기료`;
 totalCostLabel.textContent=`${years}년 예상 총비용`;
 dailyFormula.textContent=`하루 ${v.hoursPerDay}시간 사용 기준`;
 monthlyFormula.textContent=`사용하는 달 30일 기준`;
 electricityTotalFormula.textContent=`연 ${months}개월 × ${years}년 사용 기준`;
 totalCostFormula.textContent=`제품 ${formatWon(v.price)} + 예상 전기료 ${formatWon(maintenanceTotal)}`;
 monthlyTotalFormula.textContent=`${formatWon(totalCost)} ÷ ${years*12}개월 ≈ ${formatWon(monthlyTotal)}`;
 const filterNote=(typeInput.value==="evaporative"||typeInput.value==="hybrid") ? " 교체형 필터를 사용하는 제품이라면 실제 유지비에는 필터 비용이 추가될 수 있습니다." : "";
 resultMessage.replaceChildren(createText(`${t.label}을 하루 ${v.hoursPerDay}시간 사용하면 하루 예상 전기료는 약 `),createStrongText(formatWon(dailyCost)),createText(`, 사용하는 달 기준 한 달 약 `),createStrongText(formatWon(monthlyCost)),createText("입니다."),createBreak(),createBreak(),createText(`${years}년 동안 제품가격까지 포함한 예상 총비용은 약 `),createStrongText(formatWon(totalCost)),createText(`입니다.${filterNote}`));
 resultEmpty.style.display="none"; resultContent.style.display="block"; resultStale.style.display="none"; calculateButton.textContent="계산해보기"; hasCalculated=true;
 if(window.JamkkanAnalytics) window.JamkkanAnalytics.trackCalculation("가습기");
 setTimeout(()=>document.querySelector(".result-box").scrollIntoView({behavior:"smooth",block:"start"}),100);
}
function markStale(){if(!hasCalculated)return;resultStale.style.display="block";calculateButton.textContent="변경한 값으로 다시 계산";}
function moveToInputs(){const box=document.querySelector(".calculator-box");box.scrollIntoView({behavior:"smooth",block:"start"});setTimeout(()=>{priceInput.focus({preventScroll:true});priceInput.select();},250);}
function reset(){priceInput.value=defaults.price;typeInput.value=defaults.type;hoursInput.value=defaults.hours;seasonInput.value=defaults.season;yearsInput.value=defaults.years;formatMoneyInput(priceInput,8);clearAllInputErrors(inputRules);updateTypeHelp();resultContent.style.display="none";resultEmpty.style.display="block";resultStale.style.display="none";calculateButton.textContent="계산해보기";hasCalculated=false;moveToInputs();}
calculateButton.addEventListener("click",calculate);editButton.addEventListener("click",moveToInputs);resetButton.addEventListener("click",reset);bindInputEvents(inputRules,calculate);inputRules.forEach(r=>r.element.addEventListener("input",markStale));[typeInput,seasonInput,yearsInput].forEach(el=>el.addEventListener("change",()=>{if(el===typeInput)updateTypeHelp();markStale();}));updateTypeHelp();
