import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './lib/database/database.module';
import { AuthModule as LoginModule } from './auth/login/auth.module';
import { AuthModule as RegisterModule } from './auth/register/auth.module';
import { ProfileModule } from './api/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    DatabaseModule,
    LoginModule,
    RegisterModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
