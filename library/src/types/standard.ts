/**
 * The Standard Schema properties interface.
 */
export interface StandardProps<TInput, TOutput> {
  /**
   * The version number of the standard.
   */
  readonly version: 1;
  /**
   * The vendor name of the schema library.
   */
  readonly vendor: 'valibot';
  /**
   * Validates unknown input values.
   */
  readonly validate: (
    value: unknown
  ) => StandardResult<TOutput> | Promise<StandardResult<TOutput>>;
  /**
   * Inferred types associated with the schema.
   */
  readonly types?: StandardTypes<TInput, TOutput> | undefined;
}

/**
 * The result interface of the validate function.
 */
export type StandardResult<TOutput> =
  StandardSuccessResult<TOutput> | StandardFailureResult;

/**
 * The result interface if validation succeeds.
 */
export interface StandardSuccessResult<TOutput> {
  /**
   * The typed output value.
   */
  readonly value: TOutput;
  /**
   * The non-existent issues.
   */
  readonly issues?: undefined;
}

/**
 * The result interface if validation fails.
 */
export interface StandardFailureResult {
  /**
   * The issues of failed validation.
   */
  readonly issues: readonly StandardIssue[];
}

/**
 * The issue interface of the failure output.
 */
export interface StandardIssue {
  /**
   * The error message of the issue.
   */
  readonly message: string;
  /**
   * The path of the issue, if any.
   */
  readonly path?: readonly (PropertyKey | StandardPathItem)[] | undefined;
}

/**
 * The path item interface of the issue.
 */
export interface StandardPathItem {
  /**
   * The key of the path item.
   */
  readonly key: PropertyKey;
}

/**
 * The Standard Schema types interface.
 */
export interface StandardTypes<TInput, TOutput> {
  /**
   * The input type of the schema.
   */
  readonly input: TInput;
  /**
   * The output type of the schema.
   */
  readonly output: TOutput;
}
