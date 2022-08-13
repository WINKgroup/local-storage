import ConsoleLog from '@winkgroup/console-log';
import CronManager from '@winkgroup/cron';
import { LocalStorageDfResult, LocalStorageInputOptions } from './commons';
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
    play(filePath: string): Promise<string>;
    ls(dir: string): string[];
    static get list(): LocalStorage[];
    static cron(): void;
    static getRouter(): import("express-serve-static-core").Router;
}
