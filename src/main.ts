import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LogInterceptor } from './interceptors/log.interceptor';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

	app.enableCors();
	
	app.useGlobalPipes(new ValidationPipe());

	//app.useGlobalInterceptors(new LogInterceptor); /// Para interceptar em todos os controllers
	
  await app.listen(3000);

	if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
