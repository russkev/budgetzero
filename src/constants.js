const SHORT_ID_LENGTH = 3
const LONG_ID_LENGTH = 12

export const ID_LENGTH = {
  budget: SHORT_ID_LENGTH,
  account: SHORT_ID_LENGTH,
  monthCategory: SHORT_ID_LENGTH,
  category: SHORT_ID_LENGTH,
  payee: LONG_ID_LENGTH,
  transaction: LONG_ID_LENGTH,
  base64Date: 4,
}

export const ID_NAME = {
  account: '_account_',
  budget: 'budget_',
  transaction: '_transaction_',
  category: '_category_',
  monthCategory: '_monthCategory_',
  masterCategory: '_masterCategory_',
  payee: '_payee_',
  none: 'none',
}

export const DEFAULT_ACCOUNT_BALANCE = {
  cleared: 0,
  uncleared: 0,
  working: 0
}

export const DEFAULT_MONTH_CATEGORY = {
  _id: '',
  budget: 0,
  spent: 0,
  overspending: null,
  hidden: null,
  note: ''
}

export const NONE = {
  _id: '~~~', // '~' Is never used in an id and is URL safe
  name: 'Uncategorized',
  masterCategory: '~~~',
}

export const DEFAULT_TRANSACTION = {
  account: '',
  category: null,
  cleared: true,
  approved: true,
  value: 0,
  date: '2000-01-01',
  memo: '',
  reconciled: false,
  flag: '#ffffff',
  payee: null,
  transfer: null,
  splits: [],
  _id: '',
  _rev: ''
}