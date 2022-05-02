import { OperationType } from './../../entities/Statement';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetBalanceError } from './GetBalanceError';

let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory)
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to get balance", async () => {
    const user: ICreateUserDTO = {
      email: "rphmota@gmail.com",
      password: "123456",
      name: "Raphael",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    const user_id = userCreated.id as string

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 535,
      description: "MONEY",
    })

    const balance = await getBalanceUseCase.execute({user_id})

    expect(balance.statement[0]).toHaveProperty("id")
    expect(balance.statement.length).toBe(1)
    expect(balance.balance).toEqual(535)
  })

  it("should not be able to get balance from a not user", async () => {
    expect(async () => {
      const user_id = "oinweoweonn2"
      await getBalanceUseCase.execute({user_id})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})