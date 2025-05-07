type ObjectExpected = Record<string | number, string | undefined>;
type ClassNameExpected = string | ObjectExpected | undefined | null;

function isInvalidClassName(className: unknown) {
  return (
    typeof className !== 'string' &&
    typeof className !== 'object' &&
    className !== null &&
    className !== undefined
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const buildClassNames = <TPropClassName extends ClassNameExpected>(
  propClassName: TPropClassName,
  defaultKey?: TPropClassName extends ObjectExpected ? keyof TPropClassName : undefined,
) => {
  if (isInvalidClassName(propClassName)) {
    throw new TypeError('className must be a string, object, undefined or null');
  }

  function getDefaultKey() {
    if (defaultKey) {
      return defaultKey;
    }

    if (!propClassName || typeof propClassName !== 'object') {
      return undefined;
    }

    return Object.keys(propClassName)[0];
  }

  function getClassName(
    classNameKey: TPropClassName extends ObjectExpected ? keyof TPropClassName : undefined,
  ) {
    if (typeof propClassName === 'string' && classNameKey === getDefaultKey()) {
      return propClassName;
    }

    return typeof propClassName === 'object'
      ? (propClassName?.[classNameKey as keyof ObjectExpected] ?? undefined)
      : undefined;
  }

  return getClassName;
};

export default buildClassNames;

export type ClassNames<C extends string> =
  | string
  | {
      [key in C]?: string;
    };
