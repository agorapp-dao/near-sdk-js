"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseBatchActionFunctionCallWeight = exports.promiseBatchActionFunctionCallWeightRaw = exports.promiseBatchActionDeleteAccount = exports.promiseBatchActionDeleteKey = exports.promiseBatchActionAddKeyWithFunctionCall = exports.promiseBatchActionAddKeyWithFullAccess = exports.promiseBatchActionStake = exports.promiseBatchActionTransfer = exports.promiseBatchActionFunctionCall = exports.promiseBatchActionFunctionCallRaw = exports.promiseBatchActionDeployContract = exports.promiseBatchActionCreateAccount = exports.promiseBatchThen = exports.promiseBatchCreate = exports.promiseAnd = exports.promiseThen = exports.promiseThenRaw = exports.promiseCreate = exports.promiseCreateRaw = exports.randomSeed = exports.valueReturn = exports.valueReturnRaw = exports.input = exports.inputRaw = exports.storageByteCost = exports.storageRemove = exports.storageRemoveRaw = exports.storageWrite = exports.storageWriteRaw = exports.storageUsage = exports.storageGetEvicted = exports.storageGetEvictedRaw = exports.storageHasKey = exports.storageHasKeyRaw = exports.storageRead = exports.storageReadRaw = exports.accountLockedBalance = exports.accountBalance = exports.usedGas = exports.prepaidGas = exports.attachedDeposit = exports.epochHeight = exports.blockTimestamp = exports.blockHeight = exports.blockIndex = exports.currentAccountId = exports.predecessorAccountId = exports.signerAccountPk = exports.signerAccountId = exports.log = void 0;
exports.altBn128PairingCheck = exports.altBn128G1Sum = exports.altBn128G1Multiexp = exports.validatorTotalStake = exports.validatorStake = exports.logUtf16 = exports.logUtf8 = exports.panicUtf8 = exports.ecrecover = exports.ripemd160 = exports.keccak512 = exports.keccak256 = exports.sha256 = exports.promiseReturn = exports.promiseResult = exports.promiseResultRaw = exports.promiseResultsCount = void 0;
const utils_1 = require("./utils");
const types_1 = require("./types");
const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
function log(...params) {
    env.log(params.reduce((accumulated, parameter, index) => {
        // Stringify undefined
        const param = parameter === undefined ? "undefined" : parameter;
        // Convert Objects to strings and convert to string
        const stringified = typeof param === "object" ? JSON.stringify(param) : `${param}`;
        if (index === 0) {
            return stringified;
        }
        return `${accumulated} ${stringified}`;
    }, ""));
}
exports.log = log;
/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
function signerAccountId() {
    env.signer_account_id(0);
    return (0, utils_1.str)(env.read_register(0));
}
exports.signerAccountId = signerAccountId;
/**
 * Returns the public key of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
function signerAccountPk() {
    env.signer_account_pk(0);
    return env.read_register(0);
}
exports.signerAccountPk = signerAccountPk;
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
    env.predecessor_account_id(0);
    return (0, utils_1.str)(env.read_register(0));
}
exports.predecessorAccountId = predecessorAccountId;
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
    env.current_account_id(0);
    return (0, utils_1.str)(env.read_register(0));
}
exports.currentAccountId = currentAccountId;
/**
 * Returns the current block index.
 */
function blockIndex() {
    return env.block_index();
}
exports.blockIndex = blockIndex;
/**
 * Returns the current block height.
 */
function blockHeight() {
    return blockIndex();
}
exports.blockHeight = blockHeight;
/**
 * Returns the current block timestamp.
 */
function blockTimestamp() {
    return env.block_timestamp();
}
exports.blockTimestamp = blockTimestamp;
/**
 * Returns the current epoch height.
 */
function epochHeight() {
    return env.epoch_height();
}
exports.epochHeight = epochHeight;
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
    return env.attached_deposit();
}
exports.attachedDeposit = attachedDeposit;
/**
 * Returns the amount of Gas that was attached to this function call.
 */
function prepaidGas() {
    return env.prepaid_gas();
}
exports.prepaidGas = prepaidGas;
/**
 * Returns the amount of Gas that has been used by this function call until now.
 */
