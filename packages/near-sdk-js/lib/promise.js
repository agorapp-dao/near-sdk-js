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
exports.NearPromise = exports.PromiseJoint = exports.DeleteAccount = exports.DeleteKey = exports.AddAccessKey = exports.AddFullAccessKey = exports.Stake = exports.Transfer = exports.FunctionCallWeightRaw = exports.FunctionCallWeight = exports.FunctionCallRaw = exports.FunctionCall = exports.DeployContract = exports.CreateAccount = exports.PromiseAction = void 0;
const utils_1 = require("./utils");
const near = __importStar(require("./api"));
/**
 * A promise action which can be executed on the NEAR blockchain.
 */
class PromiseAction {
}
exports.PromiseAction = PromiseAction;
/**
 * A create account promise action.
 *
 * @extends {PromiseAction}
 */
class CreateAccount extends PromiseAction {
    add(promiseIndex) {
        near.promiseBatchActionCreateAccount(promiseIndex);
    }
}
exports.CreateAccount = CreateAccount;
/**
 * A deploy contract promise action.
 *
 * @extends {PromiseAction}
 */
class DeployContract extends PromiseAction {
    /**
     * @param code - The code of the contract to be deployed.
     */
    constructor(code) {
        super();
        this.code = code;
    }
    add(promiseIndex) {
        near.promiseBatchActionDeployContract(promiseIndex, this.code);
    }
}
exports.DeployContract = DeployContract;
/**
 * A function call promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCall extends PromiseAction {
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    constructor(functionName, args, amount, gas) {
        super();
        this.functionName = functionName;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
    }
    add(promiseIndex) {
        near.promiseBatchActionFunctionCall(promiseIndex, this.functionName, this.args, this.amount, this.gas);
    }
}
exports.FunctionCall = FunctionCall;
/**
 * A function call raw promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCallRaw extends PromiseAction {
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    constructor(functionName, args, amount, gas) {
        super();
        this.functionName = functionName;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
    }
    add(promiseIndex) {
        near.promiseBatchActionFunctionCallRaw(promiseIndex, this.functionName, this.args, this.amount, this.gas);
    }
}
exports.FunctionCallRaw = FunctionCallRaw;
/**
 * A function call weight promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCallWeight extends PromiseAction {
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    constructor(functionName, args, amount, gas, weight) {
        super();
        this.functionName = functionName;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
        this.weight = weight;
    }
    add(promiseIndex) {
        near.promiseBatchActionFunctionCallWeight(promiseIndex, this.functionName, this.args, this.amount, this.gas, this.weight);
    }
}
exports.FunctionCallWeight = FunctionCallWeight;
/**
 * A function call weight raw promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCallWeightRaw extends PromiseAction {
    /**
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    constructor(functionName, args, amount, gas, weight) {
        super();
        this.functionName = functionName;
        this.args = args;
        this.amount = amount;
        this.gas = gas;
        this.weight = weight;
    }
    add(promiseIndex) {
        near.promiseBatchActionFunctionCallWeightRaw(promiseIndex, this.functionName, this.args, this.amount, this.gas, this.weight);
    }
}
exports.FunctionCallWeightRaw = FunctionCallWeightRaw;
/**
 * A transfer promise action.
 *
 * @extends {PromiseAction}
 */
class Transfer extends PromiseAction {
    /**
     * @param amount - The amount of NEAR to tranfer.
     */
    constructor(amount) {
        super();
        this.amount = amount;
    }
    add(promiseIndex) {
        near.promiseBatchActionTransfer(promiseIndex, this.amount);
    }
}
exports.Transfer = Transfer;
/**
 * A stake promise action.
 *
 * @extends {PromiseAction}
 */
class Stake extends PromiseAction {
    /**
     * @param amount - The amount of NEAR to tranfer.
     * @param publicKey - The public key to use for staking.
     */
    constructor(amount, publicKey) {
        super();
        this.amount = amount;
        this.publicKey = publicKey;
    }
    add(promiseIndex) {
        near.promiseBatchActionStake(promiseIndex, this.amount, this.publicKey.data);
    }
}
exports.Stake = Stake;
/**
 * A add full access key promise action.
 *
 * @extends {PromiseAction}
 */
class AddFullAccessKey extends PromiseAction {
    /**
     * @param publicKey - The public key to add as a full access key.
     * @param nonce - The nonce to use.
     */
    constructor(publicKey, nonce) {
        super();
        this.publicKey = publicKey;
        this.nonce = nonce;
    }
    add(promiseIndex) {
        near.promiseBatchActionAddKeyWithFullAccess(promiseIndex, this.publicKey.data, this.nonce);
    }
}
exports.AddFullAccessKey = AddFullAccessKey;
/**
 * A add access key promise action.
 *
 * @extends {PromiseAction}
 */
