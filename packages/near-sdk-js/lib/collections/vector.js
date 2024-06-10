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
exports.VectorIterator = exports.Vector = void 0;
const near = __importStar(require("../api"));
const utils_1 = require("../utils");
const subtype_1 = require("./subtype");
function indexToKey(prefix, index) {
    const data = new Uint32Array([index]);
    const array = new Uint8Array(data.buffer);
    const key = (0, utils_1.str)(array);
    return prefix + key;
}
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
class Vector extends subtype_1.SubType {
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     * @param length - The initial length of the collection. By default 0.
     */
    constructor(prefix, length = 0) {
        super();
        this.prefix = prefix;
        this.length = length;
    }
    /**
     * Checks whether the collection is empty.
     */
    isEmpty() {
        return this.length === 0;
    }
    /**
     * Get the data stored at the provided index.
     *
     * @param index - The index at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(index, options) {
        if (index >= this.length) {
            return options?.defaultValue ?? null;
        }
        const storageKey = indexToKey(this.prefix, index);
        const value = near.storageReadRaw((0, utils_1.bytes)(storageKey));
        options = this.set_reconstructor(options);
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Removes an element from the vector and returns it in serialized form.
     * The removed element is replaced by the last element of the vector.
     * Does not preserve ordering, but is `O(1)`.
     *
     * @param index - The index at which to remove the element.
     * @param options - Options for retrieving and storing the data.
     */
    swapRemove(index, options) {
        (0, utils_1.assert)(index < this.length, utils_1.ERR_INDEX_OUT_OF_BOUNDS);
        if (index + 1 === this.length) {
            return this.pop(options);
        }
        const key = indexToKey(this.prefix, index);
        const last = this.pop(options);
        (0, utils_1.assert)(near.storageWriteRaw((0, utils_1.bytes)(key), (0, utils_1.serializeValueWithOptions)(last, options)), utils_1.ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvictedRaw();
        options = this.set_reconstructor(options);
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Adds data to the collection.
     *
     * @param element - The data to store.
     * @param options - Options for storing the data.
     */
    push(element, options) {
        const key = indexToKey(this.prefix, this.length);
        this.length += 1;
        near.storageWriteRaw((0, utils_1.bytes)(key), (0, utils_1.serializeValueWithOptions)(element, options));
    }
    /**
     * Removes and retrieves the element with the highest index.
     *
     * @param options - Options for retrieving the data.
     */
    pop(options) {
        if (this.isEmpty()) {
            return options?.defaultValue ?? null;
        }
        const lastIndex = this.length - 1;
        const lastKey = indexToKey(this.prefix, lastIndex);
        this.length -= 1;
        (0, utils_1.assert)(near.storageRemoveRaw((0, utils_1.bytes)(lastKey)), utils_1.ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvictedRaw();
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
     *
     * @param index - The index at which to replace the data.
     * @param element - The data to replace with.
     * @param options - Options for retrieving and storing the data.
     */
    replace(index, element, options) {
        (0, utils_1.assert)(index < this.length, utils_1.ERR_INDEX_OUT_OF_BOUNDS);
        const key = indexToKey(this.prefix, index);
        (0, utils_1.assert)(near.storageWriteRaw((0, utils_1.bytes)(key), (0, utils_1.serializeValueWithOptions)(element, options)), utils_1.ERR_INCONSISTENT_STATE);
        const value = near.storageGetEvictedRaw();
        options = this.set_reconstructor(options);
        return (0, utils_1.getValueWithOptions)(this.subtype(), value, options);
    }
    /**
     * Extends the current collection with the passed in array of elements.
     *
     * @param elements - The elements to extend the collection with.
     */
    extend(elements) {
        for (const element of elements) {
            this.push(element);
        }
    }
    [Symbol.iterator]() {
        return new VectorIterator(this);
    }
    /**
     * Create a iterator on top of the default collection iterator using custom options.
     *
     * @param options - Options for retrieving and storing the data.
     */
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new VectorIterator(this, options),
        };
    }
    /**
     * Return a JavaScript array of the data stored within the collection.
     *
     * @param options - Options for retrieving and storing the data.
     */
    toArray(options) {
        const array = [];
        const iterator = options ? this.createIteratorWithOptions(options) : this;
        for (const value of iterator) {
            array.push(value);
        }
        return array;
    }
    /**
     * Remove all of the elements stored within the collection.
     */
    clear() {
        for (let index = 0; index < this.length; index++) {
            const key = indexToKey(this.prefix, index);
            near.storageRemoveRaw((0, utils_1.bytes)(key));
        }
        this.length = 0;
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
        const vector = new Vector(data.prefix, data.length);
        return vector;
    }
}
exports.Vector = Vector;
/**
 * An iterator for the Vector collection.
 */
class VectorIterator {
    /**
     * @param vector - The vector collection to create an iterator for.
     * @param options - Options for retrieving and storing data.
     */
    constructor(vector, options) {
        this.vector = vector;
        this.options = options;
        this.current = 0;
    }
    next() {
        if (this.current >= this.vector.length) {
            return { value: null, done: true };
        }
        const value = this.vector.get(this.current, this.options);
        this.current += 1;
        return { value, done: false };
    }
}
exports.VectorIterator = VectorIterator;
