import {
  calcAdjustedPrice,
  generateUniqueSortedAdjustedPriceList,
  getColorAndPositionForAPrice,
  renderAdjustedPriceHTMLString,
  renderPositionHTMLString,
  getPriceObjList,
  populatePriceAndBonusAmountForEachPriceObj,
  prependAdjustedPriceForPriceEachObj,
} from "./helpers"

const DATA_KEY_ADJUSTED_PRICE = "adjustedPrice"

;(function main() {
  setInterval(() => {
    setAdjustedPricesForSearchPage()
    setAdjustedPricesForProductPage()
    setAdjustedPricesForOtherPage()
    setAdjustedPricesForCartPage()
    setAdjustedPricesForRecentViews()
  }, 2000)
})()

function setAdjustedPricesForProductPage() {
  let priceObjList = getPriceObjList(".product-offer-price", ".product-offer-price__amount")

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, ".bonus-amount")

  const sortedAdjustedPriceList = generateUniqueSortedAdjustedPriceList(priceObjList)

  priceObjList.forEach((priceObj) => {
    if (priceObj.priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE]) {
      return
    }

    const adjustedPrice = calcAdjustedPrice(priceObj)

    if (adjustedPrice === null) {
      return
    }

    const { color, position } = getColorAndPositionForAPrice(adjustedPrice, sortedAdjustedPriceList)

    const totalPriceEl = document.createElement("span")

    totalPriceEl.innerHTML =
      (position <= 5 ? renderPositionHTMLString(position) : "") + renderAdjustedPriceHTMLString(adjustedPrice, color)

    const priceEl = priceObj.priceContainerEl.querySelectorAll(".product-offer-price__amount")[0]

    priceEl.prepend(totalPriceEl)

    priceObj.priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE] = "1"
  })
}

function setAdjustedPricesForSearchPage() {
  let priceObjList = getPriceObjList(".catalog-item__prices-container", ".item-price")

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, ".bonus-amount")

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForOtherPage() {
  let priceObjList = getPriceObjList(".product-list-item-price", ".amount")

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, ".bonus-amount")

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForCartPage() {
  let priceObjList = getPriceObjList(".cart-item-price", ".price")

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, ".bonus-amount")

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForRecentViews() {
  let priceObjList = getPriceObjList(".goods-item-card__money", ".goods-item-card__amount")

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, ".bonus-amount")

  prependAdjustedPriceForPriceEachObj(priceObjList)
}
