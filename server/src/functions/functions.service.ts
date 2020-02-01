import { Injectable, HttpException, OnModuleInit } from '@nestjs/common';
import { join, normalize } from 'path';
import { readdir, exists, readFile } from 'async-file';
import * as fs from 'fs';
import { Constants } from '../constants';

@Injectable()
export class FunctionsService implements OnModuleInit {
  private templateMap: any = {};
  private bindingsMap: any = {};
  private quickStartMap: any = {};

  async onModuleInit() {
    await Promise.all([this.loadTemplateFiles(), this.loadBindingsFiles(), this.loadQuickStartFiles()]);
  }

  async getTemplates(runtime: string) {
    const runtimeVersion = runtime.replace('~', '');
    return this.templateMap[runtimeVersion] || this.templateMap.default;
  }

  async getBindings(runtime: string) {
    const runtimeVersion = runtime.replace('~', '');
    return this.bindingsMap[runtimeVersion] || this.bindingsMap.default;
  }

  async getQuickStart(fileName: string, language: string) {
    const langLower = language.toLowerCase();
    let langCode = 'en';
    if (langLower !== 'en') {
      if (!!Constants.quickstartLanguageMap[langLower]) {
        langCode = Constants.quickstartLanguageMap[langLower].toLowerCase();
      } else {
        langCode = langLower;
      }
    }
    let fileNameLower = `${fileName.toLowerCase()}${langCode !== 'en' ? `_${langCode}` : ''}`;

    if (!!this.quickStartMap[fileNameLower]) {
      return this.quickStartMap[fileNameLower];
    }
    /**
     * Check for the 'en' quickstart file if the specified langauge file is not available
     */
    if (langCode !== 'en') {
      fileNameLower = fileName.toLowerCase();
      if (!!this.quickStartMap[fileNameLower]) {
        return this.quickStartMap[fileNameLower];
      }
    }
    throw new HttpException(`${fileName} does not exist`, 404);
  }

  private async loadTemplateFiles() {
    const templateDir = normalize(join(__dirname, '..', 'data', 'templates'));
    if (!(await exists(templateDir))) {
      return;
    }
    const dirFiles = await readdir(templateDir);
    const loading = dirFiles.map(async file => {
      const contents = await readFile(join(templateDir, file), { encoding: 'utf8' });
      const runtime = file.replace('.json', '');
      this.templateMap[runtime] = JSON.parse(contents);
    });
    await loading;
  }

  private async loadBindingsFiles() {
    const bindingsDir = normalize(join(__dirname, '..', 'data', 'bindings'));
    if (!(await exists(bindingsDir))) {
      return;
    }
    const dirFiles = await readdir(bindingsDir);

    const loading = dirFiles.map(async file => {
      const contents = await readFile(join(bindingsDir, file), { encoding: 'utf8' });
      const runtime = file.replace('.json', '');
      this.bindingsMap[runtime] = JSON.parse(contents);
    });
    await loading;
  }

  private async loadQuickStartFiles() {
    const quickStartDir = normalize(join(__dirname, '..', 'quickstart'));
    if (!(await exists(quickStartDir))) {
      return;
    }
    this.readQuickstartDirectory(quickStartDir);
  }

  private async readQuickstartDirectory(dirPath: string) {
    const dirFiles = await readdir(dirPath);
    const loading = dirFiles.map(async file => {
      const filePath = join(dirPath, file);
      if (fs.existsSync(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          this.readQuickstartDirectory(filePath);
        } else {
          const contents = await readFile(filePath, { encoding: 'utf8' });
          const fileName = file.replace('.md', '');
          this.quickStartMap[fileName.toLowerCase()] = contents;
        }
      }
    });
    await loading;
  }
}
