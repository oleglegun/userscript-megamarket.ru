const DATA_KEY_ADJUSTED_PRICE = 'adjustedPrice'

export function log(level: 'info', message: string): void
export function log(level: 'error', message: string, error?: Error): void
export function log(level: 'info' | 'error', message: string | object, error?: Error) {
  console.log(
    `/*-------------------------- PRICE ADJUSTER -----------------------------------*/\n${level.toUpperCase()} MESSAGE: ${message}` +
      (error ? `\n${error.message}\n${error.stack}` : '')
  )
}

const ColorUltra: Color = { fg: 'white', bg: '#b222ff', border: 'black' }
const ColorNone: Color = { bg: '#cccccc', fg: 'black', border: 'transparent' }

const Colors: { [idx: number]: Color } = {
  0: { bg: '#00FF22', fg: 'black', border: 'black' },
  1: { bg: '#00b621', fg: 'white', border: 'transparent' },
  2: { bg: '#f4f44f', fg: 'black', border: 'transparent' },
  3: { bg: '#eba000', fg: 'white', border: 'transparent' },
  4: { bg: '#AB3131', fg: 'white', border: 'transparent' },
  5: { bg: '#540202', fg: 'white', border: 'transparent' },
  6: { bg: '#000000', fg: 'white', border: 'transparent' },
}

export function parsePrice(priceString: string) {
  const extractedPrice = /^[\d\s]+/.exec(priceString.replace(/\s/g, ''))?.[0].trim()

  if (extractedPrice === undefined) {
    return null
  }

  return parseInt(extractedPrice)
}

export function calcAdjustedPrice(priceObj: PriceObject) {
  if (priceObj.price) {
    return priceObj.price - (priceObj.bonusAmount ?? 0)
  } else {
    return null
  }
}

export function generateColorsInfoHTML(type: 'BONUS_AMOUNT' | 'COMPARISON') {
  function colorInfoHTML(c: Color, text: string) {
    return `<span style="color:${c.fg};font-weight:bold; background-color:${c.bg}; border: 1px solid ${c.border}; padding:0 5px 0;">${text}</span>`
  }

  if (type === 'BONUS_AMOUNT') {
    return [
      colorInfoHTML(ColorNone, '0%'),
      colorInfoHTML(Colors[5], '1-10%'),
      colorInfoHTML(Colors[4], '10-20%'),
      colorInfoHTML(Colors[3], '20-30%'),
      colorInfoHTML(Colors[2], '30-40%'),
      colorInfoHTML(Colors[1], '40-50%'),
      colorInfoHTML(Colors[0], '50-60%'),
      colorInfoHTML(ColorUltra, '60%+'),
    ].join(' ')
  } else if (type === 'COMPARISON') {
    return [
      renderPositionHTML('ТОП 1-5'),
      ...Object.values(Colors).map((color, idx) => colorInfoHTML(color, idx.toString())),
    ].join(' ')
  } else {
    throw new Error('Type is not supported.')
  }
}

export function getColorByBonusAmountPercentage(percentage: number): Color {
  if (percentage > 60) {
    return ColorUltra
  } else if (percentage > 50) {
    return Colors[0]
  } else if (percentage > 40) {
    return Colors[1]
  } else if (percentage > 30) {
    return Colors[2]
  } else if (percentage > 20) {
    return Colors[3]
  } else if (percentage > 10) {
    return Colors[4]
  } else if (percentage > 0) {
    return Colors[5]
  } else {
    return ColorNone
  }
}

export function getColorAndPositionForAPrice(price: number, sortedPriceList: number[]) {
  const minPrice = sortedPriceList[0]
  const maxPrice = sortedPriceList[sortedPriceList.length - 1]

  const priceIdx = sortedPriceList.findIndex((sortedPrice) => sortedPrice === price)

  const colorCount = Object.keys(Colors).length
  const colorIdx = Math.floor(
    (((price - minPrice) / (maxPrice - minPrice) + priceIdx / sortedPriceList.length) / 2) * colorCount
  )

  const color = sortedPriceList.length === 1 ? Colors[0] : Colors[colorIdx < colorCount ? colorIdx : colorCount - 1]

  return { color, position: priceIdx + 1 }
}

