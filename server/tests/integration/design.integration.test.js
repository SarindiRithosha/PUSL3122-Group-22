const request = require("supertest");
const express = require("express");
const { connect, disconnect, clearDB } = require("./setup");
const designRoutes = require("../../routes/designRoutes");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.adminUser = { id: "test-admin" }; next(); });
  app.use("/api/designs", designRoutes);
  return app;
};

let app;

beforeAll(async () => {
  await connect();
  app = buildApp();
});
afterAll(async () => await disconnect());
afterEach(async () => await clearDB());

describe("Design API — Integration Tests", () => {

  const validDesign = {
    name:        "Scandinavian Living Room",
    clientName:  "Jane Smith",
    designStyle: "Scandinavian",
    roomType:    "Living Room",
    room: {
      name:  "Main Room",
      shape: "Rectangular",
      dimensions: { width: 5, length: 4, height: 2.8 },
    },
    placedItems: [],
  };

  //  1. Create design 
  it("POST /api/designs — creates a design with correct fields", async () => {
    const res = await request(app).post("/api/designs").send(validDesign);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Scandinavian Living Room");
    expect(res.body.data.status).toBe("Draft");
    expect(res.body.data.designStyle).toBe("Scandinavian");
  });

  //  2. Fetch designs list 
  it("GET /api/designs — returns all created designs", async () => {
    await request(app).post("/api/designs").send(validDesign);
    await request(app).post("/api/designs").send({ ...validDesign, name: "Minimalist Bedroom", designStyle: "Minimalist", roomType: "Bedroom" });

    const res = await request(app).get("/api/designs");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });

  //  3. Update (edit) design 
  it("PUT /api/designs/:id — editing a design saves updated fields", async () => {
    const createRes = await request(app).post("/api/designs").send(validDesign);
    const id = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/designs/${id}`)
      .send({ name: "Updated Design Name", clientName: "Bob" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe("Updated Design Name");
    expect(updateRes.body.data.clientName).toBe("Bob");
  });

  //  4. Publish design 
  it("PATCH /api/designs/:id/publish — changes status to Published", async () => {
    const createRes = await request(app).post("/api/designs").send(validDesign);
    const id = createRes.body.data._id;

    expect(createRes.body.data.status).toBe("Draft");

    const publishRes = await request(app).patch(`/api/designs/${id}/publish`);

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe("Published");
  });

  //  5. Delete design 
  it("DELETE /api/designs/:id — removes design and GET returns 404", async () => {
    const createRes = await request(app).post("/api/designs").send(validDesign);
    const id = createRes.body.data._id;

    const deleteRes = await request(app).delete(`/api/designs/${id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/designs/${id}`);
    expect(getRes.status).toBe(404);
  });
});