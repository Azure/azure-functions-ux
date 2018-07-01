# Azure Functions UX
[![Build Status](https://travis-ci.org/Azure/azure-functions-ux.svg?branch=dev)](https://travis-ci.org/Azure/azure-functions-ux)&emsp;[![Coverage Status](https://coveralls.io/repos/github/Azure/azure-functions-ux/badge.svg?branch=dev)](https://coveralls.io/github/Azure/azure-functions-ux?branch=dev)
## Getting started

1. **Install Prerequisites**
    * [Node 8.*](https://nodejs.org/en/download/)
    * [yarn](https://yarnpkg.com/en/docs/install)

2. **Clone and Build**

 ``` bash
git clone git@github.com:Azure/azure-functions-ux.git
# there is a gulp process to build and run everything
yarn install
yarn run gulp run-dev
 ```
3. **Allow SSL Connections**
Go to `https://localhost:44300` and proceed to website in advanced section

4. Visit `https://portal.azure.com?websitesextension_ext=appsvc.env=local` and load up Function Apps from browse

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

For control and styling samples go to [https://functions.azure.com?appsvc.devguide=true](https://functions.azure.com?appsvc.devguide=true)

[Angular 2 coding style](https://angular.io/styleguide)

## Code layout

The API surface is very limited:

``` bash
# resource apis
api/resources
api/templates
api/bindingconfig

# health pings by traffic manager and monitoring
api/health
```

#### AzureFunctions.Client

**Language**: TypeScript

**Framework**: angular2

Check out https://angular.io
