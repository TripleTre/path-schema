type ParamListType<P> = [keyof P, boolean, boolean][];

type Extract<P> = P extends Path<infer T> ? T : never;

function isPathType(arg: any | ParamListType<any>): arg is Path<any> {
  return arg instanceof Path;
}

export class Path<P, E extends Path<any> = never> {
  self: string;
  parent: E;
  params: ParamListType<P>;

  constructor (self: string, parent?: E | ParamListType<P>, params?: ParamListType<P>) {
    this.self = self;
    if (isPathType(parent)) {
      this.parent = parent;
    } else {
      this.params = parent;
    }
    this.params = params || [];
  }

  private __fullPath (params?: any) {
    if (this.parent && Object.keys(this.parent.params).some(v => params[v] === undefined)) {
      throw new Error(`${this.parent.self} need a params, when called ${this.self}'s fullPath.`)
    }
    let path = this.self === '/' ? '/' : this.self + '/'
    for (let i = 0, len = this.params.length; i < len; i++) {
      let param = this.params[i]
      if (!param) {
        break
      }
      if (params) {
        if (param[1]) {
          if (params[param[0]] === undefined) {
            throw new Error(`Missing required parameters in path ${this.self}, [${param[0]}], /n/n the parameters is ${JSON.stringify(params)}`)
          }
        }
        let p = params[param[0]]
        if (p) {
          path += params[param[0]] + '/'
        }
      }
    }
    if (/^\//.test(this.self)) {
      return path
    } else {
      return (this.parent ? this.parent.__fullPath(params) : '') + path
    }
  }

  fullPath (params: P & Extract<E>) {
    return this.__fullPath(params).replace(/\/$/, '')
  }

  __pattern () {
    let pat = this.self === '/' ? '/' : this.self + '(\/)?'
    if (/^\//.test(this.self)) {
      pat = pat.replace(/^\//, '')
    }
    for (let i = 0, len = this.params.length; i < len; i++) {
      let param = this.params[i]
      if (!param) {
        break
      }
      if (param[2]) {
        if (param[1]) {
          pat += param[0] + '/'
        } else {
          pat += '(' + param[0] + '/)?'
        }
      } else { // dynamic
        if (param[1]) { // required
          pat += '(.+)' + '(/)?'
        } else {
          pat += '(.+)?(/)?'
        }
      }
    }
    if (/^\//.test(this.self)) {
      return pat
    } else {
      if (this.parent && this.parent.self !== '/') {
        return this.parent.pattern() + pat
      } else {
        return pat
      }
    }
  }

  pattern () {
    return new RegExp(this.__pattern().replace(/\/$/, ''))
  }

  routePath () {
    let path = this.self
    for (let i = 0, len = this.params.length; i < len; i++) {
      let param = this.params[i]
      if (!param) {
        break
      }
      if (param[1] === true) {
        if (param[2] === true) {
          path += `/${param[0]}`
        } else {
          path += `/:${param[0]}`
        }
      } else if (param[1] === false) {
        path += `/:${param[0]}?`
      }
    }
    return path
  }
}
