import { ID_LENGTH, NONE } from "../../constants"

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
    },
    payeesById: (state) => {
      return state.payees.reduce((partial, payee) => {
        const id = obj._id.slice(-ID_LENGTH.payee)
        partial[id] = payee
        return partial
      }, {})
    },
    payeesByName: (state) => {
      return state.payees.reduce((partial, payee) => {
        partial[payee.name] = payee
        return partial
      }, {})
    },
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
      const no_payee = [{
        id: NONE._id,
        name: 'Payee not selected'
      }]
      state.payees = no_payee.concat(payees)
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
     * @param {String} payee_id Plaintext payee name. e.g. 'Grocery Store'
     * @returns Payee UUID
     */
    async getPayeeID(context, payee_id) {
      if (payee_id === null) {
        payee_id = NONE._id
      }
      console.log("getPayeeID")
      console.log(payee_id)
      //First, check if this payee has already been created
      const payeeLookup = Object.keys(context.getters.payeesById).find(
        (key) => context.getters.payeesById[key] === payee_id
      )

      if (payeeLookup) {
        return payeeLookup
      } else if (this._vm.validateId(`${payee_id}`)) {
        // If the payload is already UUID then return.
        return payee_id
      } else if (payee_id === '---------------------initial-balance') {
        //If it's initial balance then return
        return payee_id
      } else if (typeof payee_id === 'undefined' || payee_id === null || payee_id === '') {
        // If payload is an object, then it's an existing payee. Otherwise we need to create the payee.
        return null
      } else if (typeof payee_id != 'string') {
        return payee_id.id
      } else {
        // Payload is a string. Need to create payee to get an uuid
        let payee = await context.dispatch('createPayee', payee_id)
        return payee.id.slice(-ID_LENGTH.payee)
      }
    }
  }
}