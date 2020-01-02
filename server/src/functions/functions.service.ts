import { Injectable, HttpException, OnModuleInit } from '@nestjs/common';
import { join, normalize } from 'path';
import { readdir, exists, readFile } from 'async-file';

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

  async getQuickStart(fileName: string) {
    const fileNameLower = fileName.toLowerCase();
    if (!this.quickStartMap[fileNameLower]) {
      throw new HttpException(`${fileName} does not exist`, 404);
    }
    return this.quickStartMap[fileNameLower];
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
    const dirFiles = await readdir(quickStartDir);
    const loading = dirFiles.map(async file => {
      const contents = await readFile(join(quickStartDir, file), { encoding: 'utf8' });
      const fileName = file.replace('.md', '');
      this.quickStartMap[fileName.toLowerCase()] = contents;
    });
    await loading;
  }
}
