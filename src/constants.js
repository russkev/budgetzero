const SHORT_ID_LENGTH = 3
const LONG_ID_LENGTH = 12
export const DEFAULT_TRANSACTIONS_PER_PAGE = 20

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
  working: 0,
  income: 0,
  expense: 0,
}

export const DEFAULT_MONTH_BALANCE = {
  income: 0,
  expense: 0,
  budgeted: 0,
}

export const DEFAULT_MONTH_CATEGORY = {
  _id: '',
  budget: 0,
  // spent: 0,
  overspending: null,
  hidden: null,
  note: ''
}

export const DEFAULT_CATEGORY_BALANCE = {
  doc: null,
  expense: 0,
  carryover: 0,
  income: 0,
}

export const DEFAULT_MASTER_CATEGORY_BALANCE = {
  budget: 0,
  expense: 0,
  income: 0,
  carryover: 0,
  balance: 0
}

export const NONE = {
  _id: ':::', // ':' Is never used in an id and is URL safe
  name: 'Uncategorized',
  masterCategory: ':::',
  collapsed: false,
  hexColor: '#444444',
}

export const HIDDEN = {
  _id: '::0',
  name: 'Hidden',
  masterCategory: '::0',
  collapsed: true,
}

export const INCOME = {
  _id: ':in',
  name: 'Income',
  masterCategory: ':in',
  collapsed: false,
}

export const DEFAULT_TRANSACTION = {
  account: '',
  category: NONE._id,
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

export const AMOUNT_RED = `error--text text--lighten-3`
export const AMOUNT_GREEN = `success--text text--lighten-3`

export const LOCAL_DB_NAME = 'budgetzero_local_db'