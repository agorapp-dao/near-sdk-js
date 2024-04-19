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
exports.LookupMap = void 0;
const near = __importStar(require("../api"));
const utils_1 = require("../utils");
const subtype_1 = require("./subtype");
/**
 * A lookup map that stores data in NEAR storage.
 */
class LookupMap extends subtype_1.SubType {
    /**
     * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(keyPrefix) {
        super();
        this.keyPrefix = keyPrefix;
    }
    /**
     * Checks whether the collection contains the value.
     *
     * @param key - The value for which to check the presence.
     */
    containsKey(key) {
        const storageKey = this.keyPrefix + key;
        return near.storageHasKey(storageKey);
    }
    /**
     * Get the data stored at the provided key.
     *
     * @param key - The key at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(key, options) {
        const storageKey = this.keyPrefix + key;
        const value = near.storageReadRaw((0, utils_1.encode)(storageKey));
        if (options == undefined) {
            options = {};
        }
        options = this.set_reconstructor(options);
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Removes and retrieves the element with the provided key.
     *
     * @param key - The key at which to remove data.
     * @param options - Options for retrieving the data.
     */
    remove(key, options) {
        const storageKey = this.keyPrefix + key;
        if (!near.storageRemove(storageKey)) {
            return options?.defaultValue ?? null;
        }
        const value = near.storageGetEvictedRaw();
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Store a new value at the provided key.
     *
     * @param key - The key at which to store in the collection.
     * @param newValue - The value to store in the collection.
     * @param options - Options for retrieving and storing the data.
     */
    set(key, newValue, options) {
        const storageKey = this.keyPrefix + key;
        const storageValue = (0, utils_1.serializeValueWithOptions)(newValue, options);
        if (!near.storageWriteRaw((0, utils_1.encode)(storageKey), storageValue)) {
            return options?.defaultValue ?? null;
        }
        const value = near.storageGetEvictedRaw();
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Extends the current collection with the passed in array of key-value pairs.
     *
     * @param keyValuePairs - The key-value pairs to extend the collection with.
     * @param options - Options for storing the data.
     */
    extend(keyValuePairs, options) {
        for (const [key, value] of keyValuePairs) {
            this.set(key, value, options);
        }
    }
    /**
     * Serialize the collection.
     *
     * @param options - Options for storing the data.
     */
    serialize(options) {
        return (0, utils_1.serializeValueWithOptions)(this, options);
    }
    /**
     * Converts the deserialized data from storage to a JavaScript instance of the collection.
     *
     * @param data - The deserialized data to create an instance from.
     */
    static reconstruct(data) {
        return new LookupMap(data.keyPrefix);
    }
}
exports.LookupMap = LookupMap;
