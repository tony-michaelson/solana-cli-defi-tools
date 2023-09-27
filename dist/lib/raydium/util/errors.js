export function throwIfUndefined(value, message = 'Not found') {
    if (value === undefined) {
        throw new Error(message);
    }
    return value;
}
export function throwIfNull(value, message = 'Not found') {
    if (value === null) {
        throw new Error(message);
    }
    return value;
}
export function throwIfEmpty(value, message = 'Not found') {
    if (value.length === 0) {
        throw new Error(message);
    }
    return value;
}
