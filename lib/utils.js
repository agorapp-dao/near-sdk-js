"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = exports.str = exports.bytes = exports.TextDecoder = exports.TextEncoder = exports.validateAccountId = exports.deserialize = exports.serialize = exports.serializeValueWithOptions = exports.getValueWithOptions = exports.assert = exports.concat = exports.ERR_INDEX_OUT_OF_BOUNDS = exports.ERR_INCONSISTENT_STATE = void 0;
// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
    PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
    TypeBrand["BIGINT"] = "bigint";
    TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
exports.ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
exports.ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
const ACCOUNT_ID_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
/**
 * Concat two Uint8Array
 * @param array1
 * @param array2
 * @returns the concatenation of two array
 */
function concat(array1, array2) {
    const mergedArray = new Uint8Array(array1.length + array2.length);
    mergedArray.set(array1);
    mergedArray.set(array2, array1.length);
    return mergedArray;
}
exports.concat = concat;
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
    if (!expression) {
        throw new Error("assertion failed: " + message);
    }
}
exports.assert = assert;
function getValueWithOptions(value, options = {
    deserializer: deserialize,
}) {
    if (value === null) {
        return options?.defaultValue ?? null;
    }
    const deserialized = deserialize(value);
    if (deserialized === undefined || deserialized === null) {
        return options?.defaultValue ?? null;
    }
    if (options?.reconstructor) {
        return options.reconstructor(deserialized);
    }
    return deserialized;
}
exports.getValueWithOptions = getValueWithOptions;
function serializeValueWithOptions(value, { serializer } = {
    serializer: serialize,
}) {
    return serializer(value);
}
exports.serializeValueWithOptions = serializeValueWithOptions;
function serialize(valueToSerialize) {
    return encode(JSON.stringify(valueToSerialize, function (key, value) {
        if (typeof value === "bigint") {
            return {
                value: value.toString(),
                [TYPE_KEY]: TypeBrand.BIGINT,
            };
        }
        if (typeof this[key] === "object" &&
            this[key] !== null &&
            this[key] instanceof Date) {
            return {
                value: this[key].toISOString(),
                [TYPE_KEY]: TypeBrand.DATE,
            };
        }
        return value;
    }));
}
exports.serialize = serialize;
function deserialize(valueToDeserialize) {
    return JSON.parse(decode(valueToDeserialize), (_, value) => {
        if (value !== null &&
            typeof value === "object" &&
            Object.keys(value).length === 2 &&
            Object.keys(value).every((key) => ["value", TYPE_KEY].includes(key))) {
            switch (value[TYPE_KEY]) {
                case TypeBrand.BIGINT:
                    return BigInt(value["value"]);
                case TypeBrand.DATE:
                    return new Date(value["value"]);
            }
        }
        return value;
    });
}
exports.deserialize = deserialize;
/**
 * Validates the Account ID according to the NEAR protocol
 * [Account ID rules](https://nomicon.io/DataStructures/Account#account-id-rules).
 *
 * @param accountId - The Account ID string you want to validate.
 */
function validateAccountId(accountId) {
    return (accountId.length >= 2 &&
        accountId.length <= 64 &&
        ACCOUNT_ID_REGEX.test(accountId));
}
exports.validateAccountId = validateAccountId;
/**
 * A subset of NodeJS TextEncoder API
 */
class TextEncoder {
    encode(s) {
        return env.utf8_string_to_uint8array(s);
    }
}
exports.TextEncoder = TextEncoder;
/**
 * A subset of NodeJS TextDecoder API. Only support utf-8 and latin1 encoding.
 */
class TextDecoder {
    constructor(encoding = "utf-8") {
        this.encoding = encoding;
    }
    decode(a) {
        if (this.encoding == "utf-8") {
            return env.uint8array_to_utf8_string(a);
        }
        else if (this.encoding == "latin1") {
            return env.uint8array_to_latin1_string(a);
        }
        else {
            throw new Error("unsupported encoding: " + this.encoding);
        }
    }
}
exports.TextDecoder = TextDecoder;
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
    return env.latin1_string_to_uint8array(s);
}
exports.bytes = bytes;
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
    return env.uint8array_to_latin1_string(a);
}
exports.str = str;
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
    return env.utf8_string_to_uint8array(s);
}
exports.encode = encode;
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
    return env.uint8array_to_utf8_string(a);
}
exports.decode = decode;
