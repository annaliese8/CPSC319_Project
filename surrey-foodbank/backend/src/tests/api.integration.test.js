import request from "supertest"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../api/applicants.js", () => ({
  getApplicants: vi.fn(),
  updateApplicant: vi.fn(),
}))

vi.mock("../api/applicantApi.js", () => ({
  getAuthenticatedEmail: vi.fn((email) => String(email || "").trim().toLowerCase()),
  getRegistration: vi.fn(),
  getAppointment: vi.fn(),
  saveAppointment: vi.fn(),
  removeAppointment: vi.fn(),
  getRegistrationStatus: vi.fn(),
  saveRegistration: vi.fn(),
  saveHouseholdMembers: vi.fn(),
}))

vi.mock("../middleware/requireAuth.js", () => ({
  normalizeEmail: (value) => String(value || "").trim().toLowerCase(),
  requireAuth: vi.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Missing bearer token." })
    }

    req.user = { email: "applicant@example.com" }
    req.accessToken = "test-token"
    return next()
  }),
  requireApplicant: vi.fn((_req, _res, next) => next()),
}))

import { app } from "../server.js"
import { getApplicants, updateApplicant } from "../api/applicants.js"
import { getRegistrationStatus, saveAppointment } from "../api/applicantApi.js"

describe("backend integration: api endpoints", () => {
  let authHeader

  beforeAll(() => {
    authHeader = "Bearer test-token"
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET /api/applicants returns 200 with applicant list", async () => {
    const applicants = [{ response_id: 101, first_name: "Sam" }]
    getApplicants.mockResolvedValue(applicants)

    const response = await request(app).get("/api/applicants")

    expect(response.status).toBe(200)
    expect(response.body).toEqual(applicants)
    expect(getApplicants).toHaveBeenCalledTimes(1)
  })

  it("PATCH /api/applicants/:id returns 200 with updated applicant", async () => {
    const updatedApplicant = { response_id: 101, city: "Surrey" }
    updateApplicant.mockResolvedValue(updatedApplicant)

    const response = await request(app)
      .patch("/api/applicants/101")
      .send({ city: "Surrey" })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(updatedApplicant)
    expect(updateApplicant).toHaveBeenCalledWith("101", { city: "Surrey" })
  })

  it("GET /api/applicant/registration returns 401 when bearer token is missing", async () => {
    const response = await request(app).get("/api/applicant/registration")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: "Missing bearer token." })
  })

  it("GET /api/applicant/registration-status returns 200 with completed flag", async () => {
    getRegistrationStatus.mockResolvedValue({ completed: true })

    const response = await request(app)
      .get("/api/applicant/registration-status")
      .set("Authorization", authHeader)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      ok: true,
      data: {
        completed: true,
      },
    })
    expect(getRegistrationStatus).toHaveBeenCalledWith("applicant@example.com")
  })

  it("PUT /api/applicant/appointment returns 400 when appointment payload is invalid", async () => {
    const badRequestError = new Error("Appointment date and time are required.")
    badRequestError.status = 400
    saveAppointment.mockRejectedValue(badRequestError)

    const response = await request(app)
      .put("/api/applicant/appointment")
      .set("Authorization", authHeader)
      .send({ date: "", startTime: "" })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: "Appointment date and time are required." })
    expect(saveAppointment).toHaveBeenCalledWith("applicant@example.com", { date: "", startTime: "" })
  })
})
