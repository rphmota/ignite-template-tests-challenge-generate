import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let createUserUseCase: CreateUserUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase
let createStatementUseCase: CreateStatementUseCase
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    usersRepositoryInMemory = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to get statement", async () => {
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
      amount: 26,
      description: "MONEY",
    }

    const resultDeposit = await createStatementUseCase.execute(deposit)

    expect(resultDeposit).toHaveProperty("id")
    const statement_id = resultDeposit.id as string

    const resultStatement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    })

    expect(resultStatement).toHaveProperty("id")
    expect(resultStatement.id).toEqual(statement_id)
    expect(resultStatement.user_id).toEqual(user_id)
    expect(resultStatement.type).toEqual(deposit.type)
    expect(resultStatement.amount).toEqual(deposit.amount)
  })

  it("should be not able to get statement from a not user", async () => {
    expect(async () => {
      const user_id = "oisndosnfos"
      const statement_id = "nsd87b9knoimoiwe"
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should be not able to get not exist statement", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "rphmota@gmail.com",
        password: "123456",
        name: "Raphael",
      };

      const userCreated = await createUserUseCase.execute(user);

      expect(userCreated).toHaveProperty("id");
      const user_id = userCreated.id as string
      const statement_id = "oisdniosn9874i3oin"

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})