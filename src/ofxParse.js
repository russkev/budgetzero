import _ from 'lodash'

function getAccountId(ofx_object) {
  return getOfxData(ofx_object, ['STMTRS.BANKACCTFROM.ACCTID', 'TRNUID'], 1)
}

function getAccountType(ofx_object) {
  return getOfxData(ofx_object, ['STMTRS.BANKACCTFROM.ACCTTYPE'], 'SAVINGS')
}

function getAccountBankId(ofx_object) {
  return getOfxData(ofx_object, ['STMTRS.BANKACCTFROM.BANKID'], 1)
}

function getAccountTransactions(ofx_object) {
  return getOfxData(ofx_object, ['STMTRS.BANKTRANLIST.STMTTRN'], {})
}

function getDate(date_string) {
  if (!date_string || date_string.length < 8) {
    return ''
  }
  const separator = '-'
  return (
    `${date_string.substring(0, 4)}${separator}` +
    `${date_string.substring(4, 6)}${separator}` +
    `${date_string.substring(6, 8)}`
  )
}

function getOfxData(ofx_object, possible_locations, default_value) {
  let result = null
  possible_locations.forEach((possibleLocation) => {
    let possible_result = _.get(ofx_object, possibleLocation, null)
    if (possible_result !== null) {
      result = possible_result
      return
    }
  })
  return result ? result : default_value
}

export { getAccountId, getAccountType, getAccountBankId, getAccountTransactions, getDate, getOfxData }
