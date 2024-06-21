import { BadRequestException, Body, Controller, Headers, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthForgetDTO } from "src/auth/dto/auth-forget.dto";
import { AuthLoginDTO } from "src/auth/dto/auth-login.dto";
import { AuthRegisterDTO } from "src/auth/dto/auth-register.dto";
import { AuthResetDTO } from "src/auth/dto/auth-reset.dto";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { AuthMeDTO } from "./dto/auth-me.dto";
import { AuthGuard } from "src/guards/auth.guard";
import { User } from "src/decorators/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { writeFile } from 'fs/promises'
import { join } from "path";
import { FileService } from "src/file/file.service";

@Controller('auth')
export class AuthController{

		constructor(private readonly userService: UserService,
								private readonly authService: AuthService,
								private readonly fileService: FileService
		){}

		@Post('login')
		async login(@Body() {email, password}: AuthLoginDTO) {

			return this.authService.login(email, password)
		}

		@Post('register')
		async register(@Body() body: AuthRegisterDTO){

			return this.authService.register(body)
		}

		@Post('forget')
		async forget(@Body() {email}: AuthForgetDTO) {

			return this.authService.forget(email)
		}

		@Post('reset')
		async reset(@Body() {password, token}: AuthResetDTO){

			console.log(password, token)

			return this.authService.reset(password, token)
		}

		@UseGuards(AuthGuard)
		@Post('me')
		async me(@User() user) {

			return {user};
		}

		@UseInterceptors(FileInterceptor('file'))
		@UseGuards(AuthGuard)
		@Post('photo')
		async uploadPhoto(@User() user, @UploadedFile() photo: Express.Multer.File){

			const path = join(__dirname, '..', 'storage', 'photos', `photo-${user.id}.png`)

			try{
			await this.fileService.upload(photo, path)
			} catch (e){
				throw new BadRequestException(e);
			}
			return {sucess: true}
		}
}