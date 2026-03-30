import express from "express"
import {
  getAuthenticatedEmail,
  getRegistration,
  getAppointment,
  saveAppointment,
  removeAppointment,
  getRegistrationStatus,
  saveRegistration,
  saveHouseholdMembers,
} from "../api/applicantApi.js"
import {
  requireAuth,
  requireApplicant,
} from "../middleware/requireAuth.js"
import {
  validateApplicantRegistration,
} from "../lib/validateApplicantRegistration.js"

const router = express.Router()

function sendMissingEmailError(res) {
  return res.status(400).json({ error: "Authenticated user email is missing." })
}

router.get("/registration", requireAuth, requireApplicant, async (req, res) => {
  const email = getAuthenticatedEmail(req.user?.email)
  if (!email) {
    return sendMissingEmailError(res)
  }

  try {
    const registration = await getRegistration(email)

    return res.status(200).json({
      ok: true,
      data: {
        registration,
      },
    })
  } catch (_err) {
    return res.status(500).json({ error: "Unable to read registration data." })
  }
})

router.get("/appointment", requireAuth, requireApplicant, async (req, res) => {
  const email = getAuthenticatedEmail(req.user?.email)
  if (!email) {
    return sendMissingEmailError(res)
  }

  try {
    const appointment = await getAppointment(email)

    return res.status(200).json({
      ok: true,
      data: {
        appointment,
      },
    })
  } catch (_err) {
    return res.status(500).json({ error: "Unable to read appointment data." })
  }
})

router.put("/appointment", requireAuth, requireApplicant, async (req, res) => {
  const email = getAuthenticatedEmail(req.user?.email)
  if (!email) {
    return sendMissingEmailError(res)
  }

  try {
    const appointment = await saveAppointment(email, req.body)

    return res.status(200).json({
      ok: true,
      data: {
        appointment,
      },
    })
  } catch (err) {
    const status = err?.status || 500
    if (status === 400) {
      return res.status(status).json({ error: err.message })
    }
    return res.status(500).json({ error: "Unable to save appointment." })
  }
})

router.delete("/appointment", requireAuth, requireApplicant, async (req, res) => {
  const email = getAuthenticatedEmail(req.user?.email)
  if (!email) {
    return sendMissingEmailError(res)
  }

  try {
    const result = await removeAppointment(email)
    return res.status(200).json({ ok: true, data: result })
  } catch (_err) {
    return res.status(500).json({ error: "Unable to cancel appointment." })
  }
})

router.get(
  "/registration-status",
  requireAuth,
  requireApplicant,
  async (req, res) => {
    const email = getAuthenticatedEmail(req.user?.email)
    if (!email) {
      return sendMissingEmailError(res)
    }

    try {
      const statusData = await getRegistrationStatus(email)

      return res.status(200).json({
        ok: true,
        data: {
          completed: statusData.completed,
        },
      })
    } catch (_err) {
      return res
        .status(500)
        .json({ error: "Unable to read registration status." })
    }
  },
)

router.post("/register", requireAuth, requireApplicant, async (req, res) => {
  const { errors, values } = validateApplicantRegistration(req.body || {})
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors })
  }

  const email = getAuthenticatedEmail(req.user?.email)
  if (!email) {
    return sendMissingEmailError(res)
  }

  try {
    await saveRegistration(email, values, req.body?.householdMembers)

    return res.status(200).json({
      ok: true,
      data: {
        email,
      },
    })
  } catch (err) {
    const status = err?.status || 500
    if (status === 400) {
      return res.status(status).json({ error: err.message })
    }
    return res.status(500).json({ error: err?.message || "Unable to save registration." })
  }
})

router.post("/household-members", requireAuth, requireApplicant, async (req, res) => {
  const email = getAuthenticatedEmail(req.user?.email)
  if (!email) {
    return sendMissingEmailError(res)
  }

  try {
    await saveHouseholdMembers(email, req.body?.householdMembers)

    return res.status(200).json({
      ok: true,
      data: {
        saved: true,
      },
    })
  } catch (err) {
    const status = err?.status || 500
    if (status === 400) {
      return res.status(status).json({ error: err.message })
    }
    return res.status(500).json({ error: err?.message || "Unable to save household members." })
  }
})

export default router
