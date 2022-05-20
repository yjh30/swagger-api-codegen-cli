# swagger-api-codegen-cli

## 1. 安装 & 使用

```shell
yarn add -D swagger-api-codegen-cli
```

```muse
Usage: sac [options]

Options:
  -v, --version                   当前版本
  -c, --config <configFilePath>   配置文件 Array<{packageName, outputDir, swaggerUrl, generateApiConfig}>
  -p, --package <packageName>     构建指定单个package
  -h, --help                      显示命令帮助
```

- codegen多个swagger实例：`sac --config example/confifg.js`
- codegen单个swagger实例：`sac --config example/confifg.js --package oms`

## 2. 配置文件参考
```js
// swagger-typescript-api配置
const generateApiConfig = {};

/**
 * Array<{
 * @property packageName 包名
 * @property outputDir 生成文件的输出目录（针对当前项目根目录）
 * @property swaggerUrl 一份swagger http url
 * @property generateApiConfig swagger-typescript-api配置
 * }>
 */
module.exports = [
  {
    packageName: 'oms',
    outputDir: 'packages/sem/api',
    swaggerUrl: 'http://localhost:3000/oms.json',
    generateApiConfig: {
      ...generateApiConfig
    },
  },
  {
    packageName: 'sem',
    outputDir: 'packages/oms/api',
    swaggerUrl: 'http://localhost:3000/sem.json',
    generateApiConfig: {
      ...generateApiConfig
    },
  }
];
```

## 3. 生成的示例目录
```
// yarn & lerna 工程目录

├── example (项目根路径)
  ├── package.json
  ├── packages
    ├── oms
      ├── api
        ├── api.ts (生成的文件)
    ├── sem
      ├── api
        ├── api.ts (生成的文件)
```

## 4. swagger-typescript-api
- [配置详解](./swagger-ts-api.md)
