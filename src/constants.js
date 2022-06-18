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
  budgetOpened: 'budgetOpened_',
  transaction: '_transaction_',
  category: '_category_',
  monthCategory: '_monthCategory_',
  masterCategory: '_masterCategory_',
  payee: '_payee_'
}

export const DEFAULT_STATE = {
  transactions: [],
  monthCategoryBudgets: [],
  masterCategories: [],
  categories: [],
  payees: [],
  accounts: [],
  budgetRoots: [],
  accountBalances: {},
  budgetBalances: {},
  budgetOpened: null,
  budgetExists: true, // This opens the create budget modal when 'false'
}

export const DEFAULT_BALANCE = {
  cleared: 0,
  uncleared: 0,
  working: 0
}

export const DEFAULT_MONTH_CATEGORY = {
  budget: 0,
  overspending: null,
  hidden: null,
  note: ''
}

export const INITIAL_MONTH_CATEGORIES = [
  {
    _id: null,
    name: 'Uncategorized'
  },
]

export const RESERVED_IDs = 
  INITIAL_MONTH_CATEGORIES.reduce((partial, category) => {
    if (category._id) {
      return partial.concat(category._id.slice(-ID_LENGTH.category))
    } else {
      return partial
    }
  }, [])
