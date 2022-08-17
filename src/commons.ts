export type LocalStorageFileType = 'file' | 'directory'

export interface LocalStorageFile {
    name: string
    type: LocalStorageFileType
    bytes?: number
    children?: LocalStorageFile[],
    createdAt?: string
    updatedAt?: string
}

export function getBytesByChildren(dir:LocalStorageFile) {
    if (dir.type === 'file') return dir.bytes !== undefined ? dir.bytes : false
    let bytes = 0
    if (dir.children) {
        for(const file of dir.children) {
            const childBytes = getBytesByChildren(file)
            if (childBytes === false) return false
            bytes += childBytes
        }
    }
    return bytes
}

export interface LocalStorageInfo {
    name: string
    basePath: string
    isAccessible: boolean
    storage?: {
        freeBytes: number
        totalBytes: number
    }
}

export interface LocalStorageLsOptions {
    recursive: boolean
    returnFullPaths: boolean
    noDSStore: boolean
}

export interface LocalStorageInputOptions {
    name: string
    addToList: boolean
}

export interface StoragePath {
    type: 'mega' | 'local'
    name: string
    path: string
}

export interface StorageHost {
    host: string
    type: 'mega' | 'local'
}

export interface StorageFullName extends StorageHost{
    name: string
}

export interface StorageEndpoint extends StoragePath, StorageFullName {
}

export function strStorageEndpoint(endpoint:StorageEndpoint) {
    return `${endpoint.name}:${endpoint.path} @ ${endpoint.host}`
}

export function strStorageFullName(fullName:StorageFullName) {
    return `${fullName.name} @ ${fullName.host}`
}

export function strStoragePath(path:StoragePath) {
    return `${path.name}:${path.path} (${path.type})`
}