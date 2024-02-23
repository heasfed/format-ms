import parseMilliseconds from 'parse-ms';

const SECOND_ROUNDING_EPSILON = 0.0000001;
const ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n;

export default function prettyMilliseconds(milliseconds, options) {
    const isBigInt = typeof milliseconds === 'bigint';
    if (!isBigInt && !Number.isFinite(milliseconds)) {
        throw new TypeError('Expected a finite number or bigint');
    }

    options = {...options};

    if (options.colonNotation) {
        options.compact = false;
        options.formatSubMilliseconds = false;
        options.separateMilliseconds = false;
        options.verbose = false;
    }

    if (options.compact) {
        options.unitCount = 1;
        options.secondsDecimalDigits = 0;
        options.millisecondsDecimalDigits = 0;
    }

    let result = [];

    const add = (value, long, short, valueString) => {
        if (!(options.colonNotation && short === 'm') && (value === 0 || value === 0n) && (result.length ===0 || !options.colonNotation)) return;

        valueString = String(value);
        if (options.colonNotation) {
            const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length;
            valueString = '0'.repeat(Math.max(0, result.length === 0? 1 : 2 - wholeDigits)) + valueString;
        } else {
            valueString += options.verbose ? ' ' + (value === 1 || value === 1n) ? long : `${long}s` : short;
        }

        result.push(valueString);
    };

    const parsed = parseMilliseconds(milliseconds);
    const days = BigInt(parsed.days);

    add(days / 365n, 'year', 'y');
    add(days % 365n, 'day', 'd');
    add(Number(parsed.hours), 'hour', 'h');
    add(Number(parsed.minutes), 'minute', 'm');

    if (options.separateMilliseconds || options.formatSubMilliseconds || (!options.colonNotation && milliseconds < 1000)) {
      
        const seconds = Number(parsed.seconds);
        const milliseconds = Number(parsed.milliseconds);
        const microseconds = Number(parsed.microseconds);
        const nanoseconds = Number(parsed.nanoseconds);

        add(seconds, 'second', 's');
      
        if (options.formatSubMilliseconds) {
            add(milliseconds, 'millisecond', 'ms');
            add(microseconds, 'microsecond', 'µs');
            add(nanoseconds, 'nanosecond', 'ns');
        } else {
            const millisecondsAndBelow = milliseconds + (microseconds / 1000) + (nanoseconds / 1e6);
            const millisecondsDecimalDigits = typeof options.millisecondsDecimalDigits === 'number' ? options.millisecondsDecimalDigits : 0;
            const millisecondsString = millisecondsDecimalDigits ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits) : Math.round(millisecondsAndBelow);
            add(Number.parseFloat(millisecondsString), 'millisecond', 'ms', millisecondsString);
        }
    } else {
        const seconds = ((isBigInt ? Number(milliseconds % ONE_DAY_IN_MILLISECONDS) : milliseconds) / 1000) % 60;
        const secondsDecimalDigits = typeof options.secondsDecimalDigits === 'number' ? options.secondsDecimalDigits : 1;
        const secondsFixed = Number((Math.floor((seconds * (10 ** secondsDecimalDigits)) + SECOND_ROUNDING_EPSILON) / (10 ** secondsDecimalDigits)).toFixed(secondsDecimalDigits));
        const secondsString = options.keepDecimalsOnWholeSeconds ? secondsFixed : secondsFixed.toString().replace(/\.0+$/, '');
        add(Number.parseFloat(secondsString), 'second', 's', secondsString);
    }

    if (result.length === 0) {
        return '0' + (options.verbose ? ' milliseconds' : 'ms');
    }

    const separator = options.colonNotation ? ':' : ' ';
    if (typeof options.unitCount === 'number') {
        result = result.slice(0, Math.max(options.unitCount, 1));
    }

    return result.join(separator);
}
