const express = require("express");
const {
  getSupabaseServiceClient,
  APPLICANT_TABLE,
  APPLICANT_EMAIL_COLUMN,
  APPOINTMENT_TABLE,
  APPOINTMENT_ID_COLUMN,
  APPOINTMENT_RESPONSE_ID_COLUMN,
  APPOINTMENT_DATE_COLUMN,
  APPOINTMENT_TIME_COLUMN,
  APPOINTMENT_DURATION_COLUMN,
  APPOINTMENT_STATUS_COLUMN,
} = require("../lib/supabase");
const {
  requireAuth,
  requireApplicant,
  normalizeEmail,
} = require("../middleware/requireAuth");
const {
  validateApplicantRegistration,
  isRegistrationComplete,
} = require("../lib/validateApplicantRegistration");

const router = express.Router();

function formatTime12h(timeString) {
  if (!timeString) return "";
  const parts = String(timeString).split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function parseIntervalMinutes(intervalValue) {
  if (!intervalValue) return 0;
  const parts = String(intervalValue).split(":").map((v) => Number(v || 0));
  if (parts.length < 2 || parts.some(Number.isNaN)) return 0;
  const [hours, minutes] = parts;
  return hours * 60 + minutes;
}

function addMinutesToTimeString(timeString, minutesToAdd) {
  const parts = String(timeString || "").split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  const total = hour * 60 + minute + Number(minutesToAdd || 0);
  const wrapped = ((total % 1440) + 1440) % 1440;
  const nextHour = Math.floor(wrapped / 60);
  const nextMinute = wrapped % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function buildAppointmentPayload(appointmentRow) {
  if (!appointmentRow) return null;

  const dateValue = appointmentRow[APPOINTMENT_DATE_COLUMN];
  const timeValue = appointmentRow[APPOINTMENT_TIME_COLUMN];
  const durationValue = appointmentRow[APPOINTMENT_DURATION_COLUMN];

  if (!dateValue || !timeValue) return null;

  const durationMinutes = parseIntervalMinutes(durationValue) || 15;
  const startTimeHHMM = String(timeValue).slice(0, 5);

  // Parse at noon to avoid timezone day shifting for date-only values.
  const dateObj = new Date(`${dateValue}T12:00:00`);
  const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });

  return {
    appointmentId: appointmentRow[APPOINTMENT_ID_COLUMN],
    day,
    date: new Date(`${dateValue}T${String(timeValue).slice(0, 8)}`).toISOString(),
    startTime: startTimeHHMM,
    duration: durationMinutes,
    status: appointmentRow[APPOINTMENT_STATUS_COLUMN] || "booked",
  };
}

function toDbDateOnly(dateValue) {
  if (!dateValue) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function normalizeTimeForDb(timeValue) {
  if (!timeValue) return "";
  const parts = String(timeValue).split(":");
  const hour = Number(parts[0] || 0);
  const minute = Number(parts[1] || 0);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function intervalFromMinutes(durationMinutes) {
  const mins = Number(durationMinutes);
  if (!Number.isFinite(mins) || mins <= 0) return "00:15:00";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

async function getApplicantResponseId(supabase, email) {
  const { data, error } = await supabase
    .from(APPLICANT_TABLE)
    .select("response_id")
    .eq(APPLICANT_EMAIL_COLUMN, email)
    .maybeSingle();

  if (error) {
    return { error };
  }

  return { responseId: data?.response_id || null };
}

async function getLatestActiveAppointment(supabase, responseId) {
  const { data, error } = await supabase
    .from(APPOINTMENT_TABLE)
    .select("*")
    .eq(APPOINTMENT_RESPONSE_ID_COLUMN, responseId)
    .order(APPOINTMENT_DATE_COLUMN, { ascending: false })
    .order(APPOINTMENT_TIME_COLUMN, { ascending: false })
    .limit(1);

  if (error) {
    return { error };
  }

  return { appointment: data?.[0] || null };
}

router.get("/registration", requireAuth, requireApplicant, async (req, res) => {
  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res
      .status(400)
      .json({ error: "Authenticated user email is missing." });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from(APPLICANT_TABLE)
      .select("*")
      .eq(APPLICANT_EMAIL_COLUMN, email)
      .maybeSingle();

    if (error) {
      return res
        .status(500)
        .json({ error: "Unable to read registration data." });
    }

    if (!data) {
      return res.status(200).json({
        ok: true,
        data: {
          registration: null,
        },
      });
    }

    return res.status(200).json({
      ok: true,
      data: {
        registration: {
          email: data.email_address || email,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          name: [data.first_name, data.last_name].filter(Boolean).join(" "),
          phone: data.phone || "",
          streetAddress: data.street_addr || "",
          city: data.city || "",
          postalCode: data.postal_code || "",
          statusInCanada: data.status_in_canada || "",
          applyingToTinyBundles: data.tiny_bundles_program ? "yes" : "no",
          province: "British Columbia",
          language: "English",
          householdMembers: "",
        },
      },
    });
  } catch (_err) {
    return res.status(500).json({ error: "Unable to read registration data." });
  }
});

router.get("/appointment", requireAuth, requireApplicant, async (req, res) => {
  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res
      .status(400)
      .json({ error: "Authenticated user email is missing." });
  }

  try {
    const supabase = getSupabaseServiceClient();

    const { responseId, error: registrationError } = await getApplicantResponseId(
      supabase,
      email,
    );

    if (registrationError) {
      return res
        .status(500)
        .json({ error: "Unable to read appointment data." });
    }

    if (!responseId) {
      return res.status(200).json({
        ok: true,
        data: {
          appointment: null,
        },
      });
    }

    const { appointment: latestAppointment, error: appointmentError } =
      await getLatestActiveAppointment(supabase, responseId);

    if (appointmentError) {
      return res
        .status(500)
        .json({ error: "Unable to read appointment data." });
    }

    const appointment = buildAppointmentPayload(latestAppointment);

    return res.status(200).json({
      ok: true,
      data: {
        appointment,
      },
    });
  } catch (_err) {
    return res.status(500).json({ error: "Unable to read appointment data." });
  }
});

router.put("/appointment", requireAuth, requireApplicant, async (req, res) => {
  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res
      .status(400)
      .json({ error: "Authenticated user email is missing." });
  }

  const date = toDbDateOnly(req.body?.date);
  const startTime = normalizeTimeForDb(req.body?.startTime);
  const duration = intervalFromMinutes(req.body?.duration);

  if (!date || !startTime) {
    return res.status(400).json({ error: "Appointment date and time are required." });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { responseId, error: registrationError } = await getApplicantResponseId(
      supabase,
      email,
    );

    if (registrationError) {
      return res.status(500).json({ error: "Unable to save appointment." });
    }

    if (!responseId) {
      return res.status(400).json({ error: "Please complete registration before booking." });
    }

    const { appointment: existingAppointment, error: existingError } =
      await getLatestActiveAppointment(supabase, responseId);

    if (existingError) {
      return res.status(500).json({ error: "Unable to save appointment." });
    }

    const payload = {
      [APPOINTMENT_RESPONSE_ID_COLUMN]: responseId,
      [APPOINTMENT_DATE_COLUMN]: date,
      [APPOINTMENT_TIME_COLUMN]: startTime,
      [APPOINTMENT_DURATION_COLUMN]: duration,
      [APPOINTMENT_STATUS_COLUMN]: "booked",
    };

    let savedRow;

    if (existingAppointment?.[APPOINTMENT_ID_COLUMN]) {
      const { data: updatedRows, error: updateError } = await supabase
        .from(APPOINTMENT_TABLE)
        .update(payload)
        .eq(APPOINTMENT_ID_COLUMN, existingAppointment[APPOINTMENT_ID_COLUMN])
        .select("*");

      if (updateError) {
        return res.status(500).json({ error: "Unable to save appointment." });
      }

      savedRow = updatedRows?.[0] || null;
    } else {
      const { data: insertedRows, error: insertError } = await supabase
        .from(APPOINTMENT_TABLE)
        .insert([payload])
        .select("*");

      if (insertError) {
        return res.status(500).json({ error: "Unable to save appointment." });
      }

      savedRow = insertedRows?.[0] || null;
    }

    return res.status(200).json({
      ok: true,
      data: {
        appointment: buildAppointmentPayload(savedRow),
      },
    });
  } catch (_err) {
    return res.status(500).json({ error: "Unable to save appointment." });
  }
});

