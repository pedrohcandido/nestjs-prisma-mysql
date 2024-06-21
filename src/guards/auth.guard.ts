import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(private readonly authService: AuthService,
							private readonly userService: UserService
	) {}

	async canActivate(context: ExecutionContext){
		
		const request = context.switchToHttp().getRequest();
		const {authorization} = request.headers

		try{
			const data = this.authService.checkToken((authorization ?? '').split(' ')[1]);
			request.tokenPayload = data;
		}catch (e){
			return false
		}

		const user = await this.userService.findUser(request.tokenPayload.id)

		request.user = user

		return true
	}

}