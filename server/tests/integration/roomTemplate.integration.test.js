const request = require("supertest");
const express = require("express");
const { connect, disconnect, clearDB } = require("./setup");
const roomRoutes = require("../../routes/roomTemplateRoutes");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.adminUser = { id: "test-admin" }; next(); });
  app.use("/api/rooms", roomRoutes);
  return app;
};

let app;

beforeAll(async () => {
  await connect();
  app = buildApp();
});
afterAll(async () => await disconnect());
afterEach(async () => await clearDB());

describe("Room Template API — Integration Tests", () => {

  const validRoom = {
    name:       "Standard Bedroom",
    shape:      "Rectangular",
    dimensions: { width: 4, length: 3, height: 2.5 },
    floorColors: ["#C8A882"],
    wallColors:  ["#F5F5F0"],
    status:     "Draft",
  };

  //  1. Create room template 
  it("POST /api/rooms — creates a template with correct defaults", async () => {
    const res = await request(app).post("/api/rooms").send(validRoom);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Standard Bedroom");
    expect(res.body.data.shape).toBe("Rectangular");
    expect(res.body.data.status).toBe("Draft");
  });

  //  2. List room templates 
  it("GET /api/rooms — lists all templates", async () => {
    await request(app).post("/api/rooms").send(validRoom);
    await request(app).post("/api/rooms").send({ ...validRoom, name: "L-Shape Studio", shape: "L-Shape" });

    const res = await request(app).get("/api/rooms");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  //  3. Get by ID 
  it("GET /api/rooms/:id — returns the correct template", async () => {
    const createRes = await request(app).post("/api/rooms").send(validRoom);
    const id = createRes.body.data._id;

    const res = await request(app).get(`/api/rooms/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  //  4. Update room template 
  it("PUT /api/rooms/:id — updates the template name", async () => {
    const createRes = await request(app).post("/api/rooms").send(validRoom);
    const id = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/rooms/${id}`)
      .send({ name: "Renamed Bedroom", status: "Published" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe("Renamed Bedroom");
    expect(updateRes.body.data.status).toBe("Published");
  });

  //  5. Delete room template 
  it("DELETE /api/rooms/:id — removes template, GET returns 404", async () => {
    const createRes = await request(app).post("/api/rooms").send(validRoom);
    const id = createRes.body.data._id;

    const deleteRes = await request(app).delete(`/api/rooms/${id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/rooms/${id}`);
    expect(getRes.status).toBe(404);
  });
});