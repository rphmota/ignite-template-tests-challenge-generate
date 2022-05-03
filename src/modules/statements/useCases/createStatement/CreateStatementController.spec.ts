import request from "supertest";
import { Connection } from "typeorm";


import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let testUser: {
  id: string;
  name: string;
  email: string;
  password: string;
}

describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userCreated = await request(app).post("/api/v1/users").send({
      name: "Raphael",
      email: "raphael@gmail.com",
      password: "123456"
    })   

    testUser = {
      id: userCreated.body.id,
      name: userCreated.body.name,
      email: userCreated.body.email,
      password: "123456"
    }
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to deposit", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "raphael@gmail.com",
      password: "123456"
    });
    

    const { token } = responseToken.body;

    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 198,
      description: "MONEY"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.user_id).toEqual(testUser.id)
    expect(response.body.amount).toBe(198)
    expect(response.body.type).toEqual("deposit")
  });

  it("should be able to withdraw", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: testUser.email,
      password: testUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 10,
      description: "BYE MONEY"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.user_id).toEqual(testUser.id)
    expect(response.body.amount).toBe(10)
    expect(response.body.type).toEqual("withdraw")
  });

  it("should not be able to deposit/withdraw with not user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "rphmota@gmail.com",
      password: "065006",
    });

    expect(responseToken.status).toBe(401)
    expect(responseToken.body.message).toEqual('Incorrect email or password')
    expect(responseToken.body.token).toBe(undefined)
    const { token } = responseToken.body;

    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 61,
      description: "MONEY"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(401)
    expect(response.body.message).toEqual('JWT invalid token!')
  });

  it("should not be able to withdraw without money", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "raphael@gmail.com",
      password: "123456"
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 6514,
      description: "BURN"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('Insufficient funds')
  });
});