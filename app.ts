import { Application, IBoot } from 'egg';
import mongoose from 'mongoose';
import { join, sep } from 'path';
import { find } from 'fs-jetpack';
import { watch } from 'chokidar';
import * as fs from 'fs-extra';
import * as prettier from 'prettier';
import { getModelForClass } from '@typegoose/typegoose';

export default class App implements IBoot {
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async configWillLoad() {
    await this.connectDB();
    await this.customLoadModel();
  }

  private async connectDB() {
    const { url, options } = this.app.config.typegoose;
    if (url) {
      await mongoose.connect(url, options);
    }
  }

  private async customLoadModel() {
    this.watchModel();
    await this.loadModel();
  }

  private async loadModel() {
    const { baseDir, config } = this.app;
    const { typegoose: { modelFilePath, modelWhitelist } } = config;
    const modelDir = join(baseDir, modelFilePath);
    if (!fs.existsSync(modelDir)) {
      return;
    }
    const matching = this.app.config.env === 'local' || this.app.config.env === 'test' ? '*.ts' : '*.js';
    const files = find(modelDir, { matching });
    this.app.context.model = {};
    try {
      for (const file of files) {
        const modelName = this.getModelName(file);
        // 忽略掉白名单
        if (!modelWhitelist.some(whiteName => this.getModelName(whiteName) === modelName)) {
          const modelPath = join(baseDir, file);
          const Model = require(modelPath).default;
          this.app.context.model[modelName] = getModelForClass(Model);
        }
      }
    } catch (e) {
      console.log('Please export default model.');
    }
  }

  private watchModel() {
    const { baseDir, config } = this.app;
    const { typegoose: { modelFilePath } } = config;

    const modelDir = join(baseDir, modelFilePath);
    const typingsDir = join(baseDir, 'typings');

    if (!fs.existsSync(modelDir)) {
      return;
    }

    fs.ensureDirSync(typingsDir);
    watch(modelDir).on('all', (eventType: string) => {
      if ([ 'add', 'change', 'unlink' ].includes(eventType)) {
        this.createTyingFile();
      }
    });
  }

  private createTyingFile() {
    const { baseDir, config } = this.app;
    const { typegoose: { modelFilePath } } = config;
    const modelDir = join(baseDir, modelFilePath);
    const files = find(modelDir, { matching: '*.ts' });
    const typingPath = join(baseDir, 'typings/', modelFilePath, 'index.d.ts');
    const pathArr = this.formatPaths(files);

    const importText = pathArr
    .map(item => `import ${item.modelName} from '${item.importPath}'`)
    .join('\n');

    const repoText = pathArr
    .map(item => `${item.modelName}: ReturnModelType<typeof ${item.modelName}, BeAnObject>`)
    // .map(item => `${item.modelName}: ${item.modelName}`)
    .join('\n');

    const typingType = this.getTypingText(importText, repoText);

    this.writeTyping(typingPath, typingType);
  }

  private getTypingText(importText: string, repoText: string) {
    return `
      import 'egg'
      import { ReturnModelType, BeAnObject } from '@typegoose/typegoose'
      import * as mongoose from 'mongoose'
      ${importText}
      declare module 'egg' {
        interface Context {
          connection: mongoose.Collection
          model: {
            ${repoText}
          }
        }
      }
    `;
  }

  private writeTyping(typingPath: string, typingType: string) {
    fs.writeFileSync(typingPath, this.formatCode(typingType), { encoding: 'utf8' });
  }

  private formatPaths(files: string[]) {
    const { modelWhitelist } = this.app.config.typegoose;
    return files
    .filter(file => {
      return !modelWhitelist.some(whiteName => this.getModelName(whiteName) === this.getModelName(file));
    }).map(file => {
      const modelName = this.getModelName(file);
      const filePath = file.split(sep).join('/');
      const importPath = `../../../${filePath}`.replace(/\.ts$|\.js$/g, '');
      return {
        modelName,
        importPath,
      };
    });
  }

  private formatCode(text: string) {
    return prettier.format(text, {
      semi: true,
      tabWidth: 2,
      singleQuote: true,
      parser: 'typescript',
      trailingComma: 'all',
    });
  }

  private getModelName(file: string) {
    const filename = file.split(sep).pop() || '';
    return filename
    .replace(/\.ts$|\.js$/g, '')
    .split(/[-_.]/)
    .map(modelName => this.capitalizeFirstLetter(modelName))
    .join('');
  }

  private capitalizeFirstLetter(file: string) {
    return file.charAt(0).toUpperCase() + file.slice(1);
  }
}