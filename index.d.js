declare module 'format-ms' {
  interface Options {
    compact?: boolean;
    unitCount?: number;
    colonNotation?: boolean;
    secondsDecimalDigits?: number;
    minutesDecimalDigits?: number;
    formatSubMilliseconds?: boolean;
    verbose?: boolean;
  }

  function prettyMilliseconds(milliseconds: number | bigint, options?: Options): string;

  export = prettyMilliseconds;
}
