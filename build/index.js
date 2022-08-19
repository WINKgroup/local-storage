"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cmd_1 = __importDefault(require("@winkgroup/cmd"));
var console_log_1 = __importDefault(require("@winkgroup/console-log"));
var env_1 = __importDefault(require("@winkgroup/env"));
var misc_1 = require("@winkgroup/misc");
var diskusage_ng_1 = __importDefault(require("diskusage-ng"));
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
var path_1 = __importDefault(require("path"));
var LocalStorage = /** @class */ (function () {
    function LocalStorage(basePath, inputOptions) {
        this._isAccessible = false;
        this.lastAccessibilityCheck = 0;
        this._name = '';
        var options = lodash_1.default.defaults(inputOptions, {
            name: '',
            addToList: false
        });
        this.consoleLog = LocalStorage.consoleLog.spawn({ id: options.name ? options.name : undefined });
        this._basePath = basePath;
        this._isAccessible = fs_1.default.existsSync(this._basePath);
        if (options.name)
            this.name = options.name;
        if (options.addToList) {
            if (!this._name)
                throw new Error('"name" option required to be added to list');
            LocalStorage.listMap[this._name] = this;
        }
    }
    Object.defineProperty(LocalStorage.prototype, "basePath", {
        get: function () { return this._basePath; },
        set: function (basePath) {
            this._basePath = basePath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorage.prototype, "isAccessible", {
        get: function () {
            return this.accessibilityCheck();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorage.prototype, "name", {
        get: function () { return this._name; },
        set: function (name) {
            this._name = name;
            if (name)
                this.consoleLog.generalOptions.id = name;
            else
                delete this.consoleLog.generalOptions.id;
        },
        enumerable: false,
        configurable: true
    });
    LocalStorage.prototype.accessibilityCheck = function (force) {
        if (force === void 0) { force = false; }
        if (!force && this._isAccessible) {
            var now = (new Date()).getTime();
            if (this.lastAccessibilityCheck > now - 60 * 1000)
                return true;
        }
        var previousState = this._isAccessible;
        this._isAccessible = fs_1.default.existsSync(this._basePath);
        if (previousState !== this._isAccessible) {
            if (LocalStorage.io)
                LocalStorage.io.emit('accessibility changed', this._name, this._isAccessible);
            if (this._isAccessible)
                this.consoleLog.print('now accessible!');
            else
                this.consoleLog.warn('not accessible anymore');
        }
        return this._isAccessible;
    };
    LocalStorage.prototype.df = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (0, diskusage_ng_1.default)(_this._basePath, function (err, usage) {
                if (err)
                    reject(err);
                resolve(usage);
            });
        });
    };
    LocalStorage.prototype.onlyIfAccessible = function (functionName) {
        if (this._isAccessible)
            return true;
        var errorMessage = "trying to run \"".concat(functionName, "\", but storage \"").concat(this._name, "\" is not accessible");
        this.consoleLog.error(errorMessage);
        if (LocalStorage.io)
            LocalStorage.io.emit('error', errorMessage);
        return false;
    };
    LocalStorage.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var info, usage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        info = {
                            name: this._name,
                            basePath: this._basePath,
                            isAccessible: this.accessibilityCheck(),
                        };
                        if (!this._isAccessible) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.df()];
                    case 1:
                        usage = _a.sent();
                        info.storage = {
                            freeBytes: usage.available,
                            totalBytes: usage.total
                        };
                        _a.label = 2;
                    case 2: return [2 /*return*/, info];
                }
            });
        });
    };
    LocalStorage.prototype.getInfoStr = function () {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if (info.isAccessible)
                            return [2 /*return*/, "".concat(info.name, " (").concat((0, misc_1.byteString)(info.storage.freeBytes), " / ").concat((0, misc_1.byteString)(info.storage.totalBytes), "):  ").concat(info.basePath)];
                        else
                            return [2 /*return*/, "".concat(info.name, " (not accessible): ").concat(info.basePath)];
                        return [2 /*return*/];
                }
            });
        });
    };
    LocalStorage.prototype.play = function (filePath) {
        if (!this.onlyIfAccessible('play'))
            return;
        var fullPath = path_1.default.join(this._basePath, filePath);
        LocalStorage.play(fullPath, this.consoleLog);
    };
    // Mac only
    LocalStorage.prototype.revealInFinder = function (directory) {
        if (directory === void 0) { directory = ''; }
        if (!this.onlyIfAccessible('revealInFinder'))
            return;
        var fullPath = path_1.default.join(this._basePath, directory);
        LocalStorage.revealInFinder(fullPath, this.consoleLog);
    };
    LocalStorage.prototype.getFile = function (filePath, inputOptions) {
        if (!this.onlyIfAccessible('getFile'))
            return null;
        var options = lodash_1.default.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        });
        var fullPath = path_1.default.join(this._basePath, filePath);
        var stat = fs_1.default.statSync(fullPath, { throwIfNoEntry: false });
        if (!stat)
            return null;
        var type = '';
        if (stat.isFile())
            type = 'file';
        else if (stat.isDirectory())
            type = 'directory';
        if (!type)
            throw new Error("unrecognized type for file ".concat(filePath, " in ").concat(this._basePath, " local storage"));
        var children = (type === 'directory' && options.recursive) ? this.ls(filePath, inputOptions) : undefined;
        var result = {
            name: options.returnFullPaths ? fullPath : filePath,
            type: type,
            bytes: stat.size,
            children: children,
            createdAt: stat.ctime.toISOString(),
            updatedAt: stat.mtime.toISOString()
        };
        return result;
    };
    LocalStorage.prototype.find = function (filePath, inputOptions, parent) {
        if (parent === void 0) { parent = ''; }
        if (!this.onlyIfAccessible('find'))
            return null;
        var options = lodash_1.default.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        });
        var list = fs_1.default.readdirSync(path_1.default.join(this._basePath, parent));
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var filename = list_1[_i];
            var searchName = path_1.default.join(parent, filename);
            if (searchName === filePath)
                return this.getFile(searchName, inputOptions);
            if (options.recursive) {
                var stat = fs_1.default.statSync(filename);
                if (stat.isDirectory()) {
                    var found = this.find(filePath, inputOptions, searchName);
                    if (found)
                        return found;
                }
            }
        }
        return null;
    };
    LocalStorage.prototype.ls = function (directory, inputOptions) {
        if (!this.onlyIfAccessible('ls'))
            return [];
        var options = lodash_1.default.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        });
        var list = fs_1.default.readdirSync(path_1.default.join(this._basePath, directory));
        var result = [];
        for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
            var filename = list_2[_i];
            if (filename === '.DS_Store' && options.noDSStore)
                continue;
            var file = this.getFile(path_1.default.join(directory, filename), inputOptions);
            if (!file)
                return [];
            result.push(file);
        }
        return result;
    };
    LocalStorage.prototype.exists = function (filePath) {
        var fullPath = path_1.default.join(this._basePath, filePath);
        return fs_1.default.existsSync(fullPath);
    };
    LocalStorage.prototype.fullPath = function (filePath) {
        return path_1.default.join(this._basePath, filePath);
    };
    Object.defineProperty(LocalStorage, "list", {
        get: function () {
            return Object.values(this.listMap);
        },
        enumerable: false,
        configurable: true
    });
    LocalStorage.getInfo = function () {
        return Promise.all(this.list.map(function (ls) { return ls.getInfo(); }));
    };
    LocalStorage.printInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var consoleLog, list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        consoleLog = new console_log_1.default({ prefix: 'LocalStorage' });
                        consoleLog.print('list info');
                        return [4 /*yield*/, Promise.all(this.list.map(function (localStorage) { return localStorage.getInfoStr(); }))];
                    case 1:
                        list = _a.sent();
                        list.map(function (info) { return console.info(info); });
                        return [2 /*return*/];
                }
            });
        });
    };
    LocalStorage.getByName = function (name) {
        var localStorage = this.listMap[name];
        if (!localStorage) {
            var errorMessage = "unable to find \"".concat(name, "\" localStorage");
            var consoleLog = new console_log_1.default({ prefix: 'LocalStorage' });
            consoleLog.error(errorMessage);
            if (this.io)
                this.io.emit('error', errorMessage);
            return null;
        }
        return localStorage;
    };
    LocalStorage.getBestName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var maxFreeBytes, storageName, info, _i, info_1, storageInfo, freeBytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxFreeBytes = 0;
                        storageName = null;
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        for (_i = 0, info_1 = info; _i < info_1.length; _i++) {
                            storageInfo = info_1[_i];
                            if (!storageInfo.isAccessible)
                                continue;
                            freeBytes = storageInfo.storage.freeBytes;
                            if (freeBytes > maxFreeBytes) {
                                maxFreeBytes = freeBytes;
                                storageName = storageInfo.name;
                            }
                        }
                        return [2 /*return*/, storageName];
                }
            });
        });
    };
    LocalStorage.getFiles = function (filePath, inputOptions) {
        var result = [];
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var localStorage_1 = _a[_i];
            if (!localStorage_1.isAccessible)
                continue;
            var found = localStorage_1.getFile(filePath, inputOptions);
            if (found)
                result.push(__assign(__assign({}, found), { storage: {
                        name: localStorage_1._name,
                        type: 'local'
                    } }));
        }
        return result;
    };
    LocalStorage.play = function (fullPath, consoleLog) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!consoleLog)
                            consoleLog = this.consoleLog;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, cmd_1.default.run(env_1.default.get('VLC_PATH', 'vlc'), {
                                args: [fullPath],
                                getResult: false,
                                timeout: 0,
                                spawnOptions: {
                                    stdio: 'ignore'
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        consoleLog.error(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LocalStorage.revealInFinder = function (fullPath, consoleLog) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!consoleLog)
                            consoleLog = this.consoleLog;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, cmd_1.default.run('open', {
                                args: [fullPath],
                                getResult: false,
                                timeout: 0,
                                spawnOptions: {
                                    stdio: 'ignore'
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        consoleLog.error(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LocalStorage.setIoServer = function (ioServer) {
        var _this = this;
        this.io = ioServer ? ioServer.of('/local-storage') : undefined;
        if (this.io) {
            this.io.on('connection', function (socket) {
                socket.on('best storage name request', function () { return __awaiter(_this, void 0, void 0, function () {
                    var name;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.getBestName()];
                            case 1:
                                name = _a.sent();
                                socket.emit('best storage name', name);
                                return [2 /*return*/];
                        }
                    });
                }); });
                socket.on('info request', function () { return __awaiter(_this, void 0, void 0, function () {
                    var list;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.getInfo()];
                            case 1:
                                list = _a.sent();
                                socket.emit('info', list);
                                return [2 /*return*/];
                        }
                    });
                }); });
                socket.on('play', function (localStorageName, path) { return __awaiter(_this, void 0, void 0, function () {
                    var localStorage;
                    return __generator(this, function (_a) {
                        localStorage = this.getByName(localStorageName);
                        if (!localStorage)
                            return [2 /*return*/];
                        localStorage.play(path);
                        return [2 /*return*/];
                    });
                }); });
                socket.on('revealInFinder', function (localStorageName, path) { return __awaiter(_this, void 0, void 0, function () {
                    var localStorage;
                    return __generator(this, function (_a) {
                        localStorage = this.getByName(localStorageName);
                        if (!localStorage)
                            return [2 /*return*/];
                        localStorage.revealInFinder(path);
                        return [2 /*return*/];
                    });
                }); });
            });
        }
    };
    LocalStorage.listMap = {};
    LocalStorage.consoleLog = new console_log_1.default({ prefix: 'LocalStorage' });
    return LocalStorage;
}());
exports.default = LocalStorage;
