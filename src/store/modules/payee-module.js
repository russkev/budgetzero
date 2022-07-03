
const DEFAULT_PAYEES_STATE = {
  payees: []
}

export default {
  state: {
    ...DEFAULT_PAYEES_STATE
  },
  getters: {
    payees: (state) => {
      return [
        {
          id: null,
          name: 'Payee not selected.'
        }
      ].concat(state.payees)
    }
    // payee_map: (state, getters) => {
    //   let payees = getters.payees.reduce((map, obj) => {
    //     const id = obj._id ? obj._id.slice(-ID_LENGTH.payee) : null
    //     map[id] = obj.name
    //     return map
    //   }, {})
    //   payees['---------------------initial-balance'] = 'Initial Balance'
    //   return payees
    // },
    // payee_array: (state, getters) =>
    //   getters.payees.map((obj) => {
    //     const rObj = {}
    //     rObj.id = obj.id ? obj.id.slice(-ID_LENGTH.payee) : null
    //     rObj.name = obj.name
    //     return rObj
    //   }),
    // payee_names: (state, getters) => getters.payees.map((obj) => obj.name)
  },
  mutations: {
    SET_PAYEES(state, payees) {
      state.payees = payees
    },
    RESET_PAYEES_STATE(state) {
      Object.entries(DEFAULT_PAYEES_STATE).forEach(([key, value]) => {
        state[key] = value
      })
    },
  },
  actions: {
    /**
     * Create payee doc.
     * This should only be called from getPayeeID() action.
     * @param {*} context
     * @param {String} payload Plaintext payee name
     * @returns
     */
    createPayee(context, payload) {
      var payee = {
        _id: `b_${context.rootState.selectedBudgetId}${ID_NAME.payee}${this._vm.generateId()}`,
        name: payload
      }

      return context.dispatch('commitDocToPouchAndVuex', { current: payee, previous: null })
    },

    /**
     * Returns the payee UUID for any payee name. Dispatches action to create the payee if it doesn't exist yet.
     * @param {*} context
     * @param {String} payload Plaintext payee name. e.g. 'Grocery Store'
     * @returns Payee UUID
     */
    async getPayeeID(context, payload) {
      //First, check if this payee has already been created
      const payeeLookup = Object.keys(context.getters.payee_map).find(
        (key) => context.getters.payee_map[key] === payload
      )

      if (payeeLookup) {
        return payeeLookup
      } else if (this._vm.validateId(`${payload}`)) {
        // If the payload is already UUID then return.
        return payload
      } else if (payload === '---------------------initial-balance') {
        //If it's initial balance then return
        return payload
      } else if (typeof payload === 'undefined' || payload === null || payload === '') {
        // If payload is an object, then it's an existing payee. Otherwise we need to create the payee.
        return null
      } else if (typeof payload != 'string') {
        return payload.id
      } else {
        // Payload is a string. Need to create payee to get an uuid
        let payee = await context.dispatch('createPayee', payload)
        return payee.id.slice(-ID_LENGTH.payee)
      }
    }
  }
}