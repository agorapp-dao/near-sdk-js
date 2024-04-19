"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearBindgen = exports.middleware = exports.call = exports.view = exports.initialize = exports.migrate = void 0;
const near = __importStar(require("./api"));
const utils_1 = require("./utils");
/**
 * Tells the SDK to use this function as the migration function of the contract.
 * The migration function will ignore te existing state.
 * @param _empty - An empty object.
 */
function migrate(_empty) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
exports.migrate = migrate;
/**
 * Tells the SDK to use this function as the initialization function of the contract.
 *
 * @param _empty - An empty object.
 */
function initialize(_empty) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
exports.initialize = initialize;
/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, _descriptor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) { };
}
exports.view = view;
function call({ privateFunction = false, payableFunction = false, }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, descriptor) {
        const originalMethod = descriptor.value;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        descriptor.value = function (...args) {
            if (privateFunction &&
                near.predecessorAccountId() !== near.currentAccountId()) {
                throw new Error("Function is private");
            }
            if (!payableFunction && near.attachedDeposit() > 0n) {
                throw new Error("Function is not payable");
            }
            return originalMethod.apply(this, args);
        };
    };
}
exports.call = call;
/**
 * Tells the SDK to apply an array of passed in middleware to the function execution.
 *
 * @param middlewares - The middlewares to be executed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function middleware(...middlewares) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (_target, _key, descriptor) {
        const originalMethod = descriptor.value;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        descriptor.value = function (...args) {
            try {
                middlewares.forEach((middleware) => middleware(...args));
            }
            catch (error) {
                throw new Error(error);
            }
            return originalMethod.apply(this, args);
        };
    };
}
exports.middleware = middleware;
function NearBindgen({ requireInit = false, serializer = utils_1.serialize, deserializer = utils_1.deserialize, }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target) => {
        return class extends target {
            static _create() {
                return new target();
            }
            static _getState() {
                const rawState = near.storageReadRaw((0, utils_1.bytes)("STATE"));
                return rawState ? this._deserialize(rawState) : null;
            }
            static _saveToStorage(objectToSave) {
                near.storageWriteRaw((0, utils_1.bytes)("STATE"), this._serialize(objectToSave));
            }
            static _getArgs() {
                return JSON.parse(near.input() || "{}");
            }
            static _serialize(value, forReturn = false) {
                if (forReturn) {
                    return (0, utils_1.encode)(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
                }
                return serializer(value);
            }
            static _deserialize(value) {
                return deserializer(value);
            }
            static _reconstruct(classObject, plainObject) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (classObject.constructor.schema === undefined) {
                    for (const item in classObject) {
                        const reconstructor = classObject[item].constructor?.reconstruct;
                        classObject[item] = reconstructor
                            ? reconstructor(plainObject[item])
                            : plainObject[item];
                    }
                    return classObject;
                }
                return (0, utils_1.decodeObj2class)(classObject, plainObject);
            }
            static _requireInit() {
                return requireInit;
            }
        };
    };
}
exports.NearBindgen = NearBindgen;
