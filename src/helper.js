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

function generateId(date = null) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (!date) {
    date = new Date().toISOString().split('T')[0];
  }
  const date_number = parseInt(date.split('-').join(''), 10)
  let date_encoded = ntob(date_number)
  date_encoded = date_encoded.replaceAll('+', '_')
  date_encoded = date_encoded.replaceAll('/', '-')
  date_encoded = date_encoded.replaceAll('=', '.')
  return date_encoded

}

export { sanitizeValueInput, randomInt, randomString, generateId }
