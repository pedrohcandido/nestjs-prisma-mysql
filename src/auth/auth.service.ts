import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthRegisterDTO } from "src/auth/dto/auth-register.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt'
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class AuthService {

		private issuer = 'Api NestJS Login'
		private audience = 'users'

		constructor(private readonly JwtService: JwtService,
								private readonly prisma: PrismaService,
								private readonly userService: UserService,
								private readonly mailer: MailerService
						) {}

		createToken(user: User) {
			return {
				acessToken: this.JwtService.sign({
					id: user.id,
					name: user.name,
					email: user.email
				}, {
					expiresIn: "7 days",
					subject: String(user.id),
					issuer: this.issuer,
					audience: this.audience
				}
			)
			}
		}

		checkToken(token: string) {
			try{
					const data = this.JwtService.verify(token, {
						audience: this.audience,
						issuer: this.issuer,
					});
					return data;
			}catch (e) {
				throw new BadRequestException(e);
			}
		}

		isValidToken(token: string) {
			try{
				this.checkToken(token)
				return true;
			} catch (e) {
				return false;
			}
		}

		async login(email: string, password: string) {

			const user = await this.prisma.user.findFirst({
				where: {
					email
				}
			})
			if(!user) {
				throw new UnauthorizedException('E-mail e/ou senha incorretos.')
			}

			if (!await bcrypt.compare(password, user.password)) {
				throw new UnauthorizedException('E-mail e/ou senha incorretos.')
			}

			return this.createToken(user);
		}

		async forget(email: string) {

			const user = await this.prisma.user.findFirst({
				where: {
					email
				}
			})
			if(!user) {
				throw new UnauthorizedException('E-mail e/ou senha incorretos.')
			}

			const token = this.JwtService.sign(
			{
				id: user.id
			},
			{
					expiresIn: "30 minutes",
					subject: String(user.id),
					issuer: 'forget',
					audience: 'users'
			}
		)

			await this.mailer.sendMail({
				subject: "recuperação de senha",
				to:"pedroh_candido@hotmail.com",
				template: "forget",
				context: {
					name: user.name,
					token
				}
			})
			return true;
		}

		async reset(password: string, token: string) {

			console.log(password, token)
			
			try{
				const data = this.JwtService.verify(token, {
					issuer: 'forget',
					audience: 'users'
				});

				if (isNaN(Number(data.id))){
					throw new BadRequestException("token inválido")
				}

				const salt = await bcrypt.genSalt();
				password = await bcrypt.hash(password, salt)

				const user = await this.prisma.user.update({
					where: {
						id: Number(data.id),
					},
					data: {
						password
					}
				})

				return this.createToken(user);

			} catch (e){
				throw new BadRequestException(e)
			}
			return true
		}

		async register(data: AuthRegisterDTO) {

			const user = await this.userService.create(data)

			return this.createToken(user)
		}
}