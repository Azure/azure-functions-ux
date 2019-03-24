import { Module, HttpException, MiddlewareConsumer } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { memoryStorage } from 'multer';
import * as RateLimit from 'express-rate-limit';
const storage = memoryStorage();
@Module({
  imports: [
    MulterModule.register({
      storage,
      fileFilter: (req, file, cb) => {
        if (extname(file.originalname) !== '.zip') {
          return cb(new HttpException('Only zip files allowed', 400), false);
        }

        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1,
      },
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {
  configure(consumer: MiddlewareConsumer) {
    const apiLimiter = new RateLimit({
      windowMs: 60 * 1000, // 5 requests per 1 minute
      max: 5,
    });
    consumer.apply(apiLimiter).forRoutes('api/upload');
  }
}
