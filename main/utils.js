const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const shelljs = require('shelljs');

const { DefaultConfig, PackageItems } = require('./consts');

// __dirname 为bin/apiCode.js 路径
const resolve = filePath => path.resolve(__dirname, '../', filePath);

/**
 * generateIterator 文件生成迭代器
 * @param {String} param0.content content 文件内容
 * @param {String} param0.name 文件名 'data-contracts' | 'http-client' | 'Xxx' | 'XxxRoute'
 * @param {String} outputDir 生成文件的目录
 * @returns {Promise<void>}
 */
function generateIterator({ content, name }, outputDir) {
  return new Promise((resolve, reject) => {
    /**
     * 文件重命名
     * 如果name是大驼峰命名，后缀加Service，忽略XxxRoute.ts和XxxService.ts文件
     * 如果name是小写，保持不变
     */
    const fileName = name.replace(/^([A-Z][a-zA-Z]+)(\.ts|\.js)/, (match, p1, p2) => {
      if (/^[a-zA-z]+route$/i.test(p1) | /^[a-zA-z]+Service$/i.test(p1)) {
        return match;
      }
      return `${p1}Service${p2}`;
    });

    const filePath = path.join(outputDir, fileName);

    fs.writeFile(`${filePath}`, content, (err) => {
      if (err) {
        reject(err);
        throw err;
      }
      console.log(chalk.green(`${filePath} write success`));
      resolve();
    });
  });
}

/**
 * generateConfig 获取配置项
 * @param {Object} options swagger-typescript-api config
 */
function generateConfig(options) {
  const config = Object.assign({}, DefaultConfig, options || {});
  const templates = config.modular ? resolve('./main/templates/modular') : resolve('./main/templates/default');

  return Object.assign(config, { templates });
}

/**
 * 生成文件输出目录
 * @param {String} dir 目录
 */
function mkOutputDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    shelljs.mkdir('-p', dirPath);
  }
}

/**
 * 校验单份配置
 * @param {Object} config codegenItem config
 * @returns {Boolean}
 */
function checkCodegenItemConfig(config = {}) {
  let detal = 0;
  const length = PackageItems.length;

  for (let i = 0; i < length; i++) {
    const value = config[PackageItems[i]];
    if (typeof value === 'string' && value.length > 0) {
      detal += 1;
    } else {
      break;
    }
  }
  const valid = detal >= length;

  if (!valid) {
    console.error(chalk.red(`配置错误，请检查配置文件的每一项是否都包含${PackageItems.join(',')}`));
  }

  return valid;
}

/**
 * 校验Codegen完整配置
 * @param {Array} configList codegen config
 * @returns {Boolean}
 */
function checkCodegenConfig(configList) {
  if (
    !configList instanceof Array ||
    configList.length === 0
    ) {
    console.error(chalk.red('配置不能为空'));
    return false;
  }

  return configList.reduce((result, itemConfig) => (
    result && checkCodegenItemConfig(itemConfig)
  ), true);
}

/**
 * chainPromise 串行链式Promise函数
 * @param {Array<Promise<any>>} promiseFns 
 */
function chainPromise(promiseFns) {
  return promiseFns.reduce((p, fn) => p.then(fn), Promise.resolve());
}

module.exports = {
  mkOutputDir,
  checkCodegenConfig,
  checkCodegenItemConfig,
  generateConfig,
  generateIterator,
  chainPromise,
}