class AddAccessKey extends PromiseAction {
    /**
     * @param publicKey - The public key to add as a access key.
     * @param allowance - The allowance for the key in yoctoNEAR.
     * @param receiverId - The account ID of the receiver.
     * @param functionNames - The names of funcitons to authorize.
     * @param nonce - The nonce to use.
     */
    constructor(publicKey, allowance, receiverId, functionNames, nonce) {
        super();
        this.publicKey = publicKey;
        this.allowance = allowance;
        this.receiverId = receiverId;
        this.functionNames = functionNames;
        this.nonce = nonce;
    }
    add(promiseIndex) {
        near.promiseBatchActionAddKeyWithFunctionCall(promiseIndex, this.publicKey.data, this.nonce, this.allowance, this.receiverId, this.functionNames);
    }
}
exports.AddAccessKey = AddAccessKey;
/**
 * A delete key promise action.
 *
 * @extends {PromiseAction}
 */
class DeleteKey extends PromiseAction {
    /**
     * @param publicKey - The public key to delete from the account.
     */
    constructor(publicKey) {
        super();
        this.publicKey = publicKey;
    }
    add(promiseIndex) {
        near.promiseBatchActionDeleteKey(promiseIndex, this.publicKey.data);
    }
}
exports.DeleteKey = DeleteKey;
/**
 * A delete account promise action.
 *
 * @extends {PromiseAction}
 */
class DeleteAccount extends PromiseAction {
    /**
     * @param beneficiaryId - The beneficiary of the account deletion - the account to recieve all of the remaining funds of the deleted account.
     */
    constructor(beneficiaryId) {
        super();
        this.beneficiaryId = beneficiaryId;
    }
    add(promiseIndex) {
        near.promiseBatchActionDeleteAccount(promiseIndex, this.beneficiaryId);
    }
}
exports.DeleteAccount = DeleteAccount;
class PromiseSingle {
    constructor(accountId, actions, after, promiseIndex) {
        this.accountId = accountId;
        this.actions = actions;
        this.after = after;
        this.promiseIndex = promiseIndex;
    }
    constructRecursively() {
        if (this.promiseIndex !== null) {
            return this.promiseIndex;
        }
        const promiseIndex = this.after
            ? near.promiseBatchThen(this.after.constructRecursively(), this.accountId)
            : near.promiseBatchCreate(this.accountId);
        this.actions.forEach((action) => action.add(promiseIndex));
        this.promiseIndex = promiseIndex;
        return promiseIndex;
    }
}
class PromiseJoint {
    constructor(promiseA, promiseB, promiseIndex) {
        this.promiseA = promiseA;
        this.promiseB = promiseB;
        this.promiseIndex = promiseIndex;
    }
    constructRecursively() {
        if (this.promiseIndex !== null) {
            return this.promiseIndex;
        }
        const result = near.promiseAnd(this.promiseA.constructRecursively(), this.promiseB.constructRecursively());
        this.promiseIndex = result;
        return result;
    }
}
exports.PromiseJoint = PromiseJoint;
/**
 * A high level class to construct and work with NEAR promises.
 */
