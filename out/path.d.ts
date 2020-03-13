export declare class Path<P = void> {
    private _params;
    parent: Path;
    /** router string like react router4 */
    patternString: string;
    /** Regular expression object to use for validation */
    regexp: RegExp;
    constructor(pattern: string, parent?: Path<any>);
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
    toObject(path: string): P | null;
    /**
     * Derive a new path from the current path, with the current path as the parent path
     * @param pattern pattern string
     */
    extends<E>(pattern: string): Path<P extends void ? E : E & P>;
}
//# sourceMappingURL=path.d.ts.map