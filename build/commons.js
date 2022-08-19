"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foldStoragesByType = exports.getBytesByChildren = exports.strStoragePath = exports.strStorageFullName = exports.strStorageEndpoint = void 0;
function strStorageEndpoint(endpoint) {
    return "".concat(endpoint.storage.name, ":").concat(endpoint.name, " @ ").concat(endpoint.storage.host);
}
exports.strStorageEndpoint = strStorageEndpoint;
function strStorageFullName(fullName) {
    return "".concat(fullName.name, " @ ").concat(fullName.host);
}
exports.strStorageFullName = strStorageFullName;
function strStoragePath(path) {
    return "".concat(path.storage.name, ":").concat(path.name, " (").concat(path.storage.type, ")");
}
exports.strStoragePath = strStoragePath;
function getBytesByChildren(dir) {
    if (dir.type === 'file')
        return dir.bytes !== undefined ? dir.bytes : false;
    var bytes = 0;
    if (dir.children) {
        for (var _i = 0, _a = dir.children; _i < _a.length; _i++) {
            var file = _a[_i];
            var childBytes = getBytesByChildren(file);
            if (childBytes === false)
                return false;
            bytes += childBytes;
        }
    }
    return bytes;
}
exports.getBytesByChildren = getBytesByChildren;
function foldStoragesByType(list) {
    var folded = {};
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var storage = list_1[_i];
        var type = storage.storage.type;
        if (!folded[type])
            folded[type] = [];
        folded[type].push(storage);
    }
    return folded;
}
exports.foldStoragesByType = foldStoragesByType;
