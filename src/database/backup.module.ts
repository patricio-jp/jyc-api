import { Module } from '@nestjs/common';
import { BackupDatabaseService } from 'src/helpers/functions/backupDatabase.service';

@Module({
  providers: [BackupDatabaseService],
})
export class BackupDatabaseModule {}
