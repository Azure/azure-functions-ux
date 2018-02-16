Travis CI [![Travis CI](https://travis-ci.org/AzureAppService/azure-functions-ux.svg?branch=dev)](https://travis-ci.org/AzureAppService/azure-functions-ux)

# Azure Functions UX

## Getting started

1. **Install Prerequisites**
    * [Node 6.*](https://nodejs.org/en/download/)
    * [yarn](https://yarnpkg.com/en/docs/install)
    * A text editor. [vscode](https://code.visualstudio.com/)

2. **Environment Prerequisites**
    * `AADClientId` **Required**
    * `AADClientSecret` **Required**

You'll need to create an AAD web application and set `https://localhost:44300` as a reply URI, then configure the following environment variable.

3. **Clone and Build**

 ``` bash
git clone git@github.com:Azure/azure-functions-ux.git
# there are 2 places to restore packages in
cd azure-functions-ux/server
yarn install
yarn run gulp build-all
cd ../AzureFunctions.AngularClient
yarn install
 ```

to run the server

```bash
cd server
yarn run watch
```

this will launch the server watching the files for any changes and will trigger a rebuild. To run the client in the same way

```bash
cd AzureFunctions.AngularClient
yarn run watch
```

you have to do this at least once (or `yarn run build`) for the page to load.

to run both you can do

```bash
# on unix
./run.sh

# on Windows

# from cmd
run.cmd

# or from powershell
.\run.ps1

# of from bash
./run.sh
```

4. Visit `https://localhost:44300`

## Code and branches

#### Branches
**master**: (https://functions-staging.azure.com)
> This is connected to staging. After all scenarios are validated on staging we swap by running  tools\SwapWithStagingSlots.ps1

**dev**: (https://functions-next.azure.com)
> This is the next environment. This is never swapped, instead changes from dev get merged into master.

#### Development workflow

``` bash
# make sure you're working on the dev branch
> git checkout dev

# create your own personal branch based on dev
> git checkout -b ahmels-work

# make all your changes in your branch
# commit and push these changes to github
> git push origin ahmels-work -u

# open a pull request.
# once everything is good, merge, rebase and push
> git checkout dev
> git merge ahmels-work
> git pull --rebase

# fix any conflicts
> git push origin dev
```

[Angular 2 coding style](https://angular.io/styleguide)

## Code layout

The API surface is very limited:

``` bash
# used while in Azure Portal
api/templates
api/bindingconfig

# Used before user gets to Azure Portal
api/tenants
api/switchtenants
api/token

# health pings by traffic manager and monitoring
api/health
```

#### Authentication

This is a bit of a complicated subject:

**For external sites** (i.e: https://functions.azure.com, https://functions-staging.azure.com, https://functions-next.azure.com) authentication is done on the frontEnd and we get the token passed to us. Logic to handle that is in \Authentication\FrontEndAuthProvider.cs

**For local development** (i.e: https://localhost:44300) authentication is handled by the app itself, code in \Authentication\LocalhostAuthProvider.cs

**When in Azure Portal** authentication is always handled by Azure Portal itself and we just get the token.

#### AzureFunctions.Client

**Language**: TypeScript

**Framework**: angular2

Check out https://angular.io
