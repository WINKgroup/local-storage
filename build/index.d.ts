import ConsoleLog from '@winkgroup/console-log';
import CronManager from '@winkgroup/cron';
import { Namespace, Server as IOServer } from 'socket.io';
import { LocalStorageFile, LocalStorageInfo, LocalStorageInputOptions, LocalStorageLsOptions } from './commons';
interface LocalStorageDfResult {
    total: number;
    used: number;
    available: number;
}
export default class LocalStorage {
    protected _basePath: string;
    protected _isAccessible: boolean;
    protected _name: string;
    consoleLog: ConsoleLog;
    static listMap: {
        [key: string]: LocalStorage;
    };
    static consoleLog: ConsoleLog;
    protected static cronManager: CronManager;
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
    play(filePath: string): void;
    ls(directory: string, inputOptions?: Partial<LocalStorageLsOptions>): LocalStorageFile[];
    exists(filePath: string): boolean;
    fullPath(filePath: string): string;
    static get list(): LocalStorage[];
    static getInfo(): Promise<LocalStorageInfo[]>;
    static getByName(name: string): LocalStorage | null;
    protected static play(fullPath: string, consoleLog?: ConsoleLog): Promise<void>;
    static cron(): void;
    static setIoServer(ioServer?: IOServer): void;
}
export {};
