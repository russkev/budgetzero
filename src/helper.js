import { result } from 'lodash'
import { ntob } from 'number-to-base64'
import { ID_NAME } from './constants'

// Clean/sanitize amount input
function sanitizeValueInput(value) {
  let amt = value.toString().replace(/[^0-9.-]/g, '') * 100
  return parseInt(amt) / 100
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

function daySeconds() {
  const date = new Date()
  return date.getSeconds() + 60 * date.getMinutes() + 60 * 60 * date.getHours()
}

function daySecondsBase64() {
  let day_seconds_64 = urlSafeBase64(daySeconds())
  while (day_seconds_64.length < 4) {
    day_seconds_64 += urlSafeCharacter()
  }
  return day_seconds_64
}

const original_encoding = 'ABCDEFGHIJKLMNOPQRSTUVWQYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const new_encoding = '-.0123456789ABCDEFGHIJKLMNOPQRSTUVWQYZ_abcdefghijklmnopqrstuvwxyz'
const encode_mapping = original_encoding.split('').reduce((partial, letter, i) => {
  partial[letter] = new_encoding[i]
  return partial
}, {})

function urlSafeBase64(decimal_number, length = null) {
  let result = ntob(decimal_number)

  result = result
    .split('')
    .map((character) => {
      return encode_mapping[character]
    })
    .join('')

  if (length) {
    while (result.length < length) {
      result += urlSafeCharacter()
    }
    return result.slice(0, length)
  }
  return result
}

function urlSafeCharacter() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_.'
  return characters[randomInt(0, characters.length - 1)]
}

function urlSafeString(length) {
  let result = ''
  while (result.length < length) {
    result += urlSafeCharacter()
  }
  return result
}

function isValidDate(date_string) {
  if (!(typeof date_string === 'string' || date_string instanceof String)) {
    return false
  }
  return /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/.test(date_string)
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

function getMonthCategoryDate(month_category_id) {
  const date_regex = /(?<=\_)[0-9]{4}\-[0-9]{2}(?=\_)/
  const match = month_category_id.match(date_regex)
  if (match) {
    return match[0]
  } else {
    return '0000-00'
  }
}

function base64Date(date) {
  if (!date || !isValidDate(date)) {
    date = new Date().toISOString().split('T')[0]
  }
  const date_number = parseInt(date.split('-').join(''), 10)
  return urlSafeBase64(date_number).padStart(4, '-')
}
/**
 * Creates a ID of 12 characters encoded in base 64:
 *   1 -  4: Year month day
 *   5 -  8: Number of seconds so far in the day
 *   9 - 12: Random string / transaction ID
 *   Note: A base 64 character string of length 4 has over
 *   16 million combinations.
 *
 * @param {string} date In YYYY-MM-DD
 * @returns 12 Character string
 */
function generateId(date = null, transaction_id = null) {
  const date_encoded = base64Date(date)
  const seconds_encoded = daySecondsBase64()

  let id_encoded = ''
  try {
    id_int = parseInt(transaction_id)
    id_encoded = urlSafeBase64(id_int)
  } catch {
    id_encoded = urlSafeString(4)
  }

  return date_encoded + seconds_encoded + id_encoded
}

function generateShortId() {
  return urlSafeString(3)
}

function validateId(id) {
  return id.length == 3 || id.length == 12
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

export {
  sanitizeValueInput,
  randomInt,
  randomString,
  generateId,
  generateShortId,
  validateId,
  logPerformanceTime,
  docTypeFromId,
  nextMonth,
  prevMonth,
  getMonthCategoryDate,
  databaseExists,
  documentExists,
  base64Date,
}
