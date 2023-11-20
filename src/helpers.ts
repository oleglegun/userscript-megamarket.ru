const DATA_KEY_ADJUSTED_PRICE = "adjustedPrice"

export function log(level: "info" | "error", message: string) {
  console.log(`/*-------------------------- PRICE ADJUSTER -----------------------------------*/\n${level.toUpperCase()} MESSAGE
  \n${message}`)
}

const Colors: Color[] = [
  { bg: "#00FF22", fg: "black", border: "black" },
  { bg: "#00FF22", fg: "black", border: "transparent" },
  { bg: "#00b621", fg: "white", border: "transparent" },
  { bg: "#f4f44f", fg: "black", border: "transparent" },
  { bg: "#eba000", fg: "white", border: "transparent" },
  { bg: "#AB3131", fg: "white", border: "transparent" },
  { bg: "#540202", fg: "white", border: "transparent" },
]

export function parsePrice(priceString: string) {
  const extractedPrice = /^[\d\s]+/.exec(priceString.replace(/\s/g, ""))?.[0].trim()

  if (extractedPrice === undefined) {
    return null
  }

  return parseInt(extractedPrice)
}

export function calcAdjustedPrice(priceObj: PriceObject) {
  if (priceObj.price) {
    return priceObj.price - (priceObj.bonusAmount || 0)
  } else {
    return null
  }
}

export function getColorByBonusAmountPercentage(percentage: number): Color {
  if (percentage > 60) {
    return { fg: "white", bg: "#b222ff", border: "black" }
    // return Colors[0]
  } else if (percentage > 50) {
    return Colors[0]
  } else if (percentage === 0) {
    return { bg: "#cccccc", fg: "black", border: "transparent" }
  }

  const colors = Colors.slice(1)

  return colors[Math.floor(colors.length - (percentage / 50) * colors.length)]
}

export function getColorAndPositionForAPrice(price: number, sortedPriceList: number[]) {
  const minPrice = sortedPriceList[0]
  const maxPrice = sortedPriceList[sortedPriceList.length - 1]

  const priceIdx = sortedPriceList.findIndex((sortedPrice) => sortedPrice === price)

  const colorIdx = Math.floor(
    (((price - minPrice) / (maxPrice - minPrice) + priceIdx / sortedPriceList.length) / 2) * Colors.length
  )

  const color =
    sortedPriceList.length === 1 ? Colors[0] : Colors[colorIdx < Colors.length ? colorIdx : Colors.length - 1]

  return { color, position: priceIdx + 1 }
}

export function generateUniqueSortedAdjustedPriceList(priceObjList: PriceObject[]) {
  const sortedPriceList = priceObjList
    .map((priceObj) => calcAdjustedPrice(priceObj))
    .filter((price): price is Exclude<typeof price, null> => price !== null)
    .sort((a, b) => a - b)

  return [...new Set(sortedPriceList)]
}

export function renderAdjustedPriceHTMLString(adjustedPrice: number, color: Color) {
  return `<span style="color:${color.fg};background-color:${color.bg};border: 1px solid ${
    color.border
  };padding: 0px 10px;">${adjustedPrice.toLocaleString("ru-RU", {
    useGrouping: true,
  })}<span>`
}

export function renderPositionHTMLString(position: number): string {
  return `<span style="color: #5d3a8e;outline: 1px solid #5d3a8e;padding: 0px 16px;">${position}</span> `
}

export function getPriceObjList(priceContainerNodeSelector: string, priceNodeSelector: string): PriceObject[] {
  let priceObjList: PriceObject[] = []

  const priceContainerElList = document.querySelectorAll(priceContainerNodeSelector)

  for (let priceContainerEl of priceContainerElList) {
    if (priceContainerEl instanceof HTMLElement && !priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE]) {
      const priceNodeEl = priceContainerEl.querySelector(priceNodeSelector)

      if (!priceNodeEl || !(priceNodeEl instanceof HTMLElement)) {
        console.log(priceContainerEl, priceNodeEl)
        log(
          "error",
          `"PriceNode" element (selector: "${priceNodeSelector}") is not found inside "PriceContainer" element (selector: "${priceContainerNodeSelector}").`
        )

        priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE] = "1"
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

    if (!bonusPriceEl || !bonusPriceEl.textContent) {
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

    const totalPriceEl = document.createElement("span")

    totalPriceEl.innerHTML = renderAdjustedPriceHTMLString(adjustedPrice, color)

    priceObj.priceEl.prepend(totalPriceEl)

    priceObj.priceContainerEl.dataset[DATA_KEY_ADJUSTED_PRICE] = "1"
  })
}
