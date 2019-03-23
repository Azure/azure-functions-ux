import { Injectable, HttpException } from '@nestjs/common';
import { join, normalize } from 'path';
import { readdir } from 'async-file';
import { readFileSync } from 'fs';

@Injectable()
export class FunctionsService {
  private templateMap: any = {};
  private bindingsMap: any = {};
  private quickStartMap: any = {};
  private initialLoadPromise;
  constructor() {
    this.initialLoadPromise = Promise.all([this.loadTemplateFiles(), this.loadBindingsFiles(), this.loadQuickStartFiles()]);
  }

  async getTemplates(runtime: string) {
    await this.initialLoadPromise;
    const runtimeVersion = runtime.replace('~', '');
    return this.templateMap[runtimeVersion] || this.templateMap.default;
  }

  async getBindings(runtime: string) {
    await this.initialLoadPromise;
    const runtimeVersion = runtime.replace('~', '');
    return this.bindingsMap[runtimeVersion] || this.bindingsMap.default;
  }

  async getQuickStart(fileName: string) {
    await this.initialLoadPromise;
    const fileNameLower = fileName.toLowerCase();
    if (!this.quickStartMap[fileNameLower]) {
      throw new HttpException(`${fileName} does not exist`, 404);
    }
    return this.quickStartMap[fileNameLower];
  }

  async getRuntimeToken() {}
  private async loadTemplateFiles() {
    const templateDir = normalize(join(__dirname, '..', 'data', 'templates'));
    const dirFiles = await readdir(templateDir);
    dirFiles.forEach(file => {
      const contents = readFileSync(join(templateDir, file), { encoding: 'UTF-8' });
      const runtime = file.replace('.json', '');
      this.templateMap[runtime] = contents;
    });
  }

  private async loadBindingsFiles() {
    const bindingsDir = normalize(join(__dirname, '..', 'data', 'bindings'));
    const dirFiles = await readdir(bindingsDir);
    dirFiles.forEach(file => {
      const contents = readFileSync(join(bindingsDir, file), { encoding: 'UTF-8' });
      const runtime = file.replace('.json', '');
      this.bindingsMap[runtime] = contents;
    });
  }

  private async loadQuickStartFiles() {
    const quickStartDir = normalize(join(__dirname, '..', 'quickstart'));
    const dirFiles = await readdir(quickStartDir);
    dirFiles.forEach(file => {
      const contents = readFileSync(join(quickStartDir, file), { encoding: 'UTF-8' });
      const fileName = file.replace('.md', '');
      this.quickStartMap[fileName.toLowerCase()] = contents;
    });
  }
}
