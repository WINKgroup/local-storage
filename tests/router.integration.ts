/***
 * this is intended to be an integration test, not unit test: shouldn't be used with Jest
 * It expects to have a `TESTING_PATH=` key in `.env` file
 * according to [@winkgroup/env](https://www.npmjs.com/package/@winkgroup/env) package.
 * You will need eventually to set a proper VLC_PATH, too
 * 
 * Usage:
 * > npx ts-node tests/router.integration.ts
 */
import Env from '@winkgroup/env'
import Webserver from '@winkgroup/webserver'
import LocalStorage from '../src/index'

const localStorage = new LocalStorage( Env.get('TESTING_PATH'), {
    name: 'LSTest',
    addToList: true
} )
const webserver = new Webserver({
    name: 'LocalStorage test',
    useEndpoints: [{
        path: '/rest/local-storages',
        router: LocalStorage.getRouter(false)
    }]
})

webserver.listen()