import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface User {
  userId: number;
  username: string;
  password: string;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly users: User[] = [];
  private nextId = 1;

  async onModuleInit() {
    // Seed a default user for immediate testing
    await this.create('admin', 'admin123');
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async create(username: string, plainPassword: string): Promise<Omit<User, 'password'>> {
    const existing = await this.findOne(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser: User = {
      userId: this.nextId++,
      username,
      password: hashedPassword,
    };

    this.users.push(newUser);
    const { password, ...result } = newUser;
    return result;
  }
}
