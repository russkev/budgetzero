import { result } from 'lodash'
import { ID_NAME, NONE } from './constants'

// Clean/sanitize amount input
function sanitizeValueInput(value) {
  let amount = value.toString().replace(/[^0-9.-]/g, '') * 100
  return parseInt(amount) / 100
}

function randomInt(min = 0, max = 100) {
  let difference = max + 1 - min
  let rand = Math.random()
  rand = Math.floor(rand * difference)
  return rand + min
}

function randomString(length = 100) {
  const characters = '!@#$%^&*()_+~`|}{[]:;?><,./-=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (var i = 0; i < length; i++) {
    let character = ' '
    if (randomInt(0, 10) != 0) {
      character = characters[randomInt(0, characters.length - 1)]
    }
    result += character
  }
  return result
}

function nextMonth(month_input) {
  const year_month = month_input.split('-')
  let year = parseInt(year_month[0])
  let month = parseInt(year_month[1]) + 1
  if (month > 12) {
    year = year + 1
    month = 1
  }
  return `${year.toString()}-${month.toString().padStart(2, '0')}`
}

function prevMonth(month_input) {
  const year_month = month_input.split('-')
  let year = parseInt(year_month[0])
  let month = parseInt(year_month[1]) - 1
  if (month < 1) {
    year = year - 1
    month = 12
  }
  return `${year.toString()}-${month.toString().padStart(2, '0')}`
}

function extractMonthCategoryMonth(month_category_id) {
  const date_regex = /(?<=\_)[0-9]{4}\-[0-9]{2}(?=\_)/
  const match = month_category_id.match(date_regex)
  if (match) {
    return match[0]
  } else {
    return '0000-01'
  }
}

function logPerformanceTime(name, t1) {
  const t2 = performance.now()
  const seconds = ((t2 - t1) / 1000.0).toFixed(4).toString()
  console.log(`Performance of: ${name} | TIME: ${seconds} seconds`)
}

function docTypeFromId(id) {
  if(id === NONE._id) {
    return ID_NAME.none
  }
  else if (id.startsWith(ID_NAME.budget)) {
    return ID_NAME.budget
  } else {
    const type_regex = /(?<=b_[0-9a-zA-Z_\-\.]{3})_[0-9a-zA-Z\-]+_(?=[0-9a-zA-Z_\-\.]+)/
    const regex_result = id.match(type_regex)
    return regex_result ? regex_result[0] : null
  }
}

function databaseExists(db) {
  return db
    .info()
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}

function documentExists(db, id) {
  return db
    .get(id)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}

/**
 * 
 * @param {string} date 
 * @returns true if date is of format 'YYYY-MM-DD'
 */
function validateDate(date) {
  const pattern = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
  return pattern.test(date)
}

/**
 * 
 * @param {string} month 
 * @returns true if month is of format 'YYYY-MM'
 */
function validateMonth(month) {
  const pattern = /^\d{4}\-(0[1-9]|1[012])$/
  return pattern.test(month)
}



function hslStringToHex(hsl) {
  hsl = hsl.replace('hsl(', '').replace(')', '').split(',')
  const h = parseInt(hsl[0])
  const s = parseInt(hsl[1])
  let l = parseInt(hsl[2])

  return hslToHex(h, s, l)
}

function hslToHex(h, s, l) {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0') // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}



// Convert hex to HSL
function hexToHsl(hex) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0
  if (hex.length == 4) {
    r = '0x' + hex[1] + hex[1]
    g = '0x' + hex[2] + hex[2]
    b = '0x' + hex[3] + hex[3]
  } else if (hex.length == 7) {
    r = '0x' + hex[1] + hex[2]
    g = '0x' + hex[3] + hex[4]
    b = '0x' + hex[5] + hex[6]
  }
  // Then to HSL
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max == min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return `hsl(${h * 360},${s}%,${l}%)`
}

export {
  sanitizeValueInput,
  randomInt,
  randomString,
  logPerformanceTime,
  docTypeFromId,
  nextMonth,
  prevMonth,
  extractMonthCategoryMonth,
  databaseExists,
  documentExists,
  validateDate,
  validateMonth,
  hslStringToHex,
  hslToHex,
  hexToHsl,
}
