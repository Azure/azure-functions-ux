export class Url {
    private static _queryStrings: { [key: string]: string };

    public static getParameterByName(url, name) {
        if (url === null) {
            url = window.location.href;
        }

        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i');
        let results = regex.exec(url);

        if (!results) {
            return null;
        }

        if (!results[2]) {
            return '';
        }

        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    public static getParameterArrayByName(url, name) {
        const value = Url.getParameterByName(url, name);
        if (value) {
            return value.split(',');
        } else {
            return [];
        }
    }

    public static getQueryStringObj() {
        if (!this._queryStrings) {

            this._queryStrings = {};
            let match: RegExpExecArray;
            const pl = /\+/g;  // Regex for replacing addition symbol with a space
            const search = /([^&=]+)=?([^&]*)/g;
            const decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
            const query = window.location.search.substring(1);

            while (match = search.exec(query)) {
                this._queryStrings[decode(match[1])] = decode(match[2]);
            }
        }

        return this._queryStrings;
    }
}
