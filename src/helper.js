import { result } from 'lodash'
import { ID_NAME } from './constants'

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
  console.log(`PERFORMANCE OF: ${name} | TIME: ${seconds} seconds`)
}

function docTypeFromId(id) {
  // const docType = null
  if (id.startsWith(ID_NAME.budget)) {
    return ID_NAME.budget
  } else if (id.startsWith(ID_NAME.budgetOpened)) {
    return ID_NAME.budgetOpened
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
}
