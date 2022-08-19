export type StorageFileType = 'file' | 'directory'

export interface StorageFile {
    name: string
    type: StorageFileType
    versions?: number
    bytes?: number
    children?: StorageFile[],
    createdAt?: string
    updatedAt?: string
}

export type StorageType = 'mega' | 'local'

export interface StorageName {
    name: string
    type: StorageType
}

export interface StorageFullName extends StorageName {
    host: string
}

export interface StorageFilePath {
    name: string
    storage: StorageName
}

export interface StorageFileAndStorage extends StorageFilePath, StorageFile {
} 

export interface StorageEndpoint {
    name: string
    storage: StorageFullName
}

export interface StorageEndpointFile extends StorageEndpoint, StorageFile {
}

export interface StorageFileTransfer {
    source: StorageEndpoint
    destination: StorageEndpoint
    bytes: number
    totalBytes: number
    percentage: number
}

export type FileTransferState = 'to do' | 'in progress' | 'done'

export interface FileTransfer {
    state: FileTransferState
    endpoint: StorageEndpoint
    bytes?: number
    percentage?: number
}

export function strStorageEndpoint(endpoint:StorageEndpoint) {
    return `${endpoint.storage.name}:${endpoint.name} @ ${endpoint.storage.host}`
}

export function strStorageFullName(fullName:StorageFullName) {
    return `${fullName.name} @ ${fullName.host}`
}

export function strStoragePath(path:StorageFilePath) {
    return `${path.storage.name}:${path.name} (${path.storage.type})`
}

export function getBytesByChildren(dir:StorageFile) {
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