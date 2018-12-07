# Azure Functions UX

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

- [Node 8.\*](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/en/docs/install)
- Angular CLI

```
npm i -g @angular/cli
```

### Project Structure and Important Places

```
root
│   gulpfile.js - gulp file that gives commands to run most things
│
└───client
│   │   this is the angular client code
│   │
│   └───src
│       │   this is where the non scaffolding angular app code live
│
└───server
│   │   basic server written in nodeJs
│   └───Resources
│   │   │ Resources.Resx is the file we keep all strings, these will get localized and be available in the app by key value
│   │
│   └───src
│       │ server.ts - server entry point
│
└───client-react
│   │   react app
│
└───tests
│   │   E2E tests for the react app writen with cypress
```

### Branches

**master**: (https://functions-staging.azure.com)

> This is connected to staging. After all scenarios are validated on staging we swap by running the following gulp command from the root of the project

```bash
gulp swap-production-slots
```

**dev**: (https://functions-next.azure.com) Make Pull Requests against this branch

> This is the next environment. This is never swapped, instead changes from dev get merged into master.

For control and styling samples go to [https://functions.azure.com?appsvc.devguide=true](https://functions.azure.com?appsvc.devguide=true)

### Installing

A step by step series of examples that tell you how to get a development env running

#### Angular Application

from root

```
yarn install
gulp run-dev
```

To Test changes go to https://portal.azure.com/?websitesextension_functionslocal=true

#### react application

```
cd client-react
yarn start
```

#### server only

from root

```
yarn install
gulp run-server
```

## Running the tests

### Angular Unit Tests

```
cd client
ng test
```

### React Unit Tests

````
cd client-react
yarn test
```w

### React E2E Tests

single run
````

cd client-react
yarn build
cd ../tests
yarn test:run

```
development mode
```

cd client-react
yarn start

```
plus in another terminal
```

cd tests
npx cypress open

```w
## License

This project is licensed under the APACHE 2.0 License - see the [LICENSE.md](LICENSE.md) file for details
```