export function generateUniqueSortedAdjustedPriceList(priceObjList: PriceObject[]) {
  const sortedPriceList = priceObjList
    .map((priceObj) => calcAdjustedPrice(priceObj))
    .filter((price): price is Exclude<typeof price, null> => price !== null)
    .sort((a, b) => a - b)

  return [...new Set(sortedPriceList)]
}

export function renderAdjustedPriceHTML(adjustedPrice: number, color: Color) {
  return `<span style="color:${color.fg};background-color:${color.bg};border: 1px solid ${
    color.border
  };padding: 0px 10px; margin-right: 5px">${adjustedPrice.toLocaleString('ru-RU', {
    useGrouping: true,
  })}<span>`
}

export function renderPositionHTML(position: number | string): string {
  return `<span style="color: #5d3a8e;outline: 1px solid #5d3a8e;padding: 0px 15px;">${position}</span> `
}

export function getPriceObjList(priceContainerNodeSelector: string, priceNodeSelector: string): PriceObject[] {
  const priceObjList: PriceObject[] = []

  const priceContainerElList = document.querySelectorAll(priceContainerNodeSelector)

  for (const priceContainerEl of Array.from(priceContainerElList)) {
    if (priceContainerEl instanceof HTMLElement && !priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE]) {
      const priceNodeEl = priceContainerEl.querySelector(priceNodeSelector)

      if (!priceNodeEl || !(priceNodeEl instanceof HTMLElement)) {
        log(
          'error',
          `"PriceNode" element (selector: "${priceNodeSelector}") is not found inside "PriceContainer" element (selector: "${priceContainerNodeSelector}").`
        )

        priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE] = '1'
      } else {
        priceObjList.push({
          price: null,
          bonusAmount: null,
          priceContainerEl: priceContainerEl,
          priceEl: priceNodeEl,
        })
      }
    }
  }
  return priceObjList
}

export function populatePriceAndBonusAmountForEachPriceObj(
  priceObjList: PriceObject[],
  bonusAmountNodeSelector: string
) {
  return priceObjList.map((priceObj) => {
    const priceContainerEl = priceObj.priceContainerEl

    if (priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE]) {
      return priceObj
    }

    const priceEl = priceObj.priceEl

    if (!priceEl.textContent) {
      return priceObj
    }

    const price = parsePrice(priceEl.textContent)

    const bonusPriceEl = priceContainerEl.querySelectorAll(bonusAmountNodeSelector)[0]

    if (!bonusPriceEl?.textContent) {
      return {
        price: price,
        bonusAmount: 0,
        priceContainerEl: priceContainerEl,
        priceEl: priceEl,
      }
    }

    const bonusAmount = parsePrice(bonusPriceEl.textContent)

    return {
      price: price,
      bonusAmount: bonusAmount,
      priceContainerEl: priceContainerEl,
      priceEl: priceEl,
    }
  })
}

export function prependAdjustedPriceForPriceEachObj(priceObjList: PriceObject[]) {
  priceObjList.forEach((priceObj) => {
    if (priceObj.priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE]) {
      return
    }

    const adjustedPrice = calcAdjustedPrice(priceObj)

    if (adjustedPrice === null || priceObj.price === null || priceObj.bonusAmount === null) {
      return
    }

    const bonusAmountPercentage = Math.round((priceObj.bonusAmount / priceObj.price) * 100)

    const color = getColorByBonusAmountPercentage(bonusAmountPercentage)

    const totalPriceEl = document.createElement('span')

    totalPriceEl.innerHTML = renderAdjustedPriceHTML(adjustedPrice, color)

    priceObj.priceEl.prepend(totalPriceEl)

    priceObj.priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE] = '1'
  })
}
