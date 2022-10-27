import { DynamicModule, Global, Module } from '@nestjs/common';
import { PlainEncryptionStrategy } from 'src/modules/core/encryption/strategies/plain-encryption.strategy';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { CertificateModule } from 'src/modules/certificate/certificate.module';
import { DatabaseModule } from 'src/modules/database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisService } from './services/redis/redis.service';
import { AnalyticsService } from './services/analytics/analytics.service';

interface IModuleOptions {
  buildType: string;
}

/**
 * Core module
 */
@Global()
@Module({})
export class CoreModule {
  static register(options: IModuleOptions): DynamicModule {
    // TODO: use different module configurations depending on buildType
    return {
      module: CoreModule,
      imports: [
        SettingsModule.register(),
        CertificateModule,
        DatabaseModule,
        EventEmitterModule.forRoot(),
      ],
      providers: [
        KeytarEncryptionStrategy,
        PlainEncryptionStrategy,
        EncryptionService,
        AnalyticsService,
        RedisService,
      ],
      exports: [
        SettingsModule,
        CertificateModule,
        DatabaseModule,
        EncryptionService,
        AnalyticsService,
        RedisService,
      ],
    };
  }
}
