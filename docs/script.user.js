// ==UserScript==
// @name         [megamarket.ru] Show adjusted prices
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  Sorry. Nothing interesting here.
// @author       Persona
// @match        https://megamarket.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=megamarket.ru
// @grant        none
// ==/UserScript==

"use strict";(()=>{var d="adjustedPrice";function L(e,t){console.log(`/*-------------------------- PRICE ADJUSTER -----------------------------------*/
${e.toUpperCase()} MESSAGE
  
${t}`)}var E={fg:"white",bg:"#b222ff",border:"black"},x={bg:"#cccccc",fg:"black",border:"transparent"},c={0:{bg:"#00FF22",fg:"black",border:"black"},1:{bg:"#00b621",fg:"white",border:"transparent"},2:{bg:"#f4f44f",fg:"black",border:"transparent"},3:{bg:"#eba000",fg:"white",border:"transparent"},4:{bg:"#AB3131",fg:"white",border:"transparent"},5:{bg:"#540202",fg:"white",border:"transparent"},6:{bg:"#000000",fg:"white",border:"transparent"}};function A(e){var t;let n=(t=/^[\d\s]+/.exec(e.replace(/\s/g,"")))===null||t===void 0?void 0:t[0].trim();return n===void 0?null:parseInt(n)}function p(e){return e.price?e.price-(e.bonusAmount||0):null}function g(e){function t(n,r){return`<span style="color:${n.fg}; background-color:${n.bg}; border: 1px solid ${n.border}; padding:0 5px 0;">${r}</span>`}if(e==="BONUS_AMOUNT")return[t(x,"0%"),t(c[5],"1-10%"),t(c[4],"10-20%"),t(c[3],"20-30%"),t(c[2],"30-40%"),t(c[1],"40-50%"),t(c[0],"50-60%"),t(E,"60%+")].join(" ");if(e==="COMPARISON")return[P("\u0422\u041E\u041F 1-5"),...Object.values(c).map((n,r)=>t(n,r.toString()))].join(" ")}function j(e){return e>60?E:e>50?c[0]:e>40?c[1]:e>30?c[2]:e>20?c[3]:e>10?c[4]:e>0?c[5]:x}function C(e,t){let n=t[0],r=t[t.length-1],o=t.findIndex(y=>y===e),i=Object.keys(c).length,s=Math.floor(((e-n)/(r-n)+o/t.length)/2*i);return{color:t.length===1?c[0]:c[s<i?s:i-1],position:o+1}}function h(e){let t=e.map(n=>p(n)).filter(n=>n!==null).sort((n,r)=>n-r);return[...new Set(t)]}function m(e,t){return`<span style="color:${t.fg};background-color:${t.bg};border: 1px solid ${t.border};padding: 0px 10px; margin-right: 5px">${e.toLocaleString("ru-RU",{useGrouping:!0})}<span>`}function P(e){return`<span style="color: #5d3a8e;outline: 1px solid #5d3a8e;padding: 0px 15px;">${e}</span> `}function u(e,t){let n=[],r=document.querySelectorAll(e);for(let o of Array.from(r))if(o instanceof HTMLElement&&!o.dataset[d]){let i=o.querySelector(t);!i||!(i instanceof HTMLElement)?(console.log(o,i),L("error",`"PriceNode" element (selector: "${t}") is not found inside "PriceContainer" element (selector: "${e}").`),o.dataset[d]="1"):n.push({price:null,bonusAmount:null,priceContainerEl:o,priceEl:i})}return n}function l(e,t){return e.map(n=>{let r=n.priceContainerEl;if(r.dataset[d])return n;let o=n.priceEl;if(!o.textContent)return n;let i=A(o.textContent),s=r.querySelectorAll(t)[0];if(!s||!s.textContent)return{price:i,bonusAmount:0,priceContainerEl:r,priceEl:o};let b=A(s.textContent);return{price:i,bonusAmount:b,priceContainerEl:r,priceEl:o}})}function a(e){e.forEach(t=>{if(t.priceContainerEl.dataset[d])return;let n=p(t);if(n===null||t.price===null||t.bonusAmount===null)return;let r=Math.round(t.bonusAmount/t.price*100),o=j(r),i=document.createElement("span");i.innerHTML=m(n,o),t.priceEl.prepend(i),t.priceContainerEl.dataset[d]="1"})}var f="adjustedPrice";(function(){setInterval(()=>{T(),M(),S(),I(),F(),H(),_()},2e3)})();function _(){if(!document.body.dataset[f]){let e=document.createElement("div");e.innerHTML="\u041F\u043E \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0435\u043C\u044B\u0445 \u0431\u0430\u043B\u043B\u043E\u0432: "+g("BONUS_AMOUNT")+'<span style="padding-left: 20px;">\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0446\u0435\u043D \u043F\u043E-\u0432\u043E\u0437\u0440\u0430\u0441\u0442\u0430\u043D\u0438\u044E: </span>'+g("COMPARISON"),e.style.position="fixed",e.style.bottom="0",e.style.width="100%",e.style.backgroundColor="white",e.style.zIndex="2147483647",e.style.padding="3px 5px",e.style.lineHeight="25px",e.style.borderTop="1px solid #d4d4d4",document.body.appendChild(e),document.body.dataset[f]="1"}}function M(){let e=u(".product-offer-price",".product-offer-price__amount");e=l(e,".bonus-amount");let t=h(e);e.forEach(n=>{if(n.priceContainerEl.dataset[f])return;let r=p(n);if(r===null)return;let{color:o,position:i}=C(r,t),s=document.createElement("span");s.innerHTML=(i<=5?P(i):"")+m(r,o),n.priceContainerEl.querySelectorAll(".product-offer-price__amount")[0].prepend(s),n.priceContainerEl.dataset[f]="1"})}function T(){let e=u(".catalog-item__prices-container",".item-price");e=l(e,".bonus-amount"),a(e)}function S(){let e=u(".product-list-item-price",".amount");e=l(e,".bonus-amount"),a(e)}function I(){let e=u(".cart-item-price",".price");e=l(e,".bonus-amount"),a(e)}function F(){let e=u(".goods-item-card__money",".goods-item-card__amount");e=l(e,".bonus-amount"),a(e)}function H(){let e=u(".prod-buy",".sales-block-offer-price__price-final");e=l(e,".bonus-amount"),a(e)}})();
