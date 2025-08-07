"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaCloud = void 0;
var axios_1 = require("axios");
var crypto = require("crypto");
/**
 * Megacloud extractor helper constants & utils
 */
var MAIN_URL = "https://videostr.net";
// JSON with keys is hosted publicly on GitHub (same file used by Android extractor example)
var KEY_URL = "https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json";
var USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36";
/**
 * Replicates OpenSSL EVP_BytesToKey to derive key + iv from password + salt.
 */
function evpBytesToKey(password, salt, keyLen, ivLen) {
    if (keyLen === void 0) { keyLen = 32; }
    if (ivLen === void 0) { ivLen = 16; }
    var data = Buffer.alloc(0);
    var prev = Buffer.alloc(0);
    while (data.length < keyLen + ivLen) {
        var md5 = crypto.createHash("md5");
        md5.update(Buffer.concat([prev, Buffer.from(password), salt]));
        prev = md5.digest();
        data = Buffer.concat([data, prev]);
    }
    return {
        key: data.slice(0, keyLen),
        iv: data.slice(keyLen, keyLen + ivLen),
    };
}
/**
 * Decrypts an OpenSSL-compatible base64 string encrypted with AES-256-CBC.
 */
function decryptOpenSSL(encryptedB64, password) {
    var encrypted = Buffer.from(encryptedB64, "base64");
    if (!encrypted.slice(0, 8).equals(Buffer.from("Salted__"))) {
        throw new Error("Invalid OpenSSL format");
    }
    var salt = encrypted.slice(8, 16);
    var _a = evpBytesToKey(password, salt), key = _a.key, iv = _a.iv;
    var decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    var decrypted = decipher.update(encrypted.slice(16));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
}
var MegaCloud = /** @class */ (function () {
    function MegaCloud() {
    }
    MegaCloud.extract = function (url_1) {
        return __awaiter(this, arguments, void 0, function (url, referer) {
            var embedUrl, instance, result, err_1;
            if (referer === void 0) { referer = ""; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        embedUrl = new URL(url);
                        instance = new MegaCloud();
                        return [4 /*yield*/, instance.extract2(embedUrl)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                sources: result.sources,
                                tracks: result.tracks,
                            }];
                    case 2:
                        err_1 = _a.sent();
                        console.error("MegaCloud extraction error:", err_1.message);
                        return [2 /*return*/, { sources: [] }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MegaCloud.prototype.extract2 = function (embedIframeURL) {
        return __awaiter(this, void 0, void 0, function () {
            var extractedData, xrax, token, html, match, htmlErr_1, apiUrl, headers, data, keyData, password, decrypted, parsed, deErr_1, innerErr_1, err_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 15, , 16]);
                        extractedData = {
                            sources: [],
                            tracks: [],
                            t: 0,
                            server: 0,
                        };
                        xrax = embedIframeURL.pathname.split("/").pop() || "";
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 13, , 14]);
                        token = void 0;
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(embedIframeURL.href, {
                                headers: {
                                    Referer: embedIframeURL.href,
                                    "User-Agent": USER_AGENT,
                                },
                            })];
                    case 3:
                        html = (_d.sent()).data;
                        match = html.match(/\b[a-zA-Z0-9]{48}\b/);
                        token = match ? match[0] : undefined;
                        return [3 /*break*/, 5];
                    case 4:
                        htmlErr_1 = _d.sent();
                        console.warn("Failed to fetch embed page for token:", htmlErr_1.message);
                        return [3 /*break*/, 5];
                    case 5:
                        apiUrl = "".concat(MAIN_URL, "/embed-1/v3/e-1/getSources?id=").concat(xrax).concat(token ? "&_k=".concat(token) : "");
                        headers = {
                            Accept: "*/*",
                            "X-Requested-With": "XMLHttpRequest",
                            Referer: MAIN_URL,
                            "User-Agent": USER_AGENT,
                        };
                        return [4 /*yield*/, axios_1.default.get(apiUrl, { headers: headers })];
                    case 6:
                        data = (_d.sent()).data;
                        if (!data)
                            return [2 /*return*/, extractedData];
                        if (!(typeof data.sources === "string")) return [3 /*break*/, 11];
                        _d.label = 7;
                    case 7:
                        _d.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, axios_1.default.get(KEY_URL)];
                    case 8:
                        keyData = (_d.sent()).data;
                        password = (_b = (_a = keyData === null || keyData === void 0 ? void 0 : keyData.vidstr) !== null && _a !== void 0 ? _a : keyData === null || keyData === void 0 ? void 0 : keyData.rabbit) !== null && _b !== void 0 ? _b : (_c = keyData === null || keyData === void 0 ? void 0 : keyData.rabbitstream) === null || _c === void 0 ? void 0 : _c.key;
                        if (password) {
                            decrypted = decryptOpenSSL(data.sources, password);
                            parsed = JSON.parse(decrypted);
                            extractedData.sources = parsed.map(function (src) { return ({
                                file: src.file,
                                type: src.type,
                            }); });
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        deErr_1 = _d.sent();
                        console.error("Failed to decrypt/parse sources:", deErr_1.message);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (Array.isArray(data.sources)) {
                            extractedData.sources = data.sources.map(function (s) { return ({
                                file: s.file,
                                type: s.type,
                            }); });
                        }
                        _d.label = 12;
                    case 12:
                        extractedData.tracks = data.tracks || [];
                        extractedData.t = data.t || 0;
                        extractedData.server = data.server || 0;
                        return [2 /*return*/, extractedData];
                    case 13:
                        innerErr_1 = _d.sent();
                        console.error("Error in getSources: ".concat(innerErr_1.message));
                        if (innerErr_1.message.includes("UTF-8")) {
                            console.log("Handling UTF-8 error gracefully");
                            return [2 /*return*/, extractedData];
                        }
                        throw innerErr_1;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        err_2 = _d.sent();
                        console.error("MegaCloud extraction error: ".concat(err_2.message));
                        return [2 /*return*/, {
                                sources: [],
                                tracks: [],
                                t: 0,
                                server: 0,
                            }];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return MegaCloud;
}());
exports.MegaCloud = MegaCloud;
MegaCloud.extract("https://streameeeeee.site/embed-1/v3/e-1/zfdLfQlSZQyv?z=").then(function (data) {
    console.log(data);
});
