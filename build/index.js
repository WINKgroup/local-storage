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
var cron_1 = __importDefault(require("@winkgroup/cron"));
var env_1 = __importDefault(require("@winkgroup/env"));
var error_manager_1 = __importDefault(require("@winkgroup/error-manager"));
var diskusage_ng_1 = __importDefault(require("diskusage-ng"));
var express_1 = __importDefault(require("express"));
var express_jwt_1 = require("express-jwt");
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
var path_1 = __importDefault(require("path"));
var LocalStorage = /** @class */ (function () {
    function LocalStorage(basePath, inputOptions) {
        this._isAccessible = false;
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
        if (this._isAccessible && !force)
            return true;
        var previousState = this._isAccessible;
        this._isAccessible = fs_1.default.existsSync(this._basePath);
        if (previousState !== this._isAccessible) {
            if (this._isAccessible)
                this.consoleLog.print('now accessible!');
            else
                this.consoleLog.print('not accessible anymore');
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
    LocalStorage.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var usage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.df()];
                    case 1:
                        usage = _a.sent();
                        return [2 /*return*/, {
                                freeBytes: usage.available,
                                totalBytes: usage.total,
                                basePath: this._basePath
                            }];
                }
            });
        });
    };
    LocalStorage.prototype.play = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path_1.default.join(this._basePath, filePath);
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
                        this.consoleLog.error(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LocalStorage.prototype.ls = function (directory, inputOptions) {
        var options = lodash_1.default.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        });
        var list = fs_1.default.readdirSync(path_1.default.join(this._basePath, directory));
        var result = [];
        var _loop_1 = function (filename) {
            if (filename === '.DS_Store' && options.noDSStore)
                return "continue";
            var stat = fs_1.default.statSync(path_1.default.join(this_1._basePath, directory, filename));
            var type = '';
            if (stat.isFile())
                type = 'file';
            else if (stat.isDirectory())
                type = 'directory';
            if (!type)
                throw new Error("unrecognized type for file ".concat(filename, " in ").concat(this_1._basePath, " local storage"));
            if (type === 'directory' && options.recursive) {
                var subList = this_1.ls(path_1.default.join(directory, filename), options);
                if (!options.returnFullPaths)
                    subList = subList.map(function (file) {
                        return __assign(__assign({}, file), { name: path_1.default.join(filename, file.name) });
                    });
                result = result.concat(subList);
            }
            result.push({
                name: options.returnFullPaths ? path_1.default.join(directory, filename) : filename,
                bytes: stat.size,
                type: type
            });
        };
        var this_1 = this;
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var filename = list_1[_i];
            _loop_1(filename);
        }
        return result;
    };
    Object.defineProperty(LocalStorage, "list", {
        get: function () {
            return Object.values(this.listMap);
        },
        enumerable: false,
        configurable: true
    });
    LocalStorage.cron = function () {
        if (!this.cronManager.tryStartRun())
            return;
        this.list.map(function (storage) { return storage.isAccessible; });
        this.cronManager.runCompleted();
    };
    LocalStorage.getRouter = function (protectEndpoints) {
        var _this = this;
        if (protectEndpoints === void 0) { protectEndpoints = true; }
        var router = express_1.default.Router();
        router.use(express_1.default.json());
        if (protectEndpoints) {
            router.use((0, express_jwt_1.expressjwt)({
                secret: env_1.default.get('JWT_SECRET'),
                algorithms: ['RS256', 'HS256']
            }));
            router.use(function (err, req, res, next) {
                if (err.name === 'UnauthorizedError') {
                    console.error(err);
                    res.status(err.status).send(err.message);
                    return;
                }
                next();
            });
        }
        router.get('/names', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var names;
            return __generator(this, function (_a) {
                try {
                    names = Object.keys(this.listMap);
                    res.json(names);
                }
                catch (e) {
                    error_manager_1.default.sender(e, res);
                }
                return [2 /*return*/];
            });
        }); });
        router.get('/:name/df', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var repo, result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        repo = this.listMap[req.params.name];
                        if (!repo)
                            throw new Error("local storage \"".concat(req.params.name, "\" not found"));
                        return [4 /*yield*/, repo.df()];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        error_manager_1.default.sender(e_2, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        router.get('/:name/stats', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var repo, result, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        repo = this.listMap[req.params.name];
                        if (!repo)
                            throw new Error("local storage \"".concat(req.params.name, "\" not found"));
                        return [4 /*yield*/, repo.getStats()];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        error_manager_1.default.sender(e_3, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        router.get('/:name/:pathBase64/play', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var repo, filePath;
            return __generator(this, function (_a) {
                try {
                    repo = this.listMap[req.params.name];
                    if (!repo)
                        throw new Error("local storage \"".concat(req.params.name, "\" not found"));
                    filePath = Buffer.from(req.params.pathBase64, 'base64').toString('utf8');
                    repo.play(filePath);
                    res.json();
                }
                catch (e) {
                    error_manager_1.default.sender(e, res);
                }
                return [2 /*return*/];
            });
        }); });
        router.post('/:name/:pathBase64/materialTable', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var repo, directoryPath, result, totalCount, materialTableSearch, regExp_1, field_1, opposite_1, initialPos_1, finalPos_1;
            return __generator(this, function (_a) {
                try {
                    repo = this.listMap[req.params.name];
                    if (!repo)
                        throw new Error("local storage \"".concat(req.params.name, "\" not found"));
                    directoryPath = Buffer.from(req.params.pathBase64, 'base64').toString('utf8');
                    result = repo.ls(directoryPath);
                    totalCount = result.length;
                    materialTableSearch = req.body;
                    if (materialTableSearch.search) {
                        regExp_1 = new RegExp(materialTableSearch.search, 'i');
                        result = result.filter(function (file) { return file.name.match(regExp_1); });
                    }
                    if (materialTableSearch.orderBy) {
                        field_1 = materialTableSearch.orderBy.field;
                        opposite_1 = materialTableSearch.orderDirection !== 'desc' ? 1 : -1;
                        result.sort(function (a, b) { return a[field_1] < b[field_1] ? opposite_1 * -1 : opposite_1 * 1; });
                    }
                    initialPos_1 = materialTableSearch.pageSize * materialTableSearch.page;
                    finalPos_1 = initialPos_1 + materialTableSearch.pageSize;
                    result = result.filter(function (file, pos) { return (pos >= initialPos_1 && pos < finalPos_1); });
                    res.json({
                        data: result,
                        page: materialTableSearch.page,
                        totalCount: totalCount
                    });
                }
                catch (e) {
                    error_manager_1.default.sender(e, res);
                }
                return [2 /*return*/];
            });
        }); });
        router.get('/:name/:pathBase64/ls', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var repo, directory, result;
            return __generator(this, function (_a) {
                try {
                    repo = this.listMap[req.params.name];
                    if (!repo)
                        throw new Error("local storage \"".concat(req.params.name, "\" not found"));
                    directory = Buffer.from(req.params.pathBase64, 'base64').toString('utf8');
                    result = repo.ls(directory);
                    res.json(result);
                }
                catch (e) {
                    error_manager_1.default.sender(e, res);
                }
                return [2 /*return*/];
            });
        }); });
        return router;
    };
    LocalStorage.listMap = {};
    LocalStorage.consoleLog = new console_log_1.default({ prefix: 'LocalStorage' });
    LocalStorage.cronManager = new cron_1.default(10);
    return LocalStorage;
}());
exports.default = LocalStorage;
