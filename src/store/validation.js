var Validator = require('jsonschema').Validator
var validateSchema = new Validator()
var ID_LENGTH = require('../constants').ID_LENGTH

const schema_account = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'user name'
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
    }
  },
  required: ['_id', 'onBudget', 'name', 'sort', 'closed', 'type']
}

const transaction_id_length = 'b_'.length + ID_LENGTH.budget + '_transaction_'.length + ID_LENGTH.transaction
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

const category_id_length = 'b_'.length + ID_LENGTH.budget + '_category_'.length + ID_LENGTH.category
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
    }
  },
  required: ['_id', 'sort', 'masterCategory', 'name']
}

const m_category_id_length = 'b_'.length + ID_LENGTH.budget + '_m_category_'.length + ID_LENGTH.category
const schema_m_category = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: m_category_id_length,
      maxLength: m_category_id_length
    },
    budget: {
      type: ['null', 'integer']
    },
    overspending: {
      type: ['boolean', 'null']
    },
    hidden: {
      type: ['boolean', 'null']
    }
  },
  required: ['_id', 'budget', 'overspending']
}

const masterCategory_id_length = 'b_'.length + ID_LENGTH.budget + '_master-category_'.length + ID_LENGTH.category
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
    hidden: {
      type: ['boolean', 'null']
    }
  },
  required: ['_id', 'name', 'sort', 'collapsed']
}

const payee_id_length = 'b_'.length + ID_LENGTH.budget + '_payee_'.length + ID_LENGTH.payee
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

const budget_id_length = 'budget_'.length + ID_LENGTH.budget
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
    currency: {
      type: 'string'
    },
    checkNumber: {
      type: 'boolean'
    }
  },
  required: ['_id', 'name', 'created', 'currency', 'checkNumber']
}

const budget_opened_id_length = 'budget_opened_'.length + ID_LENGTH.budget
const schema_budget_opened = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      minLength: budget_opened_id_length,
      maxLength: budget_opened_id_length
    },
    opened: {
      type: 'string'
    }
  },
  required: ['_id', 'opened']
}

export {
  schema_budget,
  schema_budget_opened,
  schema_account,
  schema_transaction,
  schema_category,
  schema_m_category,
  schema_masterCategory,
  schema_payee,
  validateSchema
}
