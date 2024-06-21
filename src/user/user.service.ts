import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

		constructor(private readonly prisma: PrismaService){}

		async create(data: CreateUserDTO) { 

			if(data.birthAt) {
				data.birthAt = new Date(data.birthAt);
			}

			const salt = await bcrypt.genSalt();

			data.password = await bcrypt.hash(data.password, salt)

			return await this.prisma.user.create({		// não precisa de await dentro de um return quando uma função é async
				data
			})
		}

		async findUser(id: number){

			await this.userExists(id)

			return this.prisma.user.findUnique({		//exemplo sem utilizar await
				where: {id}
			})
		}

		async findAllUsers(){
			return this.prisma.user.findMany()
		}

		async updateUser({name, email, password, birthAt, role}: UpdatePutUserDTO, id: number){

			await this.userExists(id)

			const salt = await bcrypt.genSalt();

			password = await bcrypt.hash(password, salt)

			return this.prisma.user.update({
				where: {
					id
				},
				data: {
					name,email,password, birthAt: birthAt ? new Date(birthAt) : null, role
				}
			})
		}

		async updateParcialUser({name, email, password, birthAt, role}: UpdatePatchUserDTO, id: number){

			await this.userExists(id)

			const data: any = {};

			if(birthAt) {
				data.birthAt = new Date(birthAt);
			}
			if(email) {
				data.email = email;
			}
			if(password) {
				const salt = await bcrypt.genSalt();
				password = await bcrypt.hash(password, salt)
				data.password = password;
			}
			if(name) {
				data.name = name;
			}
			if(role) {
				data.role = role;
			}
			return this.prisma.user.update({
				where: {
					id
				},
				data
			})
		}

		async deleteUser(id: number){

			await this.userExists(id)

			return this.prisma.user.delete({
				where: {
					id
				}
			})
		}

		async userExists(id: number){
			if(!(await this.prisma.user.count({
				where: {
					id
				}
			})) ){
				throw new NotFoundException(`O Usuario de código ${id} não existe!`);
			}
		}
}