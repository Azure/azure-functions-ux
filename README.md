# AzureFunctions UX

## Getting started

1. Install Prerequisites
    * Visual Studio
    * Nuget Package Manager and Nuget Client
    * Git
    * Node.js
    * npm
    * IIS
    * URL Rewrite

2. Clone and Build

> :: if using git bash
> git clone git@github.com:projectkudu/AzureFunctionsPortal.git
> :: if using cmd
> git clone https://github.com/projectkudu/AzureFunctionsPortal

 ``` bash
> cd AzureFunctionsPortal
> nuget restore
> msbuild AzureFunctions\AzureFunctions.csproj
> npm install -g @angular/cli
> npm install -g yarn
> cd AzureFunctions.AngularClient
> yarn install
> ng build --watch
 ```

3. Needed environment variables
You'll need to create an AAD web application and set `https://localhost:44300` as a reply URI, then configure the following environment variable.

 ```
AADClientId = <GUID>
AADClientSecret = <string>
aiInstrumentationKey = <GUID> (optional to track AppInsights events)
 ```

4. Create a new IIS site from `inetmgr` with `https` binding on `44300` that points to `..\\AzureFunctionsPortal\\AzureFunctions` for root path.

5. Clone the templates repo to a temporary location from [https://github.com/Azure/azure-webjobs-sdk-templates](https://github.com/Azure/azure-webjobs-sdk-templates)

6. Generate the templates for portal through the steps mentioned at [https://github.com/Azure/azure-webjobs-sdk-templates/#generate-templates-for-portal](https://github.com/Azure/azure-webjobs-sdk-templates/#generate-templates-for-portal)

7. Create `app_data\\templates\\default` folder under `..\\AzureFunctionsPortal\\AzureFunctions`
 
8. Copy the template build output to the default folder

9. You may need to run `%windir%\system32\inetsrv\appcmd unlock config -section:system.webServer/serverRuntime` from an elevated cmd window.

10 Run `iisreset` from an elevated cmd.

11. Visit `https://localhost:44300` (note that logins only work with accounts in your AAD tenant used above)

12. **Optional**: You can run `ng build --watch` in `..\\AzureFunctionsPortal\\AzureFunctions.AngularClient` to launch ng builder in watch mode.


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