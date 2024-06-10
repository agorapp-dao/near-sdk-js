"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicKey = exports.UnknownCurve = exports.Base58Error = exports.InvalidLengthError = exports.ParsePublicKeyError = exports.curveTypeFromStr = exports.CurveType = void 0;
const base_1 = require("@scure/base");
const utils_1 = require("../utils");
var CurveType;
(function (CurveType) {
    CurveType[CurveType["ED25519"] = 0] = "ED25519";
    CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType = exports.CurveType || (exports.CurveType = {}));
var DataLength;
(function (DataLength) {
    DataLength[DataLength["ED25519"] = 32] = "ED25519";
    DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));
function getCurveType(curveType) {
    switch (curveType) {
        case CurveType.ED25519:
        case CurveType.SECP256K1:
            return curveType;
        default:
            throw new UnknownCurve();
    }
}
function dataLength(curveType) {
    switch (curveType) {
        case CurveType.ED25519:
        case CurveType.SECP256K1:
            return {
                [CurveType.ED25519]: DataLength.ED25519,
                [CurveType.SECP256K1]: DataLength.SECP256K1,
            }[curveType];
        default:
            throw new UnknownCurve();
    }
}
function splitKeyTypeData(value) {
    const idx = value.indexOf(":");
    if (idx >= 0) {
        return [
            curveTypeFromStr(value.substring(0, idx)),
            value.substring(idx + 1),
        ];
    }
    else {
        return [CurveType.ED25519, value];
    }
}
function curveTypeFromStr(value) {
    switch (value) {
        case "ed25519":
            return CurveType.ED25519;
        case "secp256k1":
            return CurveType.SECP256K1;
        default:
            throw new UnknownCurve();
    }
}
exports.curveTypeFromStr = curveTypeFromStr;
class ParsePublicKeyError extends Error {
}
exports.ParsePublicKeyError = ParsePublicKeyError;
class InvalidLengthError extends ParsePublicKeyError {
    constructor(length, expectedLength) {
        super(`Invalid length: ${length}. Expected: ${expectedLength}`);
        this.length = length;
        this.expectedLength = expectedLength;
    }
}
exports.InvalidLengthError = InvalidLengthError;
class Base58Error extends ParsePublicKeyError {
    constructor(error) {
        super(`Base58 error: ${error}`);
        this.error = error;
    }
}
exports.Base58Error = Base58Error;
class UnknownCurve extends ParsePublicKeyError {
    constructor() {
        super("Unknown curve");
    }
}
exports.UnknownCurve = UnknownCurve;
/**
 * A abstraction on top of the NEAR public key string.
 */
class PublicKey {
    /**
     * @param data - The string you want to create a PublicKey from.
     */
    constructor(data) {
        const curveLenght = dataLength(data[0]);
        if (data.length !== curveLenght + 1) {
            throw new InvalidLengthError(data.length, curveLenght + 1);
        }
        this.type = getCurveType(data[0]);
        this.data = data;
    }
    /**
     * The curve type of the public key.
     */
    curveType() {
        return this.type;
    }
    /**
     * Create a public key from a public key string.
     *
     * @param publicKeyString - The public key string you want to create a PublicKey from.
     */
    static fromString(publicKeyString) {
        const [curve, keyData] = splitKeyTypeData(publicKeyString);
        let data;
        try {
            data = base_1.base58.decode(keyData);
        }
        catch (error) {
            throw new Base58Error(error.message);
        }
        return new PublicKey((0, utils_1.concat)(new Uint8Array([curve]), data));
    }
}
exports.PublicKey = PublicKey;
