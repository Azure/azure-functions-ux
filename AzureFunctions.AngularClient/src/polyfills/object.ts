import 'core-js/es6/symbol';

declare global {
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
