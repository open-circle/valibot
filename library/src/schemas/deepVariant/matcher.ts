type Rec = {
  [k: string]: string | Rec | unknown
}

type GetStringByPath<Obj extends Rec, Path extends string> = Path extends `${infer L}.${infer R}`
  ? L extends keyof Obj
    ? Obj[L] extends Rec
      ? GetStringByPath<Obj[L] & Rec, R>
      : Obj[L] extends string
        ? Obj[L]
        : never
    : never
  : Path extends keyof Obj
    ? Obj[Path] extends string
      ? Obj[Path]
      : never
    : never;

type CompareStringByPath<Obj extends Rec, Path extends string, ExpectedValue extends string> = Path extends `${infer L}.${infer R}`
  ? L extends keyof Obj
    ? Obj[L] extends Rec
      ? CompareStringByPath<Obj[L] & Rec, R, ExpectedValue>
      : Obj[L] extends string
        ? Obj[L] extends ExpectedValue ? true : false
        : never
    : never
  : Path extends keyof Obj
    ? Obj[Path] extends string
      ? Obj[Path] extends ExpectedValue ? true : false
      : never
    : never;

export type FindVariant<T extends Rec, Path extends string, ExpectedValue extends string> = 
  T extends any 
    ? CompareStringByPath<T, Path, ExpectedValue> extends true 
      ? T 
      : never 
    : never;

type Matchers<Variants extends Rec, Path extends string, DiscrimnatorsValues extends string = GetStringByPath<Variants, Path>> = {
  [k in DiscrimnatorsValues]: (data: FindVariant<Variants, Path, k>) => any
}

function getValueByPath(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const matchVariation = <
  const Variants extends Rec,
  const Path extends string,
>(
  variant: Variants,
  path: Path,
  matchers: Matchers<Variants, Path>
) => {
  const value = getValueByPath(variant, path);
  if (!(value in matchers)) {
    throw new Error(`Invalid type by path ${path} - found value: ${value}, expected to be one of: ${Object.keys(matchers)}`);
  }

  return matchers[value as keyof typeof matchers](variant as any);
}
