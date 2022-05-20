// swagger-typescript-api配置
const generateApiConfig = {};

/**
 * Array<{
 * @property packageName 包名
 * @property outputDir 包路径（针对当前项目根目录）
 * @property swaggerUrl 一份swagger http url
 * @property generateApiConfig swagger-typescript-api配置
 * }>
 */
module.exports = [
  {
    packageName: 'oms',
    outputDir: 'example/packages/sem/api',
    swaggerUrl: 'http://localhost:3000/oms.json',
    generateApiConfig: {
      ...generateApiConfig
    },
  },
  {
    packageName: 'sem',
    outputDir: 'example/packages/oms/api',
    swaggerUrl: 'http://localhost:3000/sem.json',
    generateApiConfig: {
      ...generateApiConfig
    },
  }
];
