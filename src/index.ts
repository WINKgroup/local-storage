import Cmd from '@winkgroup/cmd'
import ConsoleLog from '@winkgroup/console-log'
import CronManager from '@winkgroup/cron'
import Env from '@winkgroup/env'
import diskusage from 'diskusage-ng'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { Namespace, Server as IOServer } from 'socket.io'
import { LocalStorageFile, LocalStorageFileType, LocalStorageInfo, LocalStorageInputOptions, LocalStorageLsOptions } from './commons'
 
interface LocalStorageDfResult {
    total:number,
    used: number,
    available: number
}

export default class LocalStorage {
    protected _basePath:string
    protected _isAccessible = false
    protected _name = ''
    consoleLog:ConsoleLog
    static listMap = {} as { [key: string]: LocalStorage }
    static consoleLog = new ConsoleLog({ prefix: 'LocalStorage' })
    protected static cronManager = new CronManager(60)
    protected static io?:Namespace

    get basePath() { return this._basePath }
    set basePath(basePath:string) {
        this._basePath = basePath
    }

    get isAccessible() {
        return this.accessibilityCheck()
    }

    get name() { return this._name }
    set name(name:string) {
        this._name = name
        if (name) this.consoleLog.generalOptions.id = name
            else delete this.consoleLog.generalOptions.id
    }

    constructor(basePath:string, inputOptions?:Partial<LocalStorageInputOptions>) {
        const options:LocalStorageInputOptions = _.defaults(inputOptions, {
            name: '',
            addToList: false
        })

        this.consoleLog = LocalStorage.consoleLog.spawn({ id: options.name ? options.name : undefined })
        this._basePath = basePath
        this._isAccessible = fs.existsSync(this._basePath)
        if (options.name) this.name = options.name
        if (options.addToList) {
            if (!this._name) throw new Error('"name" option required to be added to list')
            LocalStorage.listMap[ this._name ] = this
        }
    }

    accessibilityCheck(force = false) {
        if (this._isAccessible && !force) return true
        const previousState = this._isAccessible
        this._isAccessible = fs.existsSync(this._basePath)
        if (previousState !== this._isAccessible) {
            if (LocalStorage.io) LocalStorage.io.emit('accessibility changed', this._name, this._isAccessible)
            if (this._isAccessible) this.consoleLog.print('now accessible!')
                else this.consoleLog.print('not accessible anymore')
        }
        return this._isAccessible
    }

    protected df():Promise<LocalStorageDfResult> {
        return new Promise( (resolve, reject) => {
            diskusage(this._basePath, (err, usage) => {
                if (err) reject(err)
                resolve(usage)
            })
        })
    }

    protected onlyIfAccessible(functionName:string) {
        if (this._isAccessible) return true
        const errorMessage = `trying to run "${functionName}", but storage "${this._name}" is not accessible`
        this.consoleLog.error(errorMessage)
        if (LocalStorage.io) LocalStorage.io.emit('error', errorMessage)
        return false
    }

    async getInfo() {
        const info:LocalStorageInfo = {
            name: this._name,
            basePath: this._basePath,
            isAccessible: this.accessibilityCheck()
        }
        if (this._isAccessible) {
            const usage = await this.df()
            info.storage = {
                freeBytes: usage.available,
                totalBytes: usage.total
            }
        }

        return info
    }

    play(filePath:string) {
        if (!this.onlyIfAccessible('play')) return
        const fullPath = path.join(this._basePath, filePath)
        LocalStorage.play(fullPath, this.consoleLog)
    }

