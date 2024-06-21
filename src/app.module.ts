import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';

@Module({
  imports: [
		ConfigModule.forRoot(),
		ThrottlerModule.forRoot([
			{
				ttl: 60,
				limit: 10
			}
		]),
		forwardRef(() => UserModule),
		forwardRef(() => AuthModule),
		MailerModule.forRoot({
      transport: {
				host: process.env.DOMAIN_SMTP,
    		port: Number(process.env.PORT),
    		auth: {
					user: process.env.EMAIL_SMTP,
					pass: process.env.PASSWORD_SMTP
    		}
			},
      defaults: {
        from: `"Teste E-mail Nestjs" < ${process.env.EMAIL_SMTP} >`,
      },
      template: {
        dir: join(__dirname , '..', 'templates'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
	],
  controllers: [AppController],
  providers: [AppService, 
		{ provide: APP_GUARD,
			useClass:ThrottlerGuard
		}
	],
})
export class AppModule {}
