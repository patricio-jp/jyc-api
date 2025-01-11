import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';

import * as fs from 'fs';
import { spawn } from 'child_process';

@Injectable()
export class BackupDatabaseService {
  constructor() {
    new CronJob(
      '30 2 * * *',
      () => {
        this.backupDatabase();
      },
      null,
      true,
      'America/Argentina/Buenos_Aires',
    );
  }

  backupDatabase() {
    // Backup the database
    const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    const dumpFileName = `backup-${new Date().toISOString()}.sql`;
    const dumpFilePath = `/tmp/${dumpFileName}`;
    const writeStream = fs.createWriteStream(dumpFilePath);

    const dump = spawn('mysqldump', [
      '-u',
      DB_USER,
      '-p' + DB_PASSWORD,
      DB_NAME,
    ]);

    dump.stdout
      .pipe(writeStream)
      .on('finish', () => {
        // Move the backup to a safe location
        const backupDir = process.cwd() + '/backups';
        const backupFilePath = `${backupDir}/${dumpFileName}`;
        fs.rename(dumpFilePath, backupFilePath, (err) => {
          if (err) {
            console.error('Failed to move the backup file', err);
            return;
          }
          console.log('Database backup complete');
        });
      })
      .on('error', (err) => {
        console.error('Failed to backup the database', err);
      });
  }
}