function usedGas() {
    return env.used_gas();
}
exports.usedGas = usedGas;
/**
 * Returns the current account's account balance.
 */
function accountBalance() {
    return env.account_balance();
}
exports.accountBalance = accountBalance;
/**
 * Returns the current account's locked balance.
 */
function accountLockedBalance() {
    return env.account_locked_balance();
}
exports.accountLockedBalance = accountLockedBalance;
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
    const returnValue = env.storage_read(key, 0);
    if (returnValue !== 1n) {
        return null;
    }
    return env.read_register(0);
}
exports.storageReadRaw = storageReadRaw;
/**
 * Reads the utf-8 string value from NEAR storage that is stored under the provided key.
 *
 * @param key - The utf-8 string key to read from storage.
 */
function storageRead(key) {
    const ret = storageReadRaw((0, utils_1.encode)(key));
    if (ret !== null) {
        return (0, utils_1.decode)(ret);
    }
    return null;
}
exports.storageRead = storageRead;
/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
function storageHasKeyRaw(key) {
    return env.storage_has_key(key) === 1n;
}
exports.storageHasKeyRaw = storageHasKeyRaw;
/**
 * Checks for the existance of a value under the provided utf-8 string key in NEAR storage.
 *
 * @param key - The utf-8 string key to check for in storage.
 */
function storageHasKey(key) {
    return storageHasKeyRaw((0, utils_1.encode)(key));
}
exports.storageHasKey = storageHasKey;
/**
 * Get the last written or removed value from NEAR storage.
 */
function storageGetEvictedRaw() {
    return env.read_register(EVICTED_REGISTER);
}
exports.storageGetEvictedRaw = storageGetEvictedRaw;
/**
 * Get the last written or removed value from NEAR storage as utf-8 string.
 */
function storageGetEvicted() {
    return (0, utils_1.decode)(storageGetEvictedRaw());
}
exports.storageGetEvicted = storageGetEvicted;
/**
 * Returns the current accounts NEAR storage usage.
 */
function storageUsage() {
    return env.storage_usage();
}
exports.storageUsage = storageUsage;
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
    return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
exports.storageWriteRaw = storageWriteRaw;
/**
 * Writes the provided utf-8 string to NEAR storage under the provided key.
 *
 * @param key - The utf-8 string key under which to store the value.
 * @param value - The utf-8 string value to store.
 */
function storageWrite(key, value) {
    return storageWriteRaw((0, utils_1.encode)(key), (0, utils_1.encode)(value));
}
exports.storageWrite = storageWrite;
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
function storageRemoveRaw(key) {
    return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}
exports.storageRemoveRaw = storageRemoveRaw;
/**
 * Removes the value of the provided utf-8 string key from NEAR storage.
 *
 * @param key - The utf-8 string key to be removed.
 */
function storageRemove(key) {
    return storageRemoveRaw((0, utils_1.encode)(key));
}
exports.storageRemove = storageRemove;
/**
 * Returns the cost of storing 0 Byte on NEAR storage.
 */
function storageByteCost() {
    return 10000000000000000000n;
}
exports.storageByteCost = storageByteCost;
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
    env.input(0);
    return env.read_register(0);
}
exports.inputRaw = inputRaw;
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
    return (0, utils_1.decode)(inputRaw());
}
exports.input = input;
/**
 * Returns the value from the NEAR WASM virtual machine.
 *
 * @param value - The value to return.
 */
function valueReturnRaw(value) {
    env.value_return(value);
}
exports.valueReturnRaw = valueReturnRaw;
/**
 * Returns the utf-8 string value from the NEAR WASM virtual machine.
 *
 * @param value - The utf-8 string value to return.
 */
function valueReturn(value) {
    valueReturnRaw((0, utils_1.encode)(value));
}
exports.valueReturn = valueReturn;
/**
 * Returns a random string of bytes.
 */
function randomSeed() {
    env.random_seed(0);
    return env.read_register(0);
}
exports.randomSeed = randomSeed;
/**
 * Create a NEAR promise call to a contract on the blockchain.
 *
 * @param accountId - The account ID of the target contract.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR attached to the call.
 * @param gas - The amount of Gas attached to the call.
 */
