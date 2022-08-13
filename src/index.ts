import express from "express"
import {expressjwt as jwt} from 'express-jwt'
import diskusage from 'diskusage-ng'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import ConsoleLog from '@winkgroup/console-log'
import CronManager from '@winkgroup/cron'
import { LocalStorageDfResult, LocalStorageInputOptions } from './commons'
import Cmd from '@winkgroup/cmd'
import Env from '@winkgroup/env'
import ErrorManager from "@winkgroup/error-manager"
 
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

        this._basePath = basePath
        this._isAccessible = fs.existsSync(this._basePath)
        if (options.name) this.name = options.name
        this.consoleLog = LocalStorage.consoleLog.spawn({ id: options.name ? options.name : undefined })
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

    play(filePath:string) {
        const fullPath = path.join(this._basePath, filePath)
        return Cmd.run(Env.get('VLC_PATH', 'vlc'), {
            args: [fullPath],
            getResult: false,
            timeout: 0,
            spawnOptions: {
                stdio: 'ignore'
            }
        })
    }

    ls(dir:string) {
        const fullPath = path.join(this._basePath, dir)
        return fs.readdirSync(fullPath)
    }

    static get list() {
        return Object.values( this.listMap )
    }

    static cron() {
        if (!this.cronManager.tryStartRun()) return
        this.list.map( storage => storage.isAccessible )
        this.cronManager.runCompleted()
    }

    static getRouter() {
        const router = express.Router()
        router.use(  express.json() )

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

        router.get('/:name/:pathBase64', async (req, res) => {
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

        return router
    }
}