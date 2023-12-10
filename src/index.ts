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
  log,
} from './helpers'

const DATA_KEY_ADJUSTED_PRICE = 'adjustedPrice'
const RENDER_INTERVAL = 2000

;(function main() {
  setInterval(() => {
    try {
      setAdjustedPricesForSearchPage()
      setAdjustedPricesForProductPage()
      setAdjustedPricesForOtherPage()
      setAdjustedPricesForCartPage()
      setAdjustedPricesForRecentViews()
      setAdjustedPricesForMainProductPrice()
      renderColorInfoPanel()
    } catch (err) {
      if (err instanceof Error) {
        log('error', 'Error happened while executing userscript', err)
      }
    }
  }, RENDER_INTERVAL)
})()

function renderColorInfoPanel() {
  if (document.body.dataset[DATA_KEY_ADJUSTED_PRICE]) {
    return
  }

  const d = document.createElement('div')
  d.innerHTML = `По проценту начисляемых баллов: ${generateColorsInfoHTML(
    'BONUS_AMOUNT'
  )}<span style="padding-left: 20px;">Сравнение цен по-возрастанию: </span>${generateColorsInfoHTML('COMPARISON')}`
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

function setAdjustedPricesForProductPage() {
  let priceObjList = getPriceObjList('.product-offer-price', '.product-offer-price__amount')

  priceObjList = populatePriceAndBonusAmountForEachPriceObj(priceObjList, '.bonus-amount')

  if (priceObjList.length === 0) {
    return
  }

  const priceList: number[] = []
  let minPrice = 0

  priceObjList.forEach(({ price }) => {
    if (price !== null) {
      priceList.push(price)
    }
  })

  minPrice = Math.min(...priceList)

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

    if (priceEl instanceof HTMLElement && priceObj.price === minPrice) {
      priceEl.style.color = 'green'
    }

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
