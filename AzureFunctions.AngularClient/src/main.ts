import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

///////////////////////
// Polyfills
// TODO: ellhamai - Need to revisit.  I couldn't really figure out how to get polyfills to work properly using AngularCLI so I just put it here for now.
///////////////////////
// TODO: papa - shouldnt need this now. Please check.
declare global {
  interface String {
    /**
   * Formats a string based on its key value pair object.
   *
   * @param args The list of arguments format arguments. For example: "String with params {0} and {1}".format("val1", "val2");.
   * @return Formatted string.
   */
    format(...restArgs: any[]): string;
  }

  interface ObjectConstructor {
    /*
    * https://stackoverflow.com/a/6491621/3234163
    * This takes in an object `o` and string `s` and finds property with key `s` in object `o`
    * `s` can be a nested object representation. For example if `o` is:
    *  {
    *    "person": {
    *      "address": {
    *        "street": "Main"
    *      }
    *    }
    *  }
    * you can get "Main" by calling byString(o, 'person.address.street')
    */
    byString(obj: any, key: string): any;
  }
}

// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
  };
}

if (!Object.byString) {
  Object.byString = function(o, s) {
    try {
      s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, '');           // strip a leading dot
      var a = s.split('.');
      for (var i = 0, n = a.length; i < n; ++i) {
          var k = a[i];
          if (k in o) {
              o = o[k];
          } else {
              return;
          }
      }
      return o;
    } catch (e) {
      return null;
    }
  }
}
