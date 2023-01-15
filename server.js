// 最新 node 核心包的导入写法
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createRequire } from 'module'; 

// 获取 __filename 的 ESM 写法
const __filename = fileURLToPath(import.meta.url)
// 获取 __dirname 的 ESM 写法
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url);

const fs = require('fs');
const path = require('path');

const koa = require('koa');
const koaConnect = require('koa-connect');
// import vite from "vite";
const vite = require('vite');

(async () => {
    const app = new koa();
    // 创建 vite 服务
    const viteServer = await vite.createServer({
      root: process.cwd(),
      logLevel: 'error',
      server: {
        middlewareMode: true,
      },
    })

    // 注册 vite 的 Connect 实例作为中间件（注意：vite.middlewares 是一个 Connect 实例）
    app.use(koaConnect(viteServer.middlewares))

    // const template = fs.readFileSync(path.resolve(__dirname,'index.html'),'utf-8')

    // let vueTemplate = '<h1 style="text-align:center;">现在假装这是一个vue模板</h1>';

    // let html = template.replace('<!--app-html-->',vueTemplate)

    app.use(async (ctx) => {
        try {
            // 1. 获取index.html
            let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

            // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
            template = await viteServer.transformIndexHtml(ctx.path, template)

            // 3. 加载服务器入口, vite.ssrLoadModule 将自动转换
            const { render } = await viteServer.ssrLoadModule('/src/entry-server.ts')

            //  4. 渲染应用的 HTML
            const { renderedHtml } = await render(ctx, {})

            const html = template.replace('<!--app-html-->', renderedHtml)

            ctx.type = 'text/html'
            ctx.body = html
        } catch (e) {
            viteServer && viteServer.ssrFixStacktrace(e)
            console.log(e.stack)
            ctx.throw(500, e.stack)
        }
    });

    app.listen(9000, () => {
        console.log('server is listening in 9000');
    });
})();