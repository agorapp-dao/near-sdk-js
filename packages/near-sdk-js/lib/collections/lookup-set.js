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
exports.LookupSet = void 0;
const near = __importStar(require("../api"));
const utils_1 = require("../utils");
/**
 * A lookup set collection that stores entries in NEAR storage.
 */
class LookupSet {
    /**
     * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(keyPrefix) {
        this.keyPrefix = keyPrefix;
    }
    /**
     * Checks whether the collection contains the value.
     *
     * @param key - The value for which to check the presence.
     * @param options - Options for storing data.
     */
    contains(key, options) {
        const storageKey = this.keyPrefix + (0, utils_1.serializeValueWithOptions)(key, options);
        return near.storageHasKey(storageKey);
    }
    /**
     * Returns true if the element was present in the set.
     *
     * @param key - The entry to remove.
     * @param options - Options for storing data.
     */
    remove(key, options) {
        const storageKey = this.keyPrefix + (0, utils_1.serializeValueWithOptions)(key, options);
        return near.storageRemove(storageKey);
    }
    /**
     * If the set did not have this value present, `true` is returned.
     * If the set did have this value present, `false` is returned.
     *
     * @param key - The value to store in the collection.
     * @param options - Options for storing the data.
     */
    set(key, options) {
        const storageKey = this.keyPrefix + (0, utils_1.serializeValueWithOptions)(key, options);
        return !near.storageWrite(storageKey, "");
    }
    /**
     * Extends the current collection with the passed in array of elements.
     *
     * @param keys - The elements to extend the collection with.
     * @param options - Options for storing the data.
     */
    extend(keys, options) {
        keys.forEach((key) => this.set(key, options));
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
        return new LookupSet(data.keyPrefix);
    }
}
exports.LookupSet = LookupSet;
