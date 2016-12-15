# AzureFunctions UX

## Getting started

1. Building

 ``` bash
> git clone git@github.com:projectkudu/AzureFunctionsPortal.git
> cd AzureFunctionsPortal
> nuget restore
> msbuild AzureFunctions.sln
> npm install -g angular-cli
> cd AzureFunctions.AngularClient
> npm install
> ng build
 ```

2. Needed environment variables
You'll need to create an AAD web application and set `https://localhost:44300` as a reply URI, then configure the following environment variable.

 ```
AADClientId = <GUID>
AADClientSecret = <string>
 ```

3. Create a new IIS site from `inetmgr` with `https` binding on `44300` that points to `..\\AzureFunctionsPortal\\AzureFunctions` for root path.

4. Create `App_Data\\Templates` folder under `..\\AzureFunctionsPortal\\AzureFunctions` and clone `git@github.com:Azure/azure-webjobs-sdk-templates.git` in there.

5. Run `iisrest` from an elevated cmd.

5. Visit `https://localhost:44300` (note that logins only work with accounts in your AAD tenant used above)

6. **Optional**: You can run `ng build --watch` in `..\\AzureFunctionsPortal\\AzureFunctions.AngularClient` to launch ng builder in watch mode.


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

#### AzureFunctions.sln

**Language**: C#

**Framework**: ASP.NET WebAPI

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