function promiseCreateRaw(accountId, methodName, args, amount, gas) {
    return env.promise_create(accountId, methodName, args, amount, gas);
}
exports.promiseCreateRaw = promiseCreateRaw;
/**
 * Create a NEAR promise call to a contract on the blockchain.
 *
 * @param accountId - The account ID of the target contract.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR attached to the call.
 * @param gas - The amount of Gas attached to the call.
 */
function promiseCreate(accountId, methodName, args, amount, gas) {
    return promiseCreateRaw(accountId, methodName, (0, utils_1.encode)(args), amount, gas);
}
exports.promiseCreate = promiseCreate;
/**
 * Attach a callback NEAR promise to be executed after a provided promise.
 *
 * @param promiseIndex - The promise after which to call the callback.
 * @param accountId - The account ID of the contract to perform the callback on.
 * @param methodName - The name of the method to call.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseThenRaw(promiseIndex, accountId, methodName, args, amount, gas) {
    return env.promise_then(promiseIndex, accountId, methodName, args, amount, gas);
}
exports.promiseThenRaw = promiseThenRaw;
/**
 * Attach a callback NEAR promise to be executed after a provided promise.
 *
 * @param promiseIndex - The promise after which to call the callback.
 * @param accountId - The account ID of the contract to perform the callback on.
 * @param methodName - The name of the method to call.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseThen(promiseIndex, accountId, methodName, args, amount, gas) {
    return promiseThenRaw(promiseIndex, accountId, methodName, (0, utils_1.encode)(args), amount, gas);
}
exports.promiseThen = promiseThen;
/**
 * Join an arbitrary array of NEAR promises.
 *
 * @param promiseIndexes - An arbitrary array of NEAR promise indexes to join.
 */
function promiseAnd(...promiseIndexes) {
    return env.promise_and(...promiseIndexes);
}
exports.promiseAnd = promiseAnd;
/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 */
function promiseBatchCreate(accountId) {
    return env.promise_batch_create(accountId);
}
exports.promiseBatchCreate = promiseBatchCreate;
/**
 * Attach a callback NEAR promise to a batch of NEAR promise actions.
 *
 * @param promiseIndex - The NEAR promise index of the batch.
 * @param accountId - The account ID of the target contract.
 */
function promiseBatchThen(promiseIndex, accountId) {
    return env.promise_batch_then(promiseIndex, accountId);
}
exports.promiseBatchThen = promiseBatchThen;
/**
 * Attach a create account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a create account action to.
 */
function promiseBatchActionCreateAccount(promiseIndex) {
    env.promise_batch_action_create_account(promiseIndex);
}
exports.promiseBatchActionCreateAccount = promiseBatchActionCreateAccount;
/**
 * Attach a deploy contract promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a deploy contract action to.
 * @param code - The WASM byte code of the contract to be deployed.
 */
function promiseBatchActionDeployContract(promiseIndex, code) {
    env.promise_batch_action_deploy_contract(promiseIndex, code);
}
exports.promiseBatchActionDeployContract = promiseBatchActionDeployContract;
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseBatchActionFunctionCallRaw(promiseIndex, methodName, args, amount, gas) {
    env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
}
exports.promiseBatchActionFunctionCallRaw = promiseBatchActionFunctionCallRaw;
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
    promiseBatchActionFunctionCallRaw(promiseIndex, methodName, (0, utils_1.encode)(args), amount, gas);
}
exports.promiseBatchActionFunctionCall = promiseBatchActionFunctionCall;
/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 */
function promiseBatchActionTransfer(promiseIndex, amount) {
    env.promise_batch_action_transfer(promiseIndex, amount);
}
exports.promiseBatchActionTransfer = promiseBatchActionTransfer;
/**
 * Attach a stake promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a stake action to.
 * @param amount - The amount of NEAR to stake.
 * @param publicKey - The public key with which to stake.
 */
function promiseBatchActionStake(promiseIndex, amount, publicKey) {
    env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}
exports.promiseBatchActionStake = promiseBatchActionStake;
/**
 * Attach a add full access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add full access key action to.
 * @param publicKey - The public key to add as a full access key.
 * @param nonce - The nonce to use.
 */
