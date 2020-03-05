declare type ParamListType = [string, boolean, boolean][];
export declare class Path<P = void> {
    private _params;
    /** router string like react router4 */
    patternString: string;
    /** Regular expression object to use for validation */
    regexp: RegExp;
    constructor(pattern: string, parentParamsList?: ParamListType);
    /**
     * Generate path from parameter object
     * @param params parameter object
     */
    toPathString(params: P): string;
    private _toRouteString;
    private _toRegExp;
    /**
     * Parse the parameters object from the path
     * @param path path string to be parse
     * @return empty object if path not matched or parameters object
     */
    toObject(path: string): any;
    /**
     * Derive a new path from the current path, with the current path as the parent path
     * @param pattern pattern string
     */
    extends<E>(pattern: string): Path<P extends void ? E : E & P>;
}
export {};
//# sourceMappingURL=path.d.ts.map