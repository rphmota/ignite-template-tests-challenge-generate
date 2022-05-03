import request from "supertest";
import { Connection } from "typeorm";


import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;
let testUser: {
  name: string;
  email: string;
  password: string;
}

describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    testUser = {
        name: "Raphael",
        email: "raphael@gmail.com",
        password: "123456"
    }

    await request(app).post("/api/v1/users").send(testUser)
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: testUser.email,
      password: testUser.password,
    });

    const { token } = response.body;

    

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
    expect(response.body.user.email).toEqual(testUser.email)
    expect(token).not.toBeUndefined()
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "usernonexistent@email.com",
      password: "usernonexistentpassword",
    });

    expect(responseToken.status).toBe(401)
    expect(responseToken.body.message).toEqual('Incorrect email or password')
    expect(responseToken.body.token).toBe(undefined)
  });

  it("should not be able to authenticate user with wrong password", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(responseToken.status).toBe(401)
    expect(responseToken.body.message).toEqual('Incorrect email or password')
    expect(responseToken.body.token).toBe(undefined)
  });
});