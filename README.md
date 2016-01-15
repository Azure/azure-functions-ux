## AzureFunctions.Client

```
cd AzureFunctions.Client
npm install
npm start
```

In `boot.ts` change between `FunctionsService` and `MockFunctionsService` for back end testing vs UI testing.
**Note:** While using `MockFunctionsService` the site is read only because there is no real API backend to persist changes.