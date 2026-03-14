const request = require("supertest");
const express = require("express");
const { connect, disconnect, clearDB } = require("./setup");
const furnitureRoutes = require("../../routes/furnitureRoutes");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  // Skip admin auth — just set a dummy user
  app.use((req, _res, next) => { req.adminUser = { id: "test-admin" }; next(); });
  app.use("/api/furniture", furnitureRoutes);
  return app;
};

let app;

beforeAll(async () => {
  await connect();
  app = buildApp();
});
afterAll(async () => await disconnect());
afterEach(async () => await clearDB());

describe("Furniture API — Integration Tests", () => {

  const validPayload = {
    modelId:  "INT-CHAIR-01",
    name:     "Integration Chair",
    category: "Chair",
    price:    15000,
    status:   "Draft",
  };

  //  1. Create furniture 
  it("POST /api/furniture — creates an item and returns 201", async () => {
    const res = await request(app)
      .post("/api/furniture")
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Integration Chair");
    expect(res.body.data.modelId).toBe("INT-CHAIR-01");
  });

  //  2. Fetch furniture list 
  it("GET /api/furniture — returns a list with pagination", async () => {
    // Seed two items
    await request(app).post("/api/furniture").send({ ...validPayload, modelId: "INT-LIST-01" });
    await request(app).post("/api/furniture").send({ ...validPayload, modelId: "INT-LIST-02", name: "Integration Table" });

    const res = await request(app).get("/api/furniture");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toHaveProperty("total", 2);
  });

  //  3. Get by ID 
  it("GET /api/furniture/:id — returns the correct item", async () => {
    const createRes = await request(app).post("/api/furniture").send(validPayload);
    const id = createRes.body.data._id;

    const res = await request(app).get(`/api/furniture/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
    expect(res.body.data.category).toBe("Chair");
  });

  //  4. Update furniture 
  it("PUT /api/furniture/:id — updates the item and reflects changes", async () => {
    const createRes = await request(app).post("/api/furniture").send(validPayload);
    const id = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/furniture/${id}`)
      .send({ name: "Updated Chair", price: 18000 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe("Updated Chair");
    expect(updateRes.body.data.price).toBe(18000);
  });

  //  5. Delete furniture 
  it("DELETE /api/furniture/:id — removes the item and subsequent GET returns 404", async () => {
    const createRes = await request(app).post("/api/furniture").send(validPayload);
    const id = createRes.body.data._id;

    const deleteRes = await request(app).delete(`/api/furniture/${id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/furniture/${id}`);
    expect(getRes.status).toBe(404);
  });
});