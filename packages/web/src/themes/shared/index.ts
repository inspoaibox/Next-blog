// 主题共享组件和工具导出
export {
  CustomHtmlBlock,
  useHeadCodeInjector,
  customCodeConfigOptions,
  sidebarCustomHtmlConfigOptions,
  dualSidebarCustomHtmlConfigOptions,
  customCodeDefaultConfig,
  sidebarCustomHtmlDefaultConfig,
  dualSidebarCustomHtmlDefaultConfig,
} from './CustomCodeInjector';

export { DefaultProjectDetail } from './ProjectDetail';
export { SiteLogo } from './SiteLogo';

// 配色方案接口和工具
export {
  type ColorScheme,
  type GetColorScheme,
  defaultColorScheme,
  builtinColorSchemes,
  chromaDimensionPalettes,
  magazineColorSchemes,
} from './ColorScheme';
