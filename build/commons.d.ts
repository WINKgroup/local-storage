export declare type StorageFileType = 'file' | 'directory';
export interface StorageFile {
    name: string;
    type: StorageFileType;
    versions?: number;
    bytes?: number;
    children?: StorageFile[];
    createdAt?: string;
    updatedAt?: string;
}
export declare type StorageType = 'mega' | 'local';
export interface StorageName {
    name: string;
    type: StorageType;
}
export interface StorageFullName extends StorageName {
    host: string;
}
export interface StorageFilePath {
    name: string;
    storage: StorageName;
}
export interface StorageFileAndStorage extends StorageFilePath, StorageFile {
}
export interface StorageEndpoint {
    name: string;
    storage: StorageFullName;
}
export interface StorageEndpointFile extends StorageEndpoint, StorageFile {
}
export interface StorageFileTransfer {
    source: StorageEndpoint;
    destination: StorageEndpoint;
    bytes: number;
    totalBytes: number;
    percentage: number;
}
export declare type FileTransferState = 'to do' | 'in progress' | 'done';
export interface FileTransfer {
    state: FileTransferState;
    endpoint: StorageEndpoint;
    bytes?: number;
    percentage?: number;
}
export declare function strStorageEndpoint(endpoint: StorageEndpoint): string;
export declare function strStorageFullName(fullName: StorageFullName): string;
export declare function strStoragePath(path: StorageFilePath): string;
export declare function getBytesByChildren(dir: StorageFile): number | false;
export declare function foldStoragesByType<Storage extends {
    storage: {
        type: StorageType;
    };
}>(list: Storage[]): {
    [key: string]: Storage[];
};
export interface LocalStorageInfo {
    name: string;
    basePath: string;
    isAccessible: boolean;
    storage?: {
        freeBytes: number;
        totalBytes: number;
    };
}
export interface LocalStorageLsOptions {
    recursive: boolean;
    returnFullPaths: boolean;
    noDSStore: boolean;
}
export interface LocalStorageInputOptions {
    name: string;
    addToList: boolean;
}