function promiseBatchActionAddKeyWithFullAccess(promiseIndex, publicKey, nonce) {
    env.promise_batch_action_add_key_with_full_access(promiseIndex, publicKey, nonce);
}
exports.promiseBatchActionAddKeyWithFullAccess = promiseBatchActionAddKeyWithFullAccess;
/**
 * Attach a add access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add access key action to.
 * @param publicKey - The public key to add.
 * @param nonce - The nonce to use.
 * @param allowance - The allowance of the access key.
 * @param receiverId - The account ID of the receiver.
 * @param methodNames - The names of the method to allow the key for.
 */
function promiseBatchActionAddKeyWithFunctionCall(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames) {
    env.promise_batch_action_add_key_with_function_call(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames);
}
exports.promiseBatchActionAddKeyWithFunctionCall = promiseBatchActionAddKeyWithFunctionCall;
/**
 * Attach a delete key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete key action to.
 * @param publicKey - The public key to delete.
 */
function promiseBatchActionDeleteKey(promiseIndex, publicKey) {
    env.promise_batch_action_delete_key(promiseIndex, publicKey);
}
exports.promiseBatchActionDeleteKey = promiseBatchActionDeleteKey;
/**
 * Attach a delete account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete account action to.
 * @param beneficiaryId - The account ID of the beneficiary - the account that receives the remaining amount of NEAR.
 */
function promiseBatchActionDeleteAccount(promiseIndex, beneficiaryId) {
    env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}
exports.promiseBatchActionDeleteAccount = promiseBatchActionDeleteAccount;
/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 */
function promiseBatchActionFunctionCallWeightRaw(promiseIndex, methodName, args, amount, gas, weight) {
    env.promise_batch_action_function_call_weight(promiseIndex, methodName, args, amount, gas, weight);
}
exports.promiseBatchActionFunctionCallWeightRaw = promiseBatchActionFunctionCallWeightRaw;
/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 */
function promiseBatchActionFunctionCallWeight(promiseIndex, methodName, args, amount, gas, weight) {
    promiseBatchActionFunctionCallWeightRaw(promiseIndex, methodName, (0, utils_1.encode)(args), amount, gas, weight);
}
exports.promiseBatchActionFunctionCallWeight = promiseBatchActionFunctionCallWeight;
/**
 * The number of promise results available.
 */
function promiseResultsCount() {
    return env.promise_results_count();
}
exports.promiseResultsCount = promiseResultsCount;
/**
 * Returns the result of the NEAR promise for the passed promise index.
 *
 * @param promiseIndex - The index of the promise to return the result for.
 */
function promiseResultRaw(promiseIndex) {
    const status = env.promise_result(promiseIndex, 0);
    (0, utils_1.assert)(Number(status) === types_1.PromiseResult.Successful, `Promise result ${status == types_1.PromiseResult.Failed
        ? "Failed"
        : status == types_1.PromiseResult.NotReady
            ? "NotReady"
            : status}`);
    return env.read_register(0);
}
exports.promiseResultRaw = promiseResultRaw;
/**
 * Returns the result of the NEAR promise for the passed promise index as utf-8 string
 *
 * @param promiseIndex - The index of the promise to return the result for.
 */
function promiseResult(promiseIndex) {
    return (0, utils_1.decode)(promiseResultRaw(promiseIndex));
}
exports.promiseResult = promiseResult;
/**
 * Executes the promise in the NEAR WASM virtual machine.
 *
 * @param promiseIndex - The index of the promise to execute.
 */
function promiseReturn(promiseIndex) {
    env.promise_return(promiseIndex);
}
exports.promiseReturn = promiseReturn;
/**
 * Returns sha256 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
function sha256(value) {
    env.sha256(value, 0);
    return env.read_register(0);
}
exports.sha256 = sha256;
/**
 * Returns keccak256 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
function keccak256(value) {
    env.keccak256(value, 0);
    return env.read_register(0);
}
exports.keccak256 = keccak256;
/**
 * Returns keccak512 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
function keccak512(value) {
    env.keccak512(value, 0);
    return env.read_register(0);
}
exports.keccak512 = keccak512;
/**
 * Returns ripemd160 hash of given value
 * @param value - value to be hashed, in Bytes
 * @returns hash result in Bytes
 */
