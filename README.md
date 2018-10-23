# Azure Functions UX

## Getting started

1. **Install Prerequisites**

   - [Node 8.\*](https://nodejs.org/en/download/)
   - [yarn](https://yarnpkg.com/en/docs/install)

2. **Clone and Build Angular App with Server**

```bash
git clone git@github.com:Azure/azure-functions-ux.git
# there is a gulp process to build and run everything
yarn install
yarn run gulp run-dev
```

3. **Alternitive: Run React app**

```bash
git clone git@github.com:Azure/azure-functions-ux.git
# there is a gulp process to build and run everything
cd client-react
yarn start
```

4. **Allow SSL Connections**
   Go to `https://localhost:44300` and proceed to website in advanced section

5. Visit `https://portal.azure.com?websitesextension_ext=appsvc.env=local` and load up Function Apps from browse

## Code and branches

#### Branches

**master**: (https://functions-staging.azure.com)

> This is connected to staging. After all scenarios are validated on staging we swap by running the following gulp command from the root of the project

```bash
gulp swap-production-slots
```

**dev**: (https://functions-next.azure.com)

> This is the next environment. This is never swapped, instead changes from dev get merged into master.

For control and styling samples go to [https://functions.azure.com?appsvc.devguide=true](https://functions.azure.com?appsvc.devguide=true)

[Angular 2 coding style](https://angular.io/styleguide)

## Code layout

The API surface is very limited:

```bash
# resource apis
api/resources
api/templates
api/bindingconfig

# health pings by traffic manager and monitoring
api/health
```

#### AzureFunctions.Client

**Language**: TypeScript

**Framework**: angular2, react

Check out https://angular.io and https://reactjs.org/
