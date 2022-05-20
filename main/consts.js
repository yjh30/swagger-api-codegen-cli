/**
 * swagger-typescript-api config
 * doc：https://github.com/acacode/swagger-typescript-api
 */
const DefaultConfig = {
  name: 'api.ts', // 如果开启了modular，name配置无效
  toJS: false,
  generateRouteTypes: false,
  generateClient: true,
  generateResponses: true,
  moduleNameIndex: 2,
  moduleNameFirstTag: true,
  modular: false,
  extractRequestParams: true,
  extractRequestBody: true,
  enumNamesAsValues: true,
  httpClientType: 'axios',
  singleHttpClient: true,
  defaultResponseType: 'unknown',
  typePrefix: "I",
  cleanOutput: false, // output 为'./' 将无意义
};

/**
 * codegenItem 配置文件的必须成员
 */
const PackageItems = [
  'outputDir',
  'swaggerUrl',
];

exports.DefaultConfig = DefaultConfig;
exports.PackageItems = PackageItems;
