import { Code, Examples } from './Example.types';

const code: Record<string, Examples<Code>> = {
  csharp: {
    output: {
      defaultLanguage: 'csharp',
      defaultValue: `#r "Newtonsoft.Json" 
    
using System.Net; 
using Microsoft.AspNetCore.Mvc; 
using Microsoft.Extensions.Primitives; 
using Newtonsoft.Json; 
    
public static async Task<IActionResult> Run(HttpRequest req, ILogger log, IAsyncCollector<object> outputDocument) 
{ 
    log.LogInformation("C# HTTP trigger function processed a request."); 
    
    string name = req.Query["name"]; 
    
    string requestBody = await new StreamReader(req.Body).ReadToEndAsync(); 
    dynamic data = JsonConvert.DeserializeObject(requestBody); 
    name = name ?? data?.name;
    
    await outputDocument.AddAsync(new { 
        message = "hello" 
    });
    
    string responseMessage = string.IsNullOrEmpty(name) 
        ? "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response." 
        : $"Hello, {name}. This HTTP triggered function executed successfully."; 
    
    return new OkObjectResult(responseMessage); 
}`,
    },
    trigger: {
      defaultLanguage: 'json',
      defaultValue: `{
    "name": "TestObject", 
    "value": "This is our test object to show you that the connection is working!" 
}`,
    },
  },
  javascript: {
    input: {
      defaultLanguage: 'javascript',
      defaultValue: `module.exports = function (context) {
    // "myBinding" in this context will need to be dynamically replaced with the name of the actual output binding.
    context.bindings.myBinding = JSON.stringify({
        id: "1",
        exampleProperty: "This is an example!"
    });
    context.done();
};`,
    },
    output: {
      defaultLanguage: 'javascript',
      defaultValue: `module.exports = async function (context) { 
    // "myBinding" in this context will need to be dynamically replaced with the name of the actual output binding. 
    context.bindings.myBinding = { 
        exampleProperty: "This is an example!" 
    }; 
};`,
    },
    trigger: {
      defaultLanguage: 'json',
      defaultValue: `{
    "id": "1",
    "name": "TestObject",
    "value": "This is our test object to show you that the connection is working!"
}`,
    },
  },
  python: {
    input: {
      defaultLanguage: 'python',
      defaultValue: `import azure.functions as func
  
# The name of the input binding in this example is "documents", so this would need to be replaced with the actual name of the input binding dynamically.
def main(queuemsg: func.QueueMessage, documents: func.DocumentList) -> func.Document:
    if documents:
        document = documents[0]
        document['text'] = 'This was updated!'
        return document`,
    },
    output: {
      defaultLanguage: 'python',
      defaultValue: `import logging 
import json 
import azure.functions as func 
  
def main(req: func.HttpRequest, outputDocument: func.Out[func.Document]) -> func.HttpResponse: 
    logging.info('Python HTTP trigger function processed a request.') 
  
    name = req.params.get('name') 
    if not name: 
        try: 
            req_body = req.get_json() 
        except ValueError: 
            pass 
        else: 
            name = req_body.get('name') 

    if name: 
        outputDocument.set(func.Document.from_json(json.dumps({"name": "test"}))) 
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.") 
    else: 
        return func.HttpResponse( 
            "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.", 
            status_code=200 
        )`,
    },
    trigger: {
      defaultLanguage: 'json',
      defaultValue: `{
    "id": "1",
    "name": "TestObject",
    "value": "This is our test object to show you that the connection is working!"
}`,
    },
  },
};

export default code;
