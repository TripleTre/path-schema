// [key, required, isValue]
type ParamListType = [string, boolean, boolean][];
type ParamsType = {[key: string]: string | number};

function isParamsType(arg: any): arg is ParamsType {
  return !!arg;
}

export class Path<P = void> {
  private _params: ParamListType = [];

  public parent: Path;
  /** router string like react router4 */
  public patternString: string;
  /** Regular expression object to use for validation */
  public regexp: RegExp;

  constructor(pattern: string, parent?: Path<any>) {
    const parentParamsList = (parent?._params || []);
    this.parent = parent;
    this._params = parentParamsList.concat(this._params);
    let required = parentParamsList.some(v => v[1] === false) || false;
    pattern.split('/')
      .filter(v => v.length > 0)
      .forEach(item => {
        let result: [string, boolean, boolean];
        if (/^:.*[^?]$/.test(item)) {
          result = [item.substring(1), true, true];
        } else if (/^:.*?$/.test(item)) {
          result = [item.substring(1, item.length - 1), false, true];
        } else {
          result = [item, true, false];
        }
        this._params.push(result);
        if (required === true && result[1] === true) {
          throw new Error(`Optional parameters must follow all required parameters; \n  ${pattern}`);
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
  public toPathString(params: P) {
    return this._params.reduce((prev, next) => {
      prev += '/';
      const value = isParamsType(params) ? params[next[0]] : '';
      if (next[1]) { // required
        if (next[2]) { // isValue
          prev += value;
        } else {
          prev += next[0];
        }
      } else {
        if (value) {
          prev += value;
        } else {
          prev = prev.substring(0, prev.length - 1);
        }
      }
      return prev;
    }, '');
  }

  private _toRouteString() {
    return this._params.reduce((prev, next) => {
      prev += '/';
      if (next[1]) { // required
        if (next[2]) { // isValue
          prev += `:${next[0]}`;
        } else {
          prev += next[0];
        }
      } else {
        prev += `:${next[0]}?`;
      }
      return prev;
    }, '');
  }

  private _toRegExp() {
    return new RegExp('^' + this._params.reduce((prev, next) => {
      if (next[1]) { // required
        prev += '/';
        if (next[2]) { // isValue
          prev += `([^/]+)`;
        } else {
          prev += next[0];
        }
      } else {
        prev += '(/)?'
        prev += `([^/]+)?`;
      }
      return prev;
    }, '') + '$');
  }

  /**
   * Parse the parameters object from the path
   * @param path path string to be parse
   * @return empty object if path not matched or parameters object
   */
  public toObject(path: string): P | null {
    if (this.regexp.test(path)) {
      const paths = path.replace(/^\//, '').split('/');
      return this._params.reduce((prev: any, next, index) => {
        if (next[2]) {
          if (next[1] || (!next[1] && paths[index])) {
            prev[next[0]] = paths[index];
          }
        }
        return prev;
      }, {});
    }
    return null;
  }

  /**
   * Derive a new path from the current path, with the current path as the parent path
   * @param pattern pattern string
   */
  public extends<E>(pattern: string): Path<P extends void ? E : E & P> {
    return new Path(pattern, this);
  }
}
