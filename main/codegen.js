const path = require('path');
const { generateApi } = require('swagger-typescript-api');
const resolve = filePath => path.resolve(process.cwd(), filePath);

const {
  mkOutputDir,
  checkCodegenItemConfig,
  checkCodegenConfig,
  generateConfig,
  generateIterator,
  chainPromise
} = require('./utils');

/**
 * codegenItem
 * @param {string} options.outputDir 包路径
 * @param {string} options.swaggerUrl 一份swagger json schema url
 * @param {object} options.generateApiConfig swagger-typescript-api配置
 * @returns {Promise<any>}
 */
function codegenItem(options) {
  const { outputDir, swaggerUrl, generateApiConfig = {} } = options;
  const output = resolve(`${outputDir}`);

  const config = generateConfig({
    ...generateApiConfig,
    url: swaggerUrl,
  });

  return new Promise((resolve, reject) => {
    generateApi(config)
      .then(({ files }) => {
        mkOutputDir(output);
        chainPromise(files.map((opt) => () => generateIterator(opt, output))).then(resolve);
      })
      .catch((error) => {
        reject(error);
        console.error(error);
      });
  });
}

/**
 * codegen
 * @param {string} options.packageName 构建指定包名
 * @param {string} options.configFilePath 构建配置文件路径(针对项目根路径)
 */
module.exports = function(options) {
  const { packageName, configFilePath } = options || {};
  let configList = require(resolve(configFilePath));

  if (Object.prototype.toString.call(configList) === '[object Object]') {
    if (checkCodegenItemConfig(configList)) {
      codegenItem(configList);
      return;
    } else {
      process.exit(1);
    }
  }

  if (configList instanceof Array) {
    if (!checkCodegenConfig(configList)) {
      process.exit(1);
    }
    if (packageName) {
      const config = configList.find(item => item.packageName === packageName);
      if (config) {
        codegenItem(config);
      } else {
        console.error(`${configFilePath}配置文件未指定单包packageName为${packageName}`);
        process.exit(1);
      }
      return;
    }

    chainPromise(
      configList.map(config => () => codegenItem(config))
    )
    return;
  }

  console.error(`${configFilePath}配置文件只能是对象或者是数组`);
  process.exit(1);
};
