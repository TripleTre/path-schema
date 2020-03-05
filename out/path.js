function isParamsType(arg) {
    return !!arg;
}
var Path = /** @class */ (function () {
    function Path(pattern, parentParamsList) {
        var _this = this;
        if (parentParamsList === void 0) { parentParamsList = []; }
        this._params = [];
        this._params = parentParamsList.concat(this._params);
        var required = parentParamsList.some(function (v) { return v[1] === false; }) || false;
        pattern.split('/')
            .filter(function (v) { return v.length > 0; })
            .forEach(function (item) {
            var result;
            if (/^:.*[^?]$/.test(item)) {
                result = [item.substring(1), true, true];
            }
            else if (/^:.*?$/.test(item)) {
                result = [item.substring(1, item.length - 1), false, true];
            }
            else {
                result = [item, true, false];
            }
            _this._params.push(result);
            if (required === true && result[1] === true) {
                throw new Error("Optional parameters must follow all required parameters; \n  " + pattern);
            }
            if (result[1] === false) {
                required = true;
            }
        });
        this.patternString = this._toRouteString();
        this.regexp = this._toRegExp();
    }
    /**
     * Generate path from parameter object
     * @param params parameter object
     */
    Path.prototype.toPathString = function (params) {
        return this._params.reduce(function (prev, next) {
            prev += '/';
            var value = isParamsType(params) ? params[next[0]] : '';
            if (next[1]) { // required
                if (next[2]) { // isValue
                    prev += value;
                }
                else {
                    prev += next[0];
                }
            }
            else {
                if (value) {
                    prev += value;
                }
                else {
                    prev = prev.substring(0, prev.length - 1);
                }
            }
            return prev;
        }, '');
    };
    Path.prototype._toRouteString = function () {
        return this._params.reduce(function (prev, next) {
            prev += '/';
            if (next[1]) { // required
                if (next[2]) { // isValue
                    prev += ":" + next[0];
                }
                else {
                    prev += next[0];
                }
            }
            else {
                prev += ":" + next[0] + "?";
            }
            return prev;
        }, '');
    };
    Path.prototype._toRegExp = function () {
        return new RegExp(this._params.reduce(function (prev, next) {
            if (next[1]) { // required
                prev += '/';
                if (next[2]) { // isValue
                    prev += "([^/]+)";
                }
                else {
                    prev += next[0];
                }
            }
            else {
                prev += '(/)?';
                prev += "([^/]+)?";
            }
            return prev;
        }, ''));
    };
    /**
     * Parse the parameters object from the path
     * @param path path string to be parse
     * @return empty object if path not matched or parameters object
     */
    Path.prototype.toObject = function (path) {
        if (this.regexp.test(path)) {
            var paths_1 = path.replace(/^\//, '').split('/');
            return this._params.reduce(function (prev, next, index) {
                if (next[2]) {
                    if (next[1] || (!next[1] && paths_1[index])) {
                        prev[next[0]] = paths_1[index];
                    }
                }
                return prev;
            }, {});
        }
        return {};
    };
    /**
     * Derive a new path from the current path, with the current path as the parent path
     * @param pattern pattern string
     */
    Path.prototype.extends = function (pattern) {
        return new Path(pattern, this._params);
    };
    return Path;
}());
export { Path };
