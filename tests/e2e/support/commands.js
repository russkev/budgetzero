import PouchDB from 'pouchdb'
import mock_budget from '../../__mockdata__/mock_budget_3.json'
import { LOCAL_DB_NAME } from '../../../src/constants'
import '@4tw/cypress-drag-drop'
// import { rmdirSync } from 'fs'
// import 'fs'
// const fs = require('fs')
// const path = require('path')

const db_data = mock_budget.rows
  .map((row) => {
    delete row.doc._rev
    return row.doc
  })
  .filter((row) => {
    return row._id[0] == 'b'
  })

Cypress.Commands.add('initPath', (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.bulkDocs(db_data)
    return
  })
})

Cypress.Commands.add('initPathEmpty', (path) => {
  cy.visit(`http://localhost:8082/${path}`)
  cy.on('window:before:load', async () => {
    let pouch = new PouchDB(LOCAL_DB_NAME)
    await pouch.destroy()
    pouch = new PouchDB(LOCAL_DB_NAME)
    return
  })
})

// Cypress.Commands.add('deleteDownloadsFolder', () => {
//   const folderName = Cypress.config('downloadsFolder')
//   console.log('Deleting folder %s', folderName)
//   fs.readdir(folderName, (err, files) => {
//     console.log('files', files)
//   })
//   // return new Promise((resolve, reject) => {
//   //   rmdirSync(folderName, { maxRetries: 10, recursive: true }, (err) => {
//   //     if (err) {
//   //       console.log(err)
//   //       return reject(err)
//   //     }
//   //     resolve(null)
//   //   })
//   // })
// })
