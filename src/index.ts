import Cmd from '@winkgroup/cmd'
import ConsoleLog from '@winkgroup/console-log'
import CronManager from '@winkgroup/cron'
import { MaterialTableSearch } from "@winkgroup/db-mongo"
import Env from '@winkgroup/env'
import ErrorManager from "@winkgroup/error-manager"
import diskusage from 'diskusage-ng'
import express from "express"
import { expressjwt as jwt } from 'express-jwt'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { LocalStorageDfResult, LocalStorageFile, LocalStorageFileType, LocalStorageInputOptions, LocalStorageLsOptions } from './commons'
 


export default class LocalStorage {
    protected _basePath:string
    protected _isAccessible = false
    protected _name = ''
    consoleLog:ConsoleLog
    static listMap = {} as { [key: string]: LocalStorage }
    static consoleLog = new ConsoleLog({ prefix: 'LocalStorage' })
    protected static cronManager = new CronManager(10)

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
            if (this._isAccessible) this.consoleLog.print('now accessible!')
                else this.consoleLog.print('not accessible anymore')
        }
        return this._isAccessible
    }

    df():Promise<LocalStorageDfResult> {
        return new Promise( (resolve, reject) => {
            diskusage(this._basePath, (err, usage) => {
                if (err) reject(err)
                resolve(usage)
            })
        })
    }

    async getStats() {
        const usage = await this.df()
        return {
            freeBytes: usage.available,
            totalBytes: usage.total,
            basePath: this._basePath
        }
    }

    async play(filePath:string) {
        const fullPath = path.join(this._basePath, filePath)
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
            this.consoleLog.error(e as string)
        }
    }

    ls(directory:string, inputOptions?:Partial<LocalStorageLsOptions>) {
        const options:LocalStorageLsOptions = _.defaults(inputOptions, {
            recursive: false,
            returnFullPaths: false,
            noDSStore: true
        })
        const list = fs.readdirSync(directory)
        let result = [] as LocalStorageFile[]
        for (const filename of list)  {
            if (filename === '.DS_Store' && options.noDSStore) continue
            const stat = fs.statSync( path.join( directory, filename ) )
            let type = '' as LocalStorageFileType | ''
            if (stat.isFile()) type = 'file'
                else if (stat.isDirectory()) type = 'directory'
            if (!type) throw new Error(`unrecognized type for file ${filename} in ${ this._basePath } local storage`)
            if (type === 'directory' && options.recursive) {
                let subList = this.ls( path.join(directory, filename) , options )
                if (!options.returnFullPaths) subList = subList.map( file => {
                    return {
                        ...file,
                        name: path.join( filename, file.name )
                    }
                } )
                result = result.concat( subList )
            }
            result.push({
                name: options.returnFullPaths ? path.join(directory, filename) : filename,
                bytes: stat.size,
                type: type
            })
        }
        
        return result
    }

    static get list() {
        return Object.values( this.listMap )
    }

    static cron() {
        if (!this.cronManager.tryStartRun()) return
        this.list.map( storage => storage.isAccessible )
        this.cronManager.runCompleted()
    }

    static getRouter(protectEndpoints = true) {
        const router = express.Router()
        router.use(  express.json() )

        if (protectEndpoints) {
            router.use (jwt({
                secret: Env.get('JWT_SECRET'),
                algorithms: ['RS256', 'HS256']
            }))
    
            router.use((err:any, req:any, res:any, next:any) => {
                if(err.name === 'UnauthorizedError') {
                    console.error(err)
                    res.status(err.status).send( err.message )
                    return
                }
                next()
            })
        }

        router.get('/names', async (req, res) => {
            try {
                const names = Object.keys(this.listMap)
                res.json(names)
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.get('/:name/df', async (req, res) => {
            try {
                const repo = this.listMap[req.params.name]
                if (!repo) throw new Error(`local storage "${ req.params.name }" not found`)
                const result = await repo.df()
                res.json(result)
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.get('/:name/stats', async (req, res) => {
            try {
                const repo = this.listMap[req.params.name]
                if (!repo) throw new Error(`local storage "${ req.params.name }" not found`)
                const result = await repo.getStats()
                res.json(result)
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.get('/:name/:pathBase64/play', async (req, res) => {
            try {
                const repo = this.listMap[req.params.name]
                if (!repo) throw new Error(`local storage "${ req.params.name }" not found`)
                const filePath = Buffer.from(req.params.pathBase64, 'base64').toString('utf8')
                repo.play(filePath)
                res.json()
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.post('/:name/:pathBase64/materialTable', async (req, res) => {
            try {
                const repo = this.listMap[req.params.name]
                if (!repo) throw new Error(`local storage "${ req.params.name }" not found`)
                const directoryPath = Buffer.from(req.params.pathBase64, 'base64').toString('utf8')
                let result = repo.ls(directoryPath)
                const totalCount = result.length
                const materialTableSearch = req.body  as MaterialTableSearch
                
                if (materialTableSearch.search) {
                    const regExp = new RegExp(materialTableSearch.search, 'i')
                    result = result.filter( file => file.name.match(regExp) )
                }
    
                if (materialTableSearch.orderBy) {
                    const field = materialTableSearch.orderBy.field
                    const opposite = materialTableSearch.orderDirection !== 'desc' ? 1 : -1
                    result.sort( (a:any, b:any) => a[field] < b[field] ? opposite * -1 : opposite * 1 )
                }

                const initialPos = materialTableSearch.pageSize * materialTableSearch.page
                const finalPos = initialPos + materialTableSearch.pageSize
                result = result.filter ( (file, pos) => ( pos >= initialPos && pos < finalPos ) )

                res.json({
                    data: result,
                    page: materialTableSearch.page,
                    totalCount: totalCount
                })
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.get('/:name/:pathBase64/ls', async (req, res) => {
            try {
                const repo = this.listMap[req.params.name]
                if (!repo) throw new Error(`local storage "${ req.params.name }" not found`)
                const directory = Buffer.from(req.params.pathBase64, 'base64').toString('utf8')
                const result = repo.ls(directory)
                res.json(result)
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        return router
    }
}