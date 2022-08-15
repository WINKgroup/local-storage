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

export interface LocalStorageLsOptions {
    recursive: boolean
    returnFullPaths: boolean
    noDSStore: boolean
}

export interface LocalStorageDfResult {
    total:number,
    used: number,
    available: number
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