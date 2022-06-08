const SHORT_ID_LENGTH = 3
const LONG_ID_LENGTH = 12

export const ID_LENGTH = {
  budget: SHORT_ID_LENGTH,
  account: SHORT_ID_LENGTH,
  category: SHORT_ID_LENGTH,
  payee: LONG_ID_LENGTH,
  transaction: LONG_ID_LENGTH,
}

export const DEFAULT_STATE = {
  transactions: [],
  monthCategoryBudgets: [],
  masterCategories: [],
  categories: [],
  payees: [],
  accounts: [],
  budgetRoots: [],
  budgetOpened: null,
  budgetExists: true, // This opens the create budget modal when 'false'
  remoteSyncURL: null,
  syncHandle: null
}