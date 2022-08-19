import ConsoleLog from '@winkgroup/console-log';
import { Namespace, Server as IOServer } from 'socket.io';
import { LocalStorageInfo, LocalStorageInputOptions, LocalStorageLsOptions, StorageFile, StorageFileAndStorage } from './commons';
interface LocalStorageDfResult {
    total: number;
    used: number;
    available: number;
}
export default class LocalStorage {
    protected _basePath: string;
    protected _isAccessible: boolean;
    protected lastAccessibilityCheck: number;
    protected _name: string;
    consoleLog: ConsoleLog;
    static listMap: {
        [key: string]: LocalStorage;
    };
    static consoleLog: ConsoleLog;
    protected static io?: Namespace;
    get basePath(): string;
    set basePath(basePath: string);
    get isAccessible(): boolean;
    get name(): string;
    set name(name: string);
    constructor(basePath: string, inputOptions?: Partial<LocalStorageInputOptions>);
    accessibilityCheck(force?: boolean): boolean;
    protected df(): Promise<LocalStorageDfResult>;
    protected onlyIfAccessible(functionName: string): boolean;
    getInfo(): Promise<LocalStorageInfo>;
    getInfoStr(): Promise<string>;
    play(filePath: string): void;
    revealInFinder(directory?: string): void;
    getFile(filePath: string, inputOptions?: Partial<LocalStorageLsOptions>): StorageFile | null;
    find(filePath: string, inputOptions?: Partial<LocalStorageLsOptions>, parent?: string): StorageFile | null;
    ls(directory: string, inputOptions?: Partial<LocalStorageLsOptions>): StorageFile[];
    exists(filePath: string): boolean;
    fullPath(filePath: string): string;
    static get list(): LocalStorage[];
    static getInfo(): Promise<LocalStorageInfo[]>;
    static printInfo(): Promise<void>;
    static getByName(name: string): LocalStorage | null;
    static getBestName(): Promise<string | null>;
    static getFiles(filePath: string, inputOptions?: Partial<LocalStorageLsOptions>): StorageFileAndStorage[];
    protected static play(fullPath: string, consoleLog?: ConsoleLog): Promise<void>;
    protected static revealInFinder(fullPath: string, consoleLog?: ConsoleLog): Promise<void>;
    static setIoServer(ioServer?: IOServer): void;
}
export {};
