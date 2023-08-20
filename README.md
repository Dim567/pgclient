# README

## About

Simple Linux GUI client for PostgreSQL.

Inspired by [pgAdmin](https://www.pgadmin.org/).

Based on [wails](https://wails.io/).

Made as experiment.

Initial idea was to create desktop app using `golang+react`.


## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

## Issues

1. Can't delete database. Need to decide if this option should be available for user.
2. Inside results window, table is scrollable. Need to make table header sticky, in order to be able to see what data table cell represents.
3. Transactions are not supported.