router.delete("/appointment", requireAuth, requireApplicant, async (req, res) => {
  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res
      .status(400)
      .json({ error: "Authenticated user email is missing." });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { responseId, error: registrationError } = await getApplicantResponseId(
      supabase,
      email,
    );

    if (registrationError) {
      return res.status(500).json({ error: "Unable to cancel appointment." });
    }

    if (!responseId) {
      return res.status(200).json({ ok: true, data: { removed: false } });
    }

    const { appointment: existingAppointment, error: existingError } =
      await getLatestActiveAppointment(supabase, responseId);

    if (existingError) {
      return res.status(500).json({ error: "Unable to cancel appointment." });
    }

    if (!existingAppointment?.[APPOINTMENT_ID_COLUMN]) {
      return res.status(200).json({ ok: true, data: { removed: false } });
    }

    const { error: deleteError } = await supabase
      .from(APPOINTMENT_TABLE)
      .delete()
      .eq(APPOINTMENT_ID_COLUMN, existingAppointment[APPOINTMENT_ID_COLUMN]);

    if (deleteError) {
      return res.status(500).json({ error: "Unable to cancel appointment." });
    }

    return res.status(200).json({ ok: true, data: { removed: true } });
  } catch (_err) {
    return res.status(500).json({ error: "Unable to cancel appointment." });
  }
});

router.get(
  "/registration-status",
  requireAuth,
  requireApplicant,
  async (req, res) => {
    const email = normalizeEmail(req.user?.email);
    if (!email) {
      return res
        .status(400)
        .json({ error: "Authenticated user email is missing." });
    }

    try {
      const supabase = getSupabaseServiceClient();
      const { data, error } = await supabase
        .from(APPLICANT_TABLE)
        .select("*")
        .eq(APPLICANT_EMAIL_COLUMN, email)
        .maybeSingle();

      if (error) {
        return res
          .status(500)
          .json({ error: "Unable to read registration status." });
      }

      return res.status(200).json({
        ok: true,
        data: {
          completed: isRegistrationComplete(data),
        },
      });
    } catch (_err) {
      return res
        .status(500)
        .json({ error: "Unable to read registration status." });
    }
  },
);

router.post("/register", requireAuth, requireApplicant, async (req, res) => {
  const { errors, values } = validateApplicantRegistration(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors });
  }

  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res.status(400).json({ error: "Authenticated user email is missing." });
  }

  const payload = {
    ...values,
    [APPLICANT_EMAIL_COLUMN]: email,
  };

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase
      .from(APPLICANT_TABLE)
      .upsert(payload, { onConflict: APPLICANT_EMAIL_COLUMN });

    if (error) {
      return res.status(500).json({ error: "Unable to save registration." });
    }

    return res.status(200).json({
      ok: true,
      data: {
        email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Unable to save registration." });
  }
});

module.exports = router;
