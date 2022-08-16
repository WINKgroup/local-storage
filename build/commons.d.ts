export declare type LocalStorageFileType = 'file' | 'directory';
export interface LocalStorageFile {
    name: string;
    type: LocalStorageFileType;
    bytes?: number;
    children?: LocalStorageFile[];
    createdAt?: string;
    updatedAt?: string;
}
export declare function getBytesByChildren(dir: LocalStorageFile): number | false;
export interface LocalStorageLsOptions {
    recursive: boolean;
    returnFullPaths: boolean;
    noDSStore: boolean;
}
export interface LocalStorageDfResult {
    total: number;
    used: number;
    available: number;
}
export interface LocalStorageInputOptions {
    name: string;
    addToList: boolean;
}
export interface StoragePath {
    type: 'mega' | 'local';
    name: string;
    path: string;
}
export interface StorageHost {
    host: string;
    type: 'mega' | 'local';
}
export interface StorageFullName extends StorageHost {
    name: string;
}
export interface StorageEndpoint extends StoragePath, StorageFullName {
}
