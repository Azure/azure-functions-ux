export { }

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
}

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
}