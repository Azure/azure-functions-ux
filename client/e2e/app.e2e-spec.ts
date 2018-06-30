import { AzureFunctionsClientPage } from './app.po';

describe('azure-functions-client App', function() {
  let page: AzureFunctionsClientPage;

  beforeEach(() => {
    page = new AzureFunctionsClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
