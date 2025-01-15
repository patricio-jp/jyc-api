import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('file')
export class FileController {
  @Get(':folder/:filename')
  getFile(
    @Param('filename') filename: string,
    @Param('folder') folder: string,
  ): StreamableFile {
    const filePath = join(process.cwd(), 'uploads', folder, filename);
    //console.log(filePath);
    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }
}
