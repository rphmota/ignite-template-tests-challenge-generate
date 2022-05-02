import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create new User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "rphmota",
      email:"rphmota@gmail.com",
      password: "123456",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    const userCreated = await usersRepositoryInMemory.findByEmail(user.email)

    expect(userCreated).toHaveProperty("id");
  });

  it("should not be able to create a new user with a duplicate email", async () => {
    expect(async () => {
      const user = {
        name: "Raphael",
        email:"rphmota@gmail.com",
        password: "123456",
      };


      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});