class NearPromise {
    /**
     * @param subtype - The subtype of the promise.
     * @param shouldReturn - Whether the promise should return.
     */
    constructor(subtype, shouldReturn) {
        this.subtype = subtype;
        this.shouldReturn = shouldReturn;
    }
    /**
     * Creates a new promise to the provided account ID.
     *
     * @param accountId - The account ID on which to call the promise.
     */
    static new(accountId) {
        const subtype = new PromiseSingle(accountId, [], null, null);
        return new NearPromise(subtype, false);
    }
    addAction(action) {
        if (this.subtype instanceof PromiseJoint) {
            throw new Error("Cannot add action to a joint promise.");
        }
        this.subtype.actions.push(action);
        return this;
    }
    /**
     * Creates a create account promise action and adds it to the current promise.
     */
    createAccount() {
        return this.addAction(new CreateAccount());
    }
    /**
     * Creates a deploy contract promise action and adds it to the current promise.
     *
     * @param code - The code of the contract to be deployed.
     */
    deployContract(code) {
        return this.addAction(new DeployContract(code));
    }
    /**
     * Creates a function call promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    functionCall(functionName, args, amount, gas) {
        return this.addAction(new FunctionCall(functionName, args, amount, gas));
    }
    /**
     * Creates a function call raw promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     */
    functionCallRaw(functionName, args, amount, gas) {
        return this.addAction(new FunctionCallRaw(functionName, args, amount, gas));
    }
    /**
     * Creates a function call weight promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The utf-8 string arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    functionCallWeight(functionName, args, amount, gas, weight) {
        return this.addAction(new FunctionCallWeight(functionName, args, amount, gas, weight));
    }
    /**
     * Creates a function call weight raw promise action and adds it to the current promise.
     *
     * @param functionName - The name of the function to be called.
     * @param args - The arguments to be passed to the function.
     * @param amount - The amount of NEAR to attach to the call.
     * @param gas - The amount of Gas to attach to the call.
     * @param weight - The weight of unused Gas to use.
     */
    functionCallWeightRaw(functionName, args, amount, gas, weight) {
        return this.addAction(new FunctionCallWeightRaw(functionName, args, amount, gas, weight));
    }
    /**
     * Creates a transfer promise action and adds it to the current promise.
     *
     * @param amount - The amount of NEAR to tranfer.
     */
    transfer(amount) {
        return this.addAction(new Transfer(amount));
    }
    /**
     * Creates a stake promise action and adds it to the current promise.
     *
     * @param amount - The amount of NEAR to tranfer.
     * @param publicKey - The public key to use for staking.
     */
    stake(amount, publicKey) {
        return this.addAction(new Stake(amount, publicKey));
    }
    /**
     * Creates a add full access key promise action and adds it to the current promise.
     * Uses 0n as the nonce.
     *
     * @param publicKey - The public key to add as a full access key.
     */
    addFullAccessKey(publicKey) {
        return this.addFullAccessKeyWithNonce(publicKey, 0n);
    }
    /**
     * Creates a add full access key promise action and adds it to the current promise.
     * Allows you to specify the nonce.
     *
     * @param publicKey - The public key to add as a full access key.
     * @param nonce - The nonce to use.
     */
    addFullAccessKeyWithNonce(publicKey, nonce) {
        return this.addAction(new AddFullAccessKey(publicKey, nonce));
    }
    /**
     * Creates a add access key promise action and adds it to the current promise.
     * Uses 0n as the nonce.
     *
     * @param publicKey - The public key to add as a access key.
     * @param allowance - The allowance for the key in yoctoNEAR.
     * @param receiverId - The account ID of the receiver.
     * @param functionNames - The names of funcitons to authorize.
     */
    addAccessKey(publicKey, allowance, receiverId, functionNames) {
        return this.addAccessKeyWithNonce(publicKey, allowance, receiverId, functionNames, 0n);
    }
    /**
     * Creates a add access key promise action and adds it to the current promise.
     * Allows you to specify the nonce.
     *
     * @param publicKey - The public key to add as a access key.
     * @param allowance - The allowance for the key in yoctoNEAR.
     * @param receiverId - The account ID of the receiver.
     * @param functionNames - The names of funcitons to authorize.
     * @param nonce - The nonce to use.
     */
    addAccessKeyWithNonce(publicKey, allowance, receiverId, functionNames, nonce) {
        return this.addAction(new AddAccessKey(publicKey, allowance, receiverId, functionNames, nonce));
    }
    /**
     * Creates a delete key promise action and adds it to the current promise.
     *
     * @param publicKey - The public key to delete from the account.
     */
    deleteKey(publicKey) {
        return this.addAction(new DeleteKey(publicKey));
    }
    /**
     * Creates a delete account promise action and adds it to the current promise.
     *
     * @param beneficiaryId - The beneficiary of the account deletion - the account to recieve all of the remaining funds of the deleted account.
     */
    deleteAccount(beneficiaryId) {
        return this.addAction(new DeleteAccount(beneficiaryId));
    }
    /**
     * Joins the provided promise with the current promise, making the current promise a joint promise subtype.
     *
     * @param other - The promise to join with the current promise.
     */
    and(other) {
        const subtype = new PromiseJoint(this, other, null);
        return new NearPromise(subtype, false);
    }
    /**
     * Adds a callback to the current promise.
     *
     * @param other - The promise to be executed as the promise.
     */
    then(other) {
        (0, utils_1.assert)(other.subtype instanceof PromiseSingle, "Cannot callback joint promise.");
        (0, utils_1.assert)(other.subtype.after === null, "Cannot callback promise which is already scheduled after another");
        other.subtype.after = this;
        return other;
    }
    /**
     * Sets the shouldReturn field to true.
     */
    asReturn() {
        this.shouldReturn = true;
        return this;
    }
    /**
     * Recursively goes through the current promise to get the promise index.
     */
    constructRecursively() {
        const result = this.subtype.constructRecursively();
        if (this.shouldReturn) {
            near.promiseReturn(result);
        }
        return result;
    }
    /**
     * Called by NearBindgen, when return object is a NearPromise instance.
     */
    onReturn() {
        this.asReturn().constructRecursively();
    }
}
exports.NearPromise = NearPromise;
