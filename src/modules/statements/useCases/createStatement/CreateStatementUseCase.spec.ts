import { Statement } from './../../entities/Statement';
import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { CreateStatementError } from './CreateStatementError';

let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to make deposit", async () => {
    const user: ICreateUserDTO = {
      email: "rphmota@gmail.com",
      password: "123456",
      name: "raphael",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    const user_id = userCreated.id as string

    const deposit: ICreateStatementDTO = {
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "MONEY",
    }

    const resultDeposit = await createStatementUseCase.execute(deposit)

    expect(resultDeposit).toHaveProperty("id")
    expect(resultDeposit.user_id).toEqual(user_id)
    expect(resultDeposit.amount).toEqual(deposit.amount)
    expect(resultDeposit.type).toEqual(deposit.type)
  })

  it("should be able to make withdraw", async () => {
    const user: ICreateUserDTO = {
      email: "rphmota@gmail.com",
      password: "123456",
      name: "Raphael",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    const user_id = userCreated.id as string

    const deposit: ICreateStatementDTO = {
      user_id,
      type: "deposit" as OperationType,
      amount: 112,
      description: "MONEY",
    }

    await createStatementUseCase.execute(deposit)

    const withdraw: ICreateStatementDTO = {
      user_id,
      type: "withdraw" as OperationType,
      amount: 30,
      description: "BYE MONEY",
    }

    const resultWithdraw = await createStatementUseCase.execute(withdraw)

    expect(resultWithdraw).toBeInstanceOf(Statement)
    expect(resultWithdraw).toHaveProperty("id")
    expect(resultWithdraw.user_id).toEqual(user_id)
    expect(resultWithdraw.type).toEqual(withdraw.type)
    expect(resultWithdraw.amount).toEqual(withdraw.amount)
  })

  it("should not be able to deposit/withdraw a not user", async () => {
    expect(async () => {
      const user_id = "roiunwvnvw9834"
      const deposit: ICreateStatementDTO = {
        user_id,
        type: "deposit" as OperationType,
        amount: 95,
        description: "MONEY",
      }

      await createStatementUseCase.execute(deposit)
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to withdraw without money", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "rphmota@gmail.com",
        password: "123456",
        name: "Raphael",
      };

      const userCreated = await createUserUseCase.execute(user);

      expect(userCreated).toHaveProperty("id");
      const user_id = userCreated.id as string

      const withdraw: ICreateStatementDTO = {
        user_id,
        type: "withdraw" as OperationType,
        amount: 55,
        description: "BYE MONEY",
      }

      await createStatementUseCase.execute(withdraw)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})