export interface BaseHKT {
  // used when applying
  rawArgs: unknown[];
  // used by HKTs
  args: this['rawArgs'] extends this['argConstraint'] ? this['rawArgs'] : never;

  // set by HKTs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  argConstraint: any[];
  result: unknown;

  assignabilityCheck: (...args: this['argConstraint']) => this['result'];
}

export interface BaseHKTable<THKT extends BaseHKT = BaseHKT> {
  readonly '~hkt'?: THKT;
  readonly '~preferHkt': true;
}

export type InferHKT<THKTable extends BaseHKTable> = Extract<
  THKTable['~hkt'],
  BaseHKT
>;

export type PartialApplyHKT<
  THKT extends BaseHKT,
  TArgs extends THKT['argConstraint'],
> = THKT & { rawArgs: TArgs };

export type ApplyHKT<
  THKT extends BaseHKT,
  TArgs extends THKT['argConstraint'],
> = PartialApplyHKT<THKT, TArgs>['result'];

export type HKTImplementation<THKT extends BaseHKT> = (
  ...args: THKT['argConstraint']
) => ApplyHKT<THKT, THKT['argConstraint']> & BaseHKTable<THKT>;