    getFile(filePath:string, inputOptions?:Partial<LocalStorageLsOptions>) {
        if (!this.onlyIfAccessible('getFile')) return null
        const options:LocalStorageLsOptions = _.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        })
        const fullPath = path.join(this._basePath, filePath)
        const stat = fs.statSync( fullPath, { throwIfNoEntry: false} )
        if (!stat) return null
        let type = '' as LocalStorageFileType | ''
        if (stat.isFile()) type = 'file'
            else if (stat.isDirectory()) type = 'directory'
        if (!type) throw new Error(`unrecognized type for file ${filePath} in ${ this._basePath } local storage`)
        const children = (type === 'directory' && options.recursive) ? this.ls( filePath , inputOptions ) : undefined
        
        const result:LocalStorageFile = {
            name: options.returnFullPaths ? fullPath : filePath,
            type: type,
            bytes: stat.size,
            children: children,
            createdAt: stat.ctime.toISOString(),
            updatedAt: stat.mtime.toISOString()
        }

        return result
    }

    find(filePath:string, inputOptions?:Partial<LocalStorageLsOptions>, parent = ''):LocalStorageFile | null {
        if (!this.onlyIfAccessible('find')) return null
        const options:LocalStorageLsOptions = _.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        })

        const list = fs.readdirSync( path.join(this._basePath, parent) )
        for (const filename of list)  {
            const searchName = path.join(parent, filename)
            if (searchName === filePath) return this.getFile( searchName, inputOptions )
            if (options.recursive) {
                const stat = fs.statSync( filename )
                if (stat.isDirectory()) {
                    const found = this.find( filePath, inputOptions, searchName )
                    if (found) return found
                }
            }
        }

        return null
    }

    ls(directory:string, inputOptions?:Partial<LocalStorageLsOptions>) {
        if (!this.onlyIfAccessible('ls')) return []
        const options:LocalStorageLsOptions = _.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        })
        const list = fs.readdirSync( path.join(this._basePath, directory) )
        let result = [] as LocalStorageFile[]
        for (const filename of list)  {
            if (filename === '.DS_Store' && options.noDSStore) continue
            const file = this.getFile( path.join( directory, filename ), inputOptions )
            if (!file) return []
            result.push( file )
        }

        return result
    }

    exists(filePath:string) {
        const fullPath = path.join(this._basePath, filePath)
        return fs.existsSync(fullPath)
    }

    fullPath(filePath:string) {
        return path.join(this._basePath, filePath)
    }

    static get list() {
        return Object.values( this.listMap )
    }

    static getInfo() {
        return Promise.all(
            this.list.map( ls => ls.getInfo() )
        )
    }

    static getByName(name:string) {
        const localStorage = this.listMap[ name ]
        if (!localStorage) {
            const errorMessage = `unable to find "${ name }" localStorage`
            const consoleLog = new ConsoleLog({prefix: 'LocalStorage'})
            consoleLog.error(errorMessage)
            if (this.io) this.io.emit('error', errorMessage)
            return null
        }
        return localStorage
    }

    static getFiles(filePath:string, inputOptions?:Partial<LocalStorageLsOptions>) {
        const result:({storageName:string, file:LocalStorageFile })[] = []
        for (const localStorage of this.list) {
            if (!localStorage.isAccessible) continue
            const found = localStorage.getFile(filePath, inputOptions)
            if (found) result.push({
                storageName: localStorage._name,
                file: found
            })
        }
        return result
    }

    static findFile(filePath:string, inputOptions?:Partial<LocalStorageLsOptions>) {
        const result:({storageName:string, file:LocalStorageFile })[] = []
        for (const localStorage of this.list) {
            if (!localStorage.isAccessible) continue
            const found = localStorage.find(filePath, inputOptions)
            if (found) result.push({
                storageName: localStorage._name,
                file: found
            })
        }
        return result
    }

    protected static async play(fullPath:string, consoleLog?:ConsoleLog) {
        if (!consoleLog) consoleLog = this.consoleLog
        try {
            await Cmd.run(Env.get('VLC_PATH', 'vlc'), {
                args: [fullPath],
                getResult: false,
                timeout: 0,
                spawnOptions: {
                    stdio: 'ignore'
                }
            })
        } catch (e) {
            consoleLog.error(e as string)
        }
    }

    static cron() {
        if (!this.cronManager.tryStartRun()) return
        this.list.map( ls => ls.accessibilityCheck(true) )
        this.cronManager.runCompleted()
    }

    static setIoServer(ioServer?:IOServer) {
        this.io = ioServer ? ioServer.of('/local-storage') : undefined
        if (this.io) {
            this.io.on('connection', (socket) => {
                socket.on('info request', async () => {
                    const list = await this.getInfo()
                    socket.emit('info', list)
                })

                socket.on('play', async (localStorageName:string, path:string) => {
                    const localStorage = this.getByName(localStorageName)
                    if (!localStorage) return
                    localStorage.play(path)
                })
            })
        }
    }
}