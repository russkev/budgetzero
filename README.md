# <a href="https://app.budgetzero.io"><p align="center"><img src="public/logo.png" width="300"></p>

[![Netlify Status](https://api.netlify.com/api/v1/badges/46f53248-fffd-4af5-ac02-84c3b16049de/deploy-status)](https://app.netlify.com/sites/frabjous-pithivier-23dcc3/deploys)

This is fork of [Budget Zero](https://github.com/budgetzero/budgetzero)

budgetzero is a free, open-source, privacy-friendly, offline-first budgeting system.

Use at https://frabjous-pithivier-23dcc3.netlify.app/

:warning: budgetzero is under active development and considered an alpha version. You may encounter significant bugs and breaking changes. Feel free to file an issue! :warning:

# Features

:heavy_check_mark: Zero-based 'envelope' budgeting  
:heavy_check_mark: Offline-first storage. NOTE: All data is stored in the browser and may be lost if you clear the browser's data.  
:heavy_check_mark: Import Transactions (OFX, QFX, CSV)  
:heavy_check_mark: Carry negative balances into next month  
:heavy_check_mark: Privacy-focused. Zero trackers & zero analytics.

# To run local server:

```
npm run dev
```

# To run Cypress integration tests:

This application makes extensive use of end to end testing.

In run the tests, you need a local server for the application as well as a temporary CouchDB server for the database.

### Run local development server

```
npm run dev
```

### Run local CouchDB

```
npm run tempdb
```

### Open the Cypress UI

```
npx cypress open
```
