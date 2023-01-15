import { createApp } from './main';
import { renderToString } from '@vue/server-renderer';

export const render = async () => {
  const { app } = createApp();

  // 注入vue ssr中的上下文对象
  const renderCtx: { modules?: string[] } = {}

  let renderedHtml = await renderToString(app, renderCtx)

  return { renderedHtml };
}