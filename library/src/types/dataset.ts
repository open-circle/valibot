import type { BaseIssue } from './issue.ts';

/**
 * Unknown dataset interface.
 */
export interface UnknownDataset {
  /**
   * Whether it's typed.
   */
  typed?: false;
  /**
   * The dataset value.
   */
  value: unknown;
  /**
   * The dataset issues.
   */
  issues?: undefined;
}

/**
 * Success dataset interface.
 *
 * Hint: The explicit variance annotations of the generics spare TypeScript
 * from measuring the variance of this interface (see issue #1663).
 */
export interface SuccessDataset<out TValue> {
  /**
   * Whether it's typed.
   */
  typed: true;
  /**
   * The dataset value.
   */
  value: TValue;
  /**
   * The dataset issues.
   */
  issues?: undefined;
}

/**
 * Partial dataset interface.
 *
 * Hint: The explicit variance annotations of the generics spare TypeScript
 * from measuring the variance of this interface (see issue #1663).
 */
export interface PartialDataset<
  out TValue,
  out TIssue extends BaseIssue<unknown>,
> {
  /**
   * Whether it's typed.
   */
  typed: true;
  /**
   * The dataset value.
   */
  value: TValue;
  /**
   * The dataset issues.
   */
  issues: [TIssue, ...TIssue[]];
}

/**
 * Failure dataset interface.
 *
 * Hint: The explicit variance annotations of the generics spare TypeScript
 * from measuring the variance of this interface (see issue #1663).
 */
export interface FailureDataset<out TIssue extends BaseIssue<unknown>> {
  /**
   * Whether it's typed.
   */
  typed: false;
  /**
   * The dataset value.
   */
  value: unknown;
  /**
   * The dataset issues.
   */
  issues: [TIssue, ...TIssue[]];
}

/**
 * Output dataset type.
 */
export type OutputDataset<TValue, TIssue extends BaseIssue<unknown>> =
  | SuccessDataset<TValue>
  | PartialDataset<TValue, TIssue>
  | FailureDataset<TIssue>;
