import validateSchema from 'json-schema'
import { ID_LENGTH, ID_NAME } from '../constants'

const account_id_length = 'b_'.length + ID_LENGTH.budget + ID_NAME.account.length + ID_LENGTH.account
const schema_account = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minimum: account_id_length,
      maximum: account_id_length
    },
    onBudget: {
      type: 'boolean'
    },
    name: {
      type: 'string'
    },
    sort: {
      type: 'integer'
    },
    closed: {
      type: 'boolean'
    },
    type: {
      type: 'string'
    },
    csvInfo: {
      type: 'object'
    }
  },
  required: ['_id', 'onBudget', 'name', 'sort', 'closed', 'type']
}

const transaction_id_length = 'b_'.length + ID_LENGTH.budget + ID_NAME.transaction.length + ID_LENGTH.transaction
const schema_transaction = {
  type: 'object',
  properties: {
    value: {
      type: 'integer'
    },
    date: {
      type: 'string'
    },
    category: {
      type: ['string', 'null']
    },
    account: {
      type: 'string'
    },
    memo: {
      type: ['string', 'null']
    },
    cleared: {
      type: 'boolean'
    },
    reconciled: {
      type: 'boolean'
    },
    flag: {
      type: 'string'
    },
    payee: {
      type: ['string', 'null']
    },
    transfer: {
      type: ['string', 'null']
    },
    splits: {
      type: ['null', 'array', 'object']
    },
    balance: {
      type: 'integer'
    },
    note: {
      type: ['string', 'null']
    },
    _id: {
      type: 'string',
      minimum: transaction_id_length,
      maximum: transaction_id_length
    }
  },
  required: [
    'value',
    'date',
    'category',
    'account',
    'memo',
    'cleared',
    'reconciled',
    'flag',
    'payee',
    'transfer',
    'splits',
    '_id'
  ]
}

const category_id_length = 'b_'.length + ID_LENGTH.budget + ID_NAME.category.length + ID_LENGTH.category
const schema_category = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: category_id_length,
      maxLength: category_id_length
    },
    sort: {
      type: ['null', 'integer', 'number']
    },
    masterCategory: {
      type: 'string',
      minLength: ID_LENGTH.category,
      maxLength: ID_LENGTH.category
    },
    name: {
      type: 'string'
    },
    hidden: {
      type: ['boolean', 'null']
    }
  },
  required: ['_id', 'sort', 'masterCategory', 'name']
}

const monthCategory_id_length =
  'b_'.length + ID_LENGTH.budget + `${ID_NAME.monthCategory}2000-01_`.length + ID_LENGTH.category
const schema_monthCategory = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: monthCategory_id_length,
      maxLength: monthCategory_id_length
    },
    budget: {
      type: ['null', 'integer']
    },
    spent: {
      type: ['null', 'integer']
    },

    note: {
      type: ['string', 'null']
    }
  },
  required: ['_id', 'budget', 'overspending']
}

const masterCategory_id_length = 'b_'.length + ID_LENGTH.budget + ID_NAME.masterCategory.length + ID_LENGTH.category
const schema_masterCategory = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: masterCategory_id_length,
      maxLength: masterCategory_id_length
    },
    name: {
      type: 'string'
    },
    sort: {
      type: ['integer', 'number']
    },
    collapsed: {
      type: ['boolean', 'null']
    },
    color: {
      type: ['object', 'null']
    }
  },
  required: ['_id', 'name', 'sort', 'collapsed']
}

const payee_id_length = 'b_'.length + ID_LENGTH.budget + ID_NAME.payee.length + ID_LENGTH.payee
const schema_payee = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: payee_id_length,
      maxLength: payee_id_length
    },
    name: {
      type: 'string'
    }
  },
  required: ['_id', 'name']
}

const budget_id_length = ID_NAME.budget.length + ID_LENGTH.budget
const schema_budget = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: budget_id_length,
      maxLength: budget_id_length
    },
    name: {
      type: 'string'
    },
    created: {
      type: 'string'
    },
    accessed: {
      type: 'number'
    },
    currency: {
      type: 'string'
    },
    checkNumber: {
      type: 'boolean'
    }
  },
  required: ['_id', 'name', 'created', 'accessed', 'currency', 'checkNumber']
}

export {
  schema_budget,
  schema_account,
  schema_transaction,
  schema_category,
  schema_monthCategory,
  schema_masterCategory,
  schema_payee,
  validateSchema
}
