import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MONGODB_USER');
        const pass = config.get<string>('MONGODB_PASSWORD');
        const url = config.get<string>('MONGODB_URL');
        const db = config.get<string>('MONGODB_DB');

        return {
          uri: `mongodb+srv://${user}:${pass}@${url}/${db}?retryWrites=true&w=majority`,
        };
      },
    }),
    UsersModule,
    AuthModule,
    MailModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
