import { Body, Controller, Delete, Get, Patch, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import { UserService } from "./user.service";
import { LogInterceptor } from "src/interceptors/log.interceptor";
import { ParamId } from "src/decorators/param-id.decorator";
import { Roles } from "src/decorators/role.decorator";
import { Role } from "src/enums/role.enum";
import { RoleGuard } from "src/guards/role.guard";
import { AuthGuard } from "src/guards/auth.guard";

@Roles(Role.Admin)
@UseGuards(AuthGuard, RoleGuard)
@UseInterceptors(LogInterceptor)
@Controller('users')
export class UserController {

		constructor(private readonly userService: UserService){}

		@Post()
		async create(@Body() data: CreateUserDTO) {
			return this.userService.create(data); //create é uma promise porém como está dentro do return não precisa do await
		}

		@Get()
		async users() {
			return this.userService.findAllUsers()
		}

		@Get(':id')
		async user(@ParamId() id: number ) {
			return this.userService.findUser(id)
		}

		@Put(':id')
		async updUser(@Body() data: UpdatePutUserDTO, @ParamId() id: number ) {
			return this.userService.updateUser(data, id)
		}

		@Patch(':id')
		async updParcialUser(@Body() data:UpdatePatchUserDTO, @ParamId() id: number ) {
			return this.userService.updateParcialUser(data, id)
		}

		@Roles(Role.Admin)
		@Delete(':id')
		async deleteUser(@ParamId() id: number ) {
			return this.userService.deleteUser(id)
		}
}