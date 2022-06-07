import { result } from 'lodash'
import { ntob } from 'number-to-base64'

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

function urlSafeBase64(decimal_number, length = null) {
  let result = ntob(decimal_number)
  result = result.replaceAll('+', '_')
  result = result.replaceAll('/', '-')
  result = result.replaceAll('=', '.')

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
  if (!date || !isValidDate(date)) {
    date = new Date().toISOString().split('T')[0]
  }
  const date_number = parseInt(date.split('-').join(''), 10)
  const date_encoded = urlSafeBase64(date_number, 4)

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

export { sanitizeValueInput, randomInt, randomString, generateId, generateShortId, validateId }
