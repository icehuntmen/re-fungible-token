import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class HelperService {
  private logger = new Logger('TestHelper');
  private envTestFile = `${process.cwd()}/.env`;
  private ignoreList = `${process.cwd()}/.ignorelist`;
  constructor(private config: ConfigService) {}

  public async updateEnv(keyData: string, value: string) {
    if (keyData === null || keyData === undefined) {
      throw new Error('Set key');
    }
    let data = await this.readFileEnvironment();
    await this.checkAllVariablesEnv(data);

    data = await this.findArgAndReplace(data, keyData.toUpperCase(), value);
    await this.saveDataEnv(data);
  }

  private async findArgAndReplace(
    data: any,
    key: string,
    value: string,
  ): Promise<string> {
    let keyData;
    try {
      if (data === null || data === undefined) {
        throw new Error('No data provided');
      }

      if (key === null || key === undefined) {
        throw new Error('Set key');
      } else {
        keyData = key.toUpperCase();
      }

      const regexKey = new RegExp(keyData + '=.*$', 'gm');
      const validateKey = data.match(regexKey);
      if (validateKey?.length === 0 || validateKey === null) {
        throw new Error('No matched data');
      }
      return data.replace(regexKey, `${keyData}='${value}'`);
    } catch (e) {
      this.logger.error('No update selected key');
    }
  }

  private async readFileEnvironment(): Promise<string> {
    return fs.readFileSync(this.envTestFile).toString();
  }

  private async saveDataEnv(data: string): Promise<void> {
    if (data !== undefined) {
      fs.writeFileSync(this.envTestFile, data.toString());
    }
  }

  private async addNewLineToEnv(data: any, key: string, value: string) {
    const newKey = key.toUpperCase();
    const newLine = `\n${newKey}='${value}'`;
    data = data + newLine;
    return data;
  }

  private async checkAllVariablesEnv(data: string): Promise<void> {
    const ignoreVar = await this.readIgnoreFile();
    const ignoreString = ignoreVar.toString().replace(/,/g, '|');
    const regex = new RegExp(`(?=^.*=[\\s\'\'])^(?!(${ignoreString})).+`, 'gm');
    const findData = data.match(regex);
    if (findData?.length !== 0) {
      new Error('Missing environment variables');
    }
  }

  private async readIgnoreFile(): Promise<any> {
    const list = [];
    if (!fs.existsSync(this.ignoreList)) {
      this.logger.warn(
        'Missing ignore list file in root directory of application',
      );
      return list;
    } else {
      const fileIgnore = fs.readFileSync('.ignorelist').toString().split('\n');
      fileIgnore.find((keys) => {
        if (keys !== '') {
          list.push(keys);
        }
      });
      return list;
    }
  }
}
