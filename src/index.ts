import {
  calcAdjustedPrice,
  generateUniqueSortedAdjustedPriceList,
  getColorAndPositionForAPrice,
  renderAdjustedPriceHTML,
  renderPositionHTML,
  getPriceObjList,
  populatePriceAndBonusAmountForEachPriceObj,
  prependAdjustedPriceForPriceEachObj,
  generateColorsInfoHTML,
} from './helpers'

const DATA_KEY_ADJUSTED_PRICE = 'adjustedPrice'

;(function main() {
  setInterval(() => {
    setAdjustedPricesForSearchPage()
    setAdjustedPricesForProductPage()
    setAdjustedPricesForOtherPage()
    setAdjustedPricesForCartPage()
    setAdjustedPricesForRecentViews()
    setAdjustedPricesForMainProductPrice()
    renderColorInfoPanel()
  }, 2000)
})()

function renderColorInfoPanel() {
  if (document.body.dataset[DATA_KEY_ADJUSTED_PRICE]) {
  } else {
    const d = document.createElement('div')
    d.innerHTML =
      'По проценту начисляемых баллов: ' +
      generateColorsInfoHTML('BONUS_AMOUNT') +
      '<span style="padding-left: 20px;">Сравнение цен по-возрастанию: </span>' +
      generateColorsInfoHTML('COMPARISON')
    d.style.position = 'fixed'
    d.style.bottom = '0'
    d.style.width = '100%'
    d.style.backgroundColor = 'white'
    d.style.zIndex = '2147483647'
    d.style.padding = '3px 5px'
    d.style.lineHeight = '25px'
    d.style.borderTop = '1px solid #d4d4d4'

    document.body.appendChild(d)
    document.body.dataset[DATA_KEY_ADJUSTED_PRICE] = '1'
  }
}

function setAdjustedPricesForProductPage() {
  let priceObjList = getPriceObjList('.product-offer-price', '.product-offer-price__amount')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

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

    const totalPriceEl = document.createElement('span')

    totalPriceEl.innerHTML =
      (position <= 5 ? renderPositionHTML(position) : '') + renderAdjustedPriceHTML(adjustedPrice, color)

    const priceEl = priceObj.priceContainerEl.querySelectorAll('.product-offer-price__amount')[0]

    priceEl.prepend(totalPriceEl)

    priceObj.priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE] = '1'
  })
}

function setAdjustedPricesForSearchPage() {
  let priceObjList = getPriceObjList('.catalog-item__prices-container', '.item-price')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForOtherPage() {
  let priceObjList = getPriceObjList('.product-list-item-price', '.amount')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForCartPage() {
  let priceObjList = getPriceObjList('.cart-item-price', '.price')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForRecentViews() {
  let priceObjList = getPriceObjList('.goods-item-card__money', '.goods-item-card__amount')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

  prependAdjustedPriceForPriceEachObj(priceObjList)
}

function setAdjustedPricesForMainProductPrice() {
  let priceObjList = getPriceObjList('.prod-buy', '.sales-block-offer-price__price-final')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

  prependAdjustedPriceForPriceEachObj(priceObjList)
}
