import { ntob } from 'number-to-base64'
import Vue from 'vue'
import { randomInt } from '../../helper'
import moment from 'moment'


export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    /**
     * Generate a short ID and unsure it doesn't already exist in the database
     * @param {*} context
     * @returns
     */
    generateUniqueShortId: async (context, { prefix }) => {
      let unique_id = false
      let num_tries = 0
      const max_tries = 10
      while (!unique_id && num_tries < max_tries) {
        num_tries += 1
        const id = generateShortId()
        const id_exists = await idExists(prefix + id)
        if (!id_exists) {
          unique_id = id
        }
      }
      if (unique_id) {
        return unique_id
      } else {
        context.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Unable to create unique ID',
          snackbarColor: 'error'
        })
        Promise.reject(`Unable to create unique ID, tried ${max_tries} times`)
      }
    }
  }
}

/**
 * Return true if id already exists in database, false otherwise
 * @param {*} context
 * @param {String} id
 * @returns
 */
function idExists(id) {
  const db = Vue.prototype.$pouch
  return db
    .get(id)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}

function validateId(id) {
  return id.length == 3 || id.length == 12
}

function daySeconds() {
  return moment().second() + 60 * moment().minute() + 60 * 60 * moment().hour()

}

function daySecondsBase64() {
  return urlSafeBase64(daySeconds(), 4)
}

function isValidDate(date_string) {
  if (!(typeof date_string === 'string' || date_string instanceof String)) {
    return false
  }
  return /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/.test(date_string)
}

const original_encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const new_encoding      = '-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
const encode_mapping = original_encoding.split('').reduce((partial, letter, i) => {
  partial[letter] = new_encoding[i]
  return partial
}, {})

function urlSafeBase64(decimal_number, length) {
  let result = ntob(decimal_number)
  result = result
    .split('')
    .map((character) => {
      return encode_mapping[character]
    })
    .join('')

  return result.padStart(length, '-')
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

function base64Date(date) {
  if (!date || !isValidDate(date)) {
    date = moment(new Date()).format('YYYY-MM-DD')
  }
  const date_number = parseInt(date.split('-').join(''), 10)
  return urlSafeBase64(date_number, 5)
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
    id_encoded = urlSafeBase64(id_int, 4)
  } catch {
    id_encoded = urlSafeString(4)
  }

  return date_encoded + seconds_encoded + id_encoded
}

function generateShortId() {
  return urlSafeString(3)
}

/**
 * 
 * @param {string} a first item to compare
 * @param {string} b second item to compare
 * @returns 
 *  -1 if a <  b
 *   0 if a == b
 *   1 if a >  b 
 */
function compareAscii(a, b) {
  if (typeof(a) !== 'string' || typeof(b) !== 'string') {
    console.error(`compareAscii expected strings but got a: ${typeof(a)}, b: ${typeof(b)}` )
  }
  const length = Math.min(a.length, b.length)
  for(let i = 0; i < length; i++) {
    if (a.charCodeAt(i) < b.charCodeAt(i)) {
      return -1
    } else if (a.charCodeAt(i) > b.charCodeAt(i)) {
      return 1
    }
  }
  return a.length - b.length
}

export { generateId, generateShortId, validateId, base64Date, compareAscii }
