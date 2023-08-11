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
  base64Date: 4
}

export const ID_NAME = {
  account: '_account_',
  budget: 'budget_',
  transaction: '_transaction_',
  category: '_category_',
  monthCategory: '_monthCategory_',
  masterCategory: '_masterCategory_',
  payee: '_payee_',
  none: 'none'
}

export const DEFAULT_ACCOUNT_BALANCE = {
  cleared: 0,
  uncleared: 0,
  working: 0,
  income: 0,
  expense: 0
}

export const DEFAULT_MONTH_BALANCE = {
  income: 0,
  expense: 0,
  budgeted: 0
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
  income: 0
}

export const DEFAULT_MASTER_CATEGORY_BALANCE = {
  budget: 0,
  expense: 0,
  income: 0,
  carryover: 0,
  balance: 0
}

export const DEFAULT_CSV_INFO = {
  useHeaders: true,
  useSeparateDebits: false,
  headerColumns: {
    date: 0,
    memo: 1,
    credit: 2,
    debit: 3
  },
  dateFormat: 'D/M/YYYY'
}

export const SYNC_STATE = {
  SYNCING: { color: 'success lighten-3', icon: 'mdi-sync', text: 'Syncing...' },
  SYNCED: { color: 'success', icon: 'mdi-check', text: 'Synced' },
  ERROR: { color: 'error', icon: 'mdi-alert-circle', text: 'Sync Error' },
  NOT_CONNECTED: { color: 'info', icon: 'mdi-cancel', text: 'Disconnected' },
  CONNECTING: { color: 'warning', icon: 'mdi-connection', text: 'Connecting...' },
  PAUSED: { color: 'info', icon: 'mdi-pause', text: 'Paused' }
}

export const NONE = {
  _id: ':::', // ':' Is never used in an id and is URL safe
  name: 'Uncategorized',
  masterCategory: ':::',
  collapsed: false,
  hexColor: '#444444'
}

export const HIDDEN = {
  _id: '::0',
  name: 'Hidden',
  masterCategory: '::0',
  collapsed: true
}

export const INCOME = {
  _id: ':in',
  name: 'Income',
  masterCategory: ':in',
  collapsed: false
}

export const DEFAULT_TRANSACTION = {
  account: '',
  category: NONE._id,
  cleared: true,
  approved: true,
  value: 0,
  date: '2000-01-01',
  memo: '',
  note: '',
  reconciled: false,
  flag: '#ffffff',
  payee: null,
  transfer: null,
  splits: [],
  _id: '',
  _rev: ''
}
export const ACCOUNT_TYPES = ['CHECKING', 'CREDIT', 'SAVING', 'MORTGAGE', 'CASH', 'INVESTMENT', 'OTHER']

export const DEFAULT_ACCOUNT = {
  type: ACCOUNT_TYPES[2],
  checkNumber: true,
  closed: false,
  name: '',
  note: null,
  sort: 0,
  onBudget: true,
  sign: 1,
  initialBalance: 0
}

export const AMOUNT_RED = `error--text text--lighten-3`
export const AMOUNT_RED_ON_LIGHT = `error--text text--darken-3`
export const AMOUNT_GREEN = `success--text text--lighten-3`
export const AMOUNT_GREEN_ON_LIGHT = `success--text text--darken-3`
export const AMOUNT_BLACK = `background--text`

export const LOCAL_DB_NAME = 'budgetzero_local_db'
