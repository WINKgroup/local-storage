import ConsoleLog from '@winkgroup/console-log';
import CronManager from '@winkgroup/cron';
import { LocalStorageDfResult, LocalStorageFile, LocalStorageInputOptions, LocalStorageLsOptions } from './commons';
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
    get basePath(): string;
    set basePath(basePath: string);
    get isAccessible(): boolean;
    get name(): string;
    set name(name: string);
    constructor(basePath: string, inputOptions?: Partial<LocalStorageInputOptions>);
    accessibilityCheck(force?: boolean): boolean;
    df(): Promise<LocalStorageDfResult>;
    getStats(): Promise<{
        freeBytes: number;
        totalBytes: number;
        basePath: string;
    }>;
    play(filePath: string): Promise<void>;
    ls(directory: string, inputOptions?: Partial<LocalStorageLsOptions>): LocalStorageFile[];
    exists(filePath: string): boolean;
    static get list(): LocalStorage[];
    static cron(): void;
    static getRouter(protectEndpoints?: boolean): import("express-serve-static-core").Router;
}
