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
exports.UnorderedSet = void 0;
const near = __importStar(require("../api"));
const utils_1 = require("../utils");
const vector_1 = require("./vector");
function serializeIndex(index) {
    const data = new Uint32Array([index]);
    const array = new Uint8Array(data.buffer);
    return array;
}
function deserializeIndex(rawIndex) {
    const [data] = new Uint32Array(rawIndex.buffer);
    return data;
}
/**
 * An unordered set that stores data in NEAR storage.
 */
class UnorderedSet {
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(prefix) {
        this.prefix = prefix;
        this.elementIndexPrefix = `${prefix}i`;
        this._elements = new vector_1.Vector(`${prefix}e`);
    }
    /**
     * The number of elements stored in the collection.
     */
    get length() {
        return this._elements.length;
    }
    /**
     * Checks whether the collection is empty.
     */
    isEmpty() {
        return this._elements.isEmpty();
    }
    /**
     * Checks whether the collection contains the value.
     *
     * @param element - The value for which to check the presence.
     * @param options - Options for storing data.
     */
    contains(element, options) {
        const indexLookup = this.elementIndexPrefix + (0, utils_1.serializeValueWithOptions)(element, options);
        return near.storageHasKey(indexLookup);
    }
    /**
     * If the set did not have this value present, `true` is returned.
     * If the set did have this value present, `false` is returned.
     *
     * @param element - The value to store in the collection.
     * @param options - Options for storing the data.
     */
    set(element, options) {
        const indexLookup = this.elementIndexPrefix + (0, utils_1.serializeValueWithOptions)(element, options);
        if (near.storageRead(indexLookup)) {
            return false;
        }
        const nextIndex = this.length;
        const nextIndexRaw = serializeIndex(nextIndex);
        near.storageWriteRaw((0, utils_1.encode)(indexLookup), nextIndexRaw);
        this._elements.push(element, options);
        return true;
    }
    /**
     * Returns true if the element was present in the set.
     *
     * @param element - The entry to remove.
     * @param options - Options for retrieving and storing data.
     */
    remove(element, options) {
        const indexLookup = this.elementIndexPrefix + (0, utils_1.serializeValueWithOptions)(element, options);
        const indexRaw = near.storageReadRaw((0, utils_1.encode)(indexLookup));
        if (!indexRaw) {
            return false;
        }
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        if (this.length === 1) {
            near.storageRemove(indexLookup);
            const index = deserializeIndex(indexRaw);
            this._elements.swapRemove(index);
            return true;
        }
        // If there is more than one element then swap remove swaps it with the last
        // element.
        const lastElement = this._elements.get(this.length - 1, options);
        (0, utils_1.assert)(!!lastElement, utils_1.ERR_INCONSISTENT_STATE);
        near.storageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastElement !== element) {
            const lastLookupElement = this.elementIndexPrefix +
                (0, utils_1.serializeValueWithOptions)(lastElement, options);
            near.storageWriteRaw((0, utils_1.encode)(lastLookupElement), indexRaw);
        }
        const index = deserializeIndex(indexRaw);
        this._elements.swapRemove(index);
        return true;
    }
    /**
     * Remove all of the elements stored within the collection.
     */
    clear(options) {
        for (const element of this._elements) {
            const indexLookup = this.elementIndexPrefix + (0, utils_1.serializeValueWithOptions)(element, options);
            near.storageRemove(indexLookup);
        }
        this._elements.clear();
    }
    [Symbol.iterator]() {
        return this._elements[Symbol.iterator]();
    }
    /**
     * Create a iterator on top of the default collection iterator using custom options.
     *
     * @param options - Options for retrieving and storing the data.
     */
    createIteratorWithOptions(options) {
        return {
            [Symbol.iterator]: () => new vector_1.VectorIterator(this._elements, options),
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
     * Extends the current collection with the passed in array of elements.
     *
     * @param elements - The elements to extend the collection with.
     */
    extend(elements) {
        for (const element of elements) {
            this.set(element);
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
        const set = new UnorderedSet(data.prefix);
        // reconstruct Vector
        const elementsPrefix = data.prefix + "e";
        set._elements = new vector_1.Vector(elementsPrefix);
        set._elements.length = data._elements.length;
        return set;
    }
    elements({ options, start, limit, }) {
        const ret = [];
        if (start === undefined) {
            start = 0;
        }
        if (limit == undefined) {
            limit = this.length - start;
        }
        for (let i = start; i < start + limit; i++) {
            ret.push(this._elements.get(i, options));
        }
        return ret;
    }
}
exports.UnorderedSet = UnorderedSet;
