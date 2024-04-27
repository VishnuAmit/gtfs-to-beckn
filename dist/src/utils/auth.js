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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.verifyMessage = exports.createAuthorizationHeader = exports.signMessage = exports.createSigningString = exports.combineURLs = exports.createKeyPair = void 0;
const libsodium_wrappers_1 = __importStar(require("libsodium-wrappers"));
const axios = require('axios').default;
const { config } = require('../../config/config');
const Subscribers_model_1 = require("../db/models/Subscribers.model");
const key_1 = __importDefault(require("../../config/key"));
const createKeyPair = () => __awaiter(void 0, void 0, void 0, function* () {
    yield libsodium_wrappers_1.default.ready;
    const sodium = libsodium_wrappers_1.default;
    let { publicKey, privateKey } = sodium.crypto_sign_keypair();
    const publicKey_base64 = sodium.to_base64(publicKey, libsodium_wrappers_1.base64_variants.ORIGINAL);
    const privateKey_base64 = sodium.to_base64(privateKey, libsodium_wrappers_1.base64_variants.ORIGINAL);
    key_1.default.set('public_key', publicKey_base64);
    key_1.default.set('private_key', privateKey_base64);
    key_1.default.save(0);
    console.log("Key pair created");
});
exports.createKeyPair = createKeyPair;
function combineURLs(baseURL, relativeURL) {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}
exports.combineURLs = combineURLs;
const createSigningString = (message, created, expires) => __awaiter(void 0, void 0, void 0, function* () {
    if (!created)
        created = Math.floor(new Date().getTime() / 1000).toString();
    if (!expires)
        expires = (parseInt(created) + (1 * 60 * 60)).toString(); //Add required time to create expired
    //const digest = createBlakeHash('blake512').update(JSON.stringify(message)).digest("base64");
    //const digest = blake2.createHash('blake2b', { digestLength: 64 }).update(Buffer.from(message)).digest("base64");
    yield libsodium_wrappers_1.default.ready;
    const sodium = libsodium_wrappers_1.default;
    const digest = sodium.crypto_generichash(64, sodium.from_string(message));
    const digest_base64 = sodium.to_base64(digest, libsodium_wrappers_1.base64_variants.ORIGINAL);
    const signing_string = `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`;
    return { signing_string, expires, created };
});
exports.createSigningString = createSigningString;
const signMessage = (signing_string, privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    yield libsodium_wrappers_1.default.ready;
    const sodium = libsodium_wrappers_1.default;
    const signedMessage = sodium.crypto_sign_detached(signing_string, sodium.from_base64(privateKey, libsodium_wrappers_1.base64_variants.ORIGINAL));
    return sodium.to_base64(signedMessage, libsodium_wrappers_1.base64_variants.ORIGINAL);
});
exports.signMessage = signMessage;
const createAuthorizationHeader = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { signing_string, expires, created } = yield (0, exports.createSigningString)(JSON.stringify(message));
    console.log((_a = message === null || message === void 0 ? void 0 : message.context) === null || _a === void 0 ? void 0 : _a.transaction_id, "Signing string: ", signing_string);
    const signature = yield (0, exports.signMessage)(signing_string, process.env.sign_private_key || "");
    const subscriber_id = config.bpp_id;
    const header = `Signature keyId="${subscriber_id}|${config.unique_key_id}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;
    return header;
});
exports.createAuthorizationHeader = createAuthorizationHeader;
const verifyMessage = (signedString, signingString, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield libsodium_wrappers_1.default.ready;
        const sodium = libsodium_wrappers_1.default;
        return sodium.crypto_sign_verify_detached(sodium.from_base64(signedString, libsodium_wrappers_1.base64_variants.ORIGINAL), signingString, sodium.from_base64(publicKey, libsodium_wrappers_1.base64_variants.ORIGINAL));
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.verifyMessage = verifyMessage;
const remove_quotes = (value) => {
    if (value.length >= 2 && value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') {
        value = value.substring(1, value.length - 1);
    }
    return value;
};
const split_auth_header_space = (auth_header) => {
    const header = auth_header.replace('Signature ', '');
    let re = /\s*([^=]+)=\"([^"]+)"/g;
    let m;
    let parts = {};
    while ((m = re.exec(header)) !== null) {
        if (m) {
            parts[m[1]] = m[2];
        }
    }
    return parts;
};
const split_auth_header = (auth_header) => {
    const header = auth_header.replace('Signature ', '');
    let re = /\s*([^=]+)=([^,]+)[,]?/g;
    let m;
    let parts = {};
    while ((m = re.exec(header)) !== null) {
        if (m) {
            parts[m[1]] = remove_quotes(m[2]);
        }
    }
    return parts;
};
const verifyHeader = (header, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        const parts = split_auth_header(header);
        if (!parts || Object.keys(parts).length === 0) {
            throw (new Error("Header parsing failed"));
        }
        var [subscriber_id, unique_key_id] = parts['keyId'].split('|');
        const subscriber_details = yield lookupRegistry(subscriber_id, unique_key_id);
        const public_key = subscriber_details.signing_public_key;
        const subscriber_url = subscriber_details.subscriber_url;
        const subscriber_type = subscriber_details.type.toLowerCase();
        req.subscriber_type = subscriber_type;
        req.subscriber_url = subscriber_url;
        console.log((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.context) === null || _c === void 0 ? void 0 : _c.transaction_id, "Received key:", public_key);
        const { signing_string } = yield (0, exports.createSigningString)(req.rawBody, parts['created'], parts['expires']);
        const verified = yield (0, exports.verifyMessage)(parts['signature'], signing_string, public_key);
        if (!verified) {
            const sub = yield Subscribers_model_1.Subscribers.findByPk(parts['keyId'].split('|')[0]);
            if (sub) {
                sub.destroy();
            }
        }
        return verified;
    }
    catch (error) {
        console.log((_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.context) === null || _e === void 0 ? void 0 : _e.transaction_id, error.message);
        return false;
    }
});
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    try {
        console.log("\nNew Request txn_id", (_g = (_f = req.body) === null || _f === void 0 ? void 0 : _f.context) === null || _g === void 0 ? void 0 : _g.transaction_id);
        if ((_j = (_h = req.body) === null || _h === void 0 ? void 0 : _h.context) === null || _j === void 0 ? void 0 : _j.bap_id) {
            console.log((_l = (_k = req.body) === null || _k === void 0 ? void 0 : _k.context) === null || _l === void 0 ? void 0 : _l.transaction_id, "Request from", req.body.context.bap_id);
        }
        const auth_header = req.headers['authorization'] || "";
        const proxy_header = req.headers['proxy-authorization'] || "";
        if (config.auth) {
            var verified = yield verifyHeader(auth_header, req);
            var verified_proxy = proxy_header ? yield verifyHeader(proxy_header, req) : true;
            console.log((_o = (_m = req.body) === null || _m === void 0 ? void 0 : _m.context) === null || _o === void 0 ? void 0 : _o.transaction_id, "Verification status:", verified, "Proxy verification:", verified_proxy);
            if (!verified || !verified_proxy) {
                throw Error("Header verification failed");
            }
        }
        next();
    }
    catch (e) {
        console.log((_q = (_p = req.body) === null || _p === void 0 ? void 0 : _p.context) === null || _q === void 0 ? void 0 : _q.transaction_id, e.message);
        res.status(401).send('Authentication failed');
    }
});
exports.auth = auth;
const lookupRegistry = (subscriber_id, unique_key_id) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriber_details = yield Subscribers_model_1.Subscribers.findByPk(subscriber_id);
    if (subscriber_details) {
        if (subscriber_details.valid_until > new Date()) {
            console.log("Found subscriber details in cache");
            return subscriber_details;
        }
        else {
            subscriber_details.destroy();
        }
    }
    try {
        const header = yield (0, exports.createAuthorizationHeader)({ subscriber_id });
        const axios_config = {
            headers: {
                Authorization: header
            }
        };
        console.log("Calling", combineURLs(config.registry_url, '/lookup'), { subscriber_id, unique_key_id });
        const response = yield axios.post(combineURLs(config.registry_url, '/lookup'), { subscriber_id, unique_key_id });
        if (response.data) {
            if (response.data.length === 0) {
                throw (new Error("Subscriber not found"));
            }
            const { subscriber_id, subscriber_url, signing_public_key, type, valid_until } = response.data[0];
            Subscribers_model_1.Subscribers.create({ subscriber_id, subscriber_url, signing_public_key, type, valid_until });
        }
        return response.data[0];
    }
    catch (error) {
        console.log(error);
        console.log(error.message);
        throw (new Error("Registry lookup error"));
    }
});
const getPublicKey = (subscriber_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = yield (0, exports.createAuthorizationHeader)({ subscriber_id });
        const axios_config = {
            headers: {
                Authorization: header
            }
        };
        const response = yield axios.post(combineURLs(config.registry_url, '/lookup'), { subscriber_id }, axios_config);
        return response.data.signing_public_key;
    }
    catch (error) {
        console.log(error);
    }
});
