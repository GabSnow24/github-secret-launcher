import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { SecretsModule } from './secrets/secrets.module';

@Module({
  imports: [SecretsModule, ConfigModule.forRoot({load: [configuration],})],
  controllers: [],
  providers: [],
})
export class AppModule {}
