//https://docs.nestjs.com/techniques/database#models

export class User {
  id: number;
  email: string;
  name: string;
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
