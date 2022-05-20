#!/usr/bin/env node

const program = require('commander');
const { version } = require('../package.json');
const codegen = require('../main/codegen');

program
  .version(`${version}`, '-v, --version', '当前版本')
  .option('-c, --config <configFilePath>', '配置文件 Array<{packageName, outputDir, swaggerUrl, generateApiConfig}>')
  .option('-p, --package <packageName>', '构建指定单个package')

program.parse(process.argv);

const { config:configFilePath, package:packageName } = program.opts();

if (!configFilePath) {
  console.error('缺少配置文件参数');
  process.exit(1);
}

codegen({configFilePath, packageName});
