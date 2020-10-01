import type { Plugin, Transform } from 'vite'
import type { SourceDescription } from 'rollup'
import { supportedExts } from 'vite/dist/node/resolver'
import replaceAll from 'replace-string'
import reactLazy from 'rollup-plugin-react-lazy'
import path from 'path'

interface Config extends FirstArg<RollupPlugin> {}

const isBuild = process.argv[2] == 'build'

export default (config: Config): Plugin => {
  const plugin: Plugin = {}
  if (isBuild) {
    plugin.configureBuild = ({ plugins }) => {
      plugins!.push(reactLazy(config))
      return null
    }
  } else {
    const rollupPlugin = reactLazy({
      ...config,
      redirect: id =>
        '/' + replaceAll(path.relative(process.cwd(), id), path.sep, '/'),
    })
    const rollupContext: any = {
      parse: contextParse,
      resolve: (source: string, importer: string) => ({
        id: getResolve().sync(source, {
          basedir: path.dirname(importer),
          extensions: supportedExts,
        }),
      }),
    }
    plugin.configureServer = ({ app }) => {
      const load: RollupLoadFn = (rollupPlugin.load as any).bind(rollupContext)
      app.use(async (ctx, next) => {
        console.log('load:', ctx.path)
        if (/\/react-lazy-runtime(\/|$)/.test(ctx.path)) {
          ctx.path = ctx.path.replace('/@modules/', '')
          ctx.body = await load(ctx.path)
        }
        await next()
      })
    }
    plugin.transforms = [
      createTransform((rollupPlugin.transform as any).bind(rollupContext)),
    ]
  }
  return plugin
}

type RollupLoadFn = (id: string) => Promise<string>
type RollupTransformFn = (
  code: string,
  id: string
) => Promise<SourceDescription>

const createTransform = (transform: RollupTransformFn): Transform => ({
  test: ctx => !ctx.isBuild,
  async transform(ctx) {
    const res = await transform(ctx.code, ctx.path)
    if (res && typeof res !== 'string') {
      return { code: res.code, map: res.map as any }
    }
    return ctx.code
  },
})

const contextParse = (input: string, options?: any) =>
  getAcorn().parse(input, {
    allowAwaitOutsideFunction: true,
    ecmaVersion: 2020,
    preserveParens: false,
    sourceType: 'module',
    ...options,
  })

let acorn: any
const getAcorn = (): typeof import('acorn') =>
  acorn || (acorn = require('acorn'))

let resolve: any
const getResolve = (): typeof import('resolve') =>
  resolve || (resolve = require('resolve'))

type RollupPlugin = typeof import('rollup-plugin-react-lazy').default
type FirstArg<T extends (arg: any) => any> = Parameters<T>[0]