function ripemd160(value) {
    env.ripemd160(value, 0);
    return env.read_register(0);
}
exports.ripemd160 = ripemd160;
/**
 * Recovers an ECDSA signer address from a 32-byte message hash and a corresponding
 * signature along with v recovery byte. Takes in an additional flag to check for
 * malleability of the signature which is generally only ideal for transactions.
 *
 * @param hash - 32-byte message hash
 * @param sig - signature
 * @param v - number of recovery byte
 * @param malleabilityFlag - whether to check malleability
 * @returns 64 bytes representing the public key if the recovery was successful.
 */
function ecrecover(hash, sig, v, malleabilityFlag) {
    const returnValue = env.ecrecover(hash, sig, v, malleabilityFlag, 0);
    if (returnValue === 0n) {
        return null;
    }
    return env.read_register(0);
}
exports.ecrecover = ecrecover;
// NOTE: "env.panic(msg)" is not exported, use "throw Error(msg)" instead
/**
 * Panic the transaction execution with given message
 * @param msg - panic message in raw bytes, which should be a valid UTF-8 sequence
 */
function panicUtf8(msg) {
    env.panic_utf8(msg);
}
exports.panicUtf8 = panicUtf8;
/**
 * Log the message in transaction logs
 * @param msg - message in raw bytes, which should be a valid UTF-8 sequence
 */
function logUtf8(msg) {
    env.log_utf8(msg);
}
exports.logUtf8 = logUtf8;
/**
 * Log the message in transaction logs
 * @param msg - message in raw bytes, which should be a valid UTF-16 sequence
 */
function logUtf16(msg) {
    env.log_utf16(msg);
}
exports.logUtf16 = logUtf16;
/**
 * Returns the number of staked NEAR of given validator, in yoctoNEAR
 * @param accountId - validator's AccountID
 * @returns - staked amount
 */
function validatorStake(accountId) {
    return env.validator_stake(accountId);
}
exports.validatorStake = validatorStake;
/**
 * Returns the number of staked NEAR of all validators, in yoctoNEAR
 * @returns total staked amount
 */
function validatorTotalStake() {
    return env.validator_total_stake();
}
exports.validatorTotalStake = validatorTotalStake;
/**
 * Computes multiexp on alt_bn128 curve using Pippenger's algorithm \sum_i
 * mul_i g_{1 i} should be equal result.
 *
 * @param value - equence of (g1:G1, fr:Fr), where
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq.
 * `value` is encoded as packed, little-endian
 * `[((u256, u256), u256)]` slice.
 *
 * @returns multi exp sum
 */
function altBn128G1Multiexp(value) {
    env.alt_bn128_g1_multiexp(value, 0);
    return env.read_register(0);
}
exports.altBn128G1Multiexp = altBn128G1Multiexp;
/**
 * Computes sum for signed g1 group elements on alt_bn128 curve \sum_i
 * (-1)^{sign_i} g_{1 i} should be equal result.
 *
 * @param value - sequence of (sign:bool, g1:G1), where
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq.
 * value` is encoded a as packed, little-endian
 * `[((u256, u256), ((u256, u256), (u256, u256)))]` slice.
 *
 * @returns sum over Fq.
 */
function altBn128G1Sum(value) {
    env.alt_bn128_g1_sum(value, 0);
    return env.read_register(0);
}
exports.altBn128G1Sum = altBn128G1Sum;
/**
 * Computes pairing check on alt_bn128 curve.
 * \sum_i e(g_{1 i}, g_{2 i}) should be equal one (in additive notation), e(g1, g2) is Ate pairing
 *
 * @param value - sequence of (g1:G1, g2:G2), where
 * G2 is Fr-ordered subgroup point (x:Fq2, y:Fq2) on alt_bn128 twist,
 * alt_bn128 twist is Y^2 = X^3 + 3/(i+9) curve over Fq2
 * Fq2 is complex field element (re: Fq, im: Fq)
 * G1 is point (x:Fq, y:Fq) on alt_bn128,
 * alt_bn128 is Y^2 = X^3 + 3 curve over Fq
 * `value` is encoded a as packed, little-endian
 * `[((u256, u256), ((u256, u256), (u256, u256)))]` slice.
 *
 * @returns whether pairing check pass
 */
function altBn128PairingCheck(value) {
    return env.alt_bn128_pairing_check(value) === 1n;
}
exports.altBn128PairingCheck = altBn128PairingCheck;
