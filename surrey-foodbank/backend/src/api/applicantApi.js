import {
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
    HOUSEHOLD_TABLE,
    HOUSEHOLD_ID_COLUMN,
    HOUSEHOLD_RESPONSE_ID_COLUMN,
    HOUSEHOLD_FIRST_NAME_COLUMN,
    HOUSEHOLD_LAST_NAME_COLUMN,
    HOUSEHOLD_CATEGORY_COLUMN,
} from "../lib/supabase.js"
import { normalizeEmail } from "../middleware/requireAuth.js"
import { isRegistrationComplete } from "../lib/validateApplicantRegistration.js"
import { sendCancellationEmail, sendConfirmationEmail } from "./applicants.js"

function makeHttpError(status, message) {
    const err = new Error(message)
    err.status = status
    return err
}

function parseIntervalMinutes(intervalValue) {
    if (!intervalValue) return 0
    const parts = String(intervalValue).split(":").map((v) => Number(v || 0))
    if (parts.length < 2 || parts.some(Number.isNaN)) return 0
    const [hours, minutes] = parts
    return hours * 60 + minutes
}

function buildAppointmentPayload(appointmentRow) {
    if (!appointmentRow) return null

    const dateValue = appointmentRow[APPOINTMENT_DATE_COLUMN]
    const timeValue = appointmentRow[APPOINTMENT_TIME_COLUMN]
    const durationValue = appointmentRow[APPOINTMENT_DURATION_COLUMN]

    if (!dateValue || !timeValue) return null

    const durationMinutes = parseIntervalMinutes(durationValue) || 15
    const startTimeHHMM = String(timeValue).slice(0, 5)

    // Parse at noon to avoid timezone day shifting for date-only values.
    const dateObj = new Date(`${dateValue}T12:00:00`)
    const day = dateObj.toLocaleDateString("en-US", { weekday: "long" })

    return {
        appointmentId: appointmentRow[APPOINTMENT_ID_COLUMN],
        day,
        date: new Date(`${dateValue}T${String(timeValue).slice(0, 8)}`).toISOString(),
        startTime: startTimeHHMM,
        duration: durationMinutes,
        status: appointmentRow[APPOINTMENT_STATUS_COLUMN] || "booked",
    }
}

function toDbDateOnly(dateValue) {
    if (!dateValue) return ""
    const parsed = new Date(dateValue)
    if (Number.isNaN(parsed.getTime())) return ""
    return parsed.toISOString().slice(0, 10)
}

function normalizeTimeForDb(timeValue) {
    if (!timeValue) return ""
    const parts = String(timeValue).split(":")
    const hour = Number(parts[0] || 0)
    const minute = Number(parts[1] || 0)
    if (Number.isNaN(hour) || Number.isNaN(minute)) return ""
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
}

function intervalFromMinutes(durationMinutes) {
    const mins = Number(durationMinutes)
    if (!Number.isFinite(mins) || mins <= 0) return "00:15:00"
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
}

async function getApplicantResponseId(supabase, email) {
    const { data, error } = await supabase
        .from(APPLICANT_TABLE)
        .select("response_id")
        .eq(APPLICANT_EMAIL_COLUMN, email)
        .maybeSingle()

    if (error) {
        throw makeHttpError(500, "Unable to read applicant data.")
    }

    return data?.response_id || null
}

async function getApplicantName(supabase, email) {
    const { data, error } = await supabase
        .from(APPLICANT_TABLE)
        .select("first_name, last_name")
        .eq(APPLICANT_EMAIL_COLUMN, email)
        .maybeSingle()

    if (error) {
        throw makeHttpError(500, "Unable to read applicant data.")
    }

    return data;
}

async function getLatestActiveAppointment(supabase, responseId) {
    const { data, error } = await supabase
        .from(APPOINTMENT_TABLE)
        .select("*")
        .eq(APPOINTMENT_RESPONSE_ID_COLUMN, responseId)
        .neq(APPOINTMENT_STATUS_COLUMN, "held")
        .neq(APPOINTMENT_STATUS_COLUMN, "cancelled")
        .neq(APPOINTMENT_STATUS_COLUMN, "blocked")
        .order(APPOINTMENT_DATE_COLUMN, { ascending: false })
        .order(APPOINTMENT_TIME_COLUMN, { ascending: false })
        .limit(1)

    if (error) {
        throw makeHttpError(500, "Unable to read appointment data.")
    }

    return data?.[0] || null
}

async function getApplicantRegistrationByEmail(supabase, email) {
    const { data, error } = await supabase
        .from(APPLICANT_TABLE)
        .select("*")
        .eq(APPLICANT_EMAIL_COLUMN, email)
        .maybeSingle()

    if (error) {
        throw makeHttpError(500, "Unable to read registration data.")
    }

    return data || null
}

async function getHouseholdMembersByResponseId(supabase, responseId) {
    if (!responseId) return []

    const { data, error } = await supabase
        .from(HOUSEHOLD_TABLE)
        .select("*")
        .eq(HOUSEHOLD_RESPONSE_ID_COLUMN, responseId)
        .order(HOUSEHOLD_ID_COLUMN, { ascending: true })

    if (error) {
        throw makeHttpError(500, "Unable to read household member data.")
    }

    return (data).map((row) => ({
        id: String(row[HOUSEHOLD_ID_COLUMN]),
        firstName: row[HOUSEHOLD_FIRST_NAME_COLUMN],
        lastName: row[HOUSEHOLD_LAST_NAME_COLUMN],
        ageGroup: row[HOUSEHOLD_CATEGORY_COLUMN],
    }))
}

async function syncHouseholdMembers(supabase, responseId, householdMembers) {
    if (!Array.isArray(householdMembers)) return

    const members = householdMembers
        .filter((member) => {
            const ageGroup = String(member?.ageGroup || "").toLowerCase()
            return ageGroup === "adult" || ageGroup === "child" || ageGroup === "infant"
        })
        .map((member) => ({
            [HOUSEHOLD_RESPONSE_ID_COLUMN]: responseId,
            [HOUSEHOLD_FIRST_NAME_COLUMN]: String(member?.firstName).trim(),
            [HOUSEHOLD_LAST_NAME_COLUMN]: String(member?.lastName).trim(),
            [HOUSEHOLD_CATEGORY_COLUMN]: String(member?.ageGroup || "").toLowerCase(),
        }))
        .filter((member) => member[HOUSEHOLD_FIRST_NAME_COLUMN] && member[HOUSEHOLD_LAST_NAME_COLUMN])

    const { error: deleteError } = await supabase
        .from(HOUSEHOLD_TABLE)
        .delete()
        .eq(HOUSEHOLD_RESPONSE_ID_COLUMN, responseId)

    if (deleteError) {
        throw makeHttpError(500, deleteError.message || "Unable to save household member data.")
    }

    if (members.length === 0) return

    const { error: insertError } = await supabase
        .from(HOUSEHOLD_TABLE)
        .insert(members)

    if (insertError) {
        throw makeHttpError(500, insertError.message || "Unable to save household member data.")
    }
}

function getAuthenticatedEmail(rawEmail) {
    return normalizeEmail(rawEmail)
}

async function getRegistration(email) {
    const supabase = getSupabaseServiceClient()
    const data = await getApplicantRegistrationByEmail(supabase, email)

    if (!data) return null

    const responseId = data.response_id || null
    const householdMembers = await getHouseholdMembersByResponseId(supabase, responseId)

    return {
        email_address: data.email_address || email,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        street_addr: data.street_addr || "",
        city: data.city || "",
        postal_code: data.postal_code || "",
        status_in_canada: data.status_in_canada || "",
        tiny_bundles_program:
            String(data.tiny_bundles_program || "").toLowerCase() === "yes" ||
            data.tiny_bundles_program === true,
        province: data.province || "British Columbia",
        language: data.language || "English",
        household_size: householdMembers.length + 1,
        householdMembers,
    }
}

async function getAppointment(email) {
    const supabase = getSupabaseServiceClient()
    const responseId = await getApplicantResponseId(supabase, email)
    if (!responseId) return null

    const latestAppointment = await getLatestActiveAppointment(supabase, responseId)
    return buildAppointmentPayload(latestAppointment)
}

async function holdAppointment(email, payload) {
    const date = toDbDateOnly(payload?.date)
    const startTime = normalizeTimeForDb(payload?.startTime)
    const duration = intervalFromMinutes(payload?.duration)

    if (!date || !startTime) {
        throw makeHttpError(400, "Appointment date and time are required.")
    }

    const supabase = getSupabaseServiceClient()
    const responseId = await getApplicantResponseId(supabase, email)

    if (!responseId) {
        throw makeHttpError(400, "Please complete registration before booking.")
    }

    // Check if slot is already booked or held by another user
    const { data: conflicting, error: conflictError } = await supabase
        .from(APPOINTMENT_TABLE)
        .select(APPOINTMENT_ID_COLUMN)
        .eq(APPOINTMENT_DATE_COLUMN, date)
        .eq(APPOINTMENT_TIME_COLUMN, startTime)
        .in(APPOINTMENT_STATUS_COLUMN, ["booked", "held", "checked in", "no show"])
        .neq(APPOINTMENT_RESPONSE_ID_COLUMN, responseId)

    if (conflictError) {
        throw makeHttpError(500, "Unable to check slot availability.")
    }

    if (conflicting && conflicting.length > 0) {
        throw makeHttpError(409, "This slot is no longer available.")
    }

    // Remove any existing hold for this user
    await supabase
        .from(APPOINTMENT_TABLE)
        .delete()
        .eq(APPOINTMENT_RESPONSE_ID_COLUMN, responseId)
        .eq(APPOINTMENT_STATUS_COLUMN, "held")

    const { data: insertedRows, error: insertError } = await supabase
        .from(APPOINTMENT_TABLE)
        .insert([{
            [APPOINTMENT_RESPONSE_ID_COLUMN]: responseId,
            [APPOINTMENT_DATE_COLUMN]: date,
            [APPOINTMENT_TIME_COLUMN]: startTime,
            [APPOINTMENT_DURATION_COLUMN]: duration,
            [APPOINTMENT_STATUS_COLUMN]: "held",
        }])
        .select("*")

    if (insertError) {
        throw makeHttpError(500, "Unable to hold appointment slot.")
    }

    return { holdId: insertedRows?.[0]?.[APPOINTMENT_ID_COLUMN] || null }
}

async function releaseHold(email) {
    const supabase = getSupabaseServiceClient()
    const responseId = await getApplicantResponseId(supabase, email)

    if (!responseId) {
        return { released: false }
    }

    await supabase
        .from(APPOINTMENT_TABLE)
        .delete()
        .eq(APPOINTMENT_RESPONSE_ID_COLUMN, responseId)
        .eq(APPOINTMENT_STATUS_COLUMN, "held")

    return { released: true }
}

async function saveAppointment(email, payload) {
    const date = toDbDateOnly(payload?.date)
    const startTime = normalizeTimeForDb(payload?.startTime)
    const duration = intervalFromMinutes(payload?.duration)

    if (!date || !startTime) {
        throw makeHttpError(400, "Appointment date and time are required.")
    }

    const supabase = getSupabaseServiceClient()
    const responseId = await getApplicantResponseId(supabase, email)

    if (!responseId) {
        throw makeHttpError(400, "Please complete registration before booking.")
    }

    // Release any hold for this user before creating the real booking
    await supabase
        .from(APPOINTMENT_TABLE)
        .delete()
        .eq(APPOINTMENT_RESPONSE_ID_COLUMN, responseId)
        .eq(APPOINTMENT_STATUS_COLUMN, "held")

    const existingAppointment = await getLatestActiveAppointment(supabase, responseId)

    const dbPayload = {
        [APPOINTMENT_RESPONSE_ID_COLUMN]: responseId,
        [APPOINTMENT_DATE_COLUMN]: date,
        [APPOINTMENT_TIME_COLUMN]: startTime,
        [APPOINTMENT_DURATION_COLUMN]: duration,
        [APPOINTMENT_STATUS_COLUMN]: "booked",
    }

    let savedRow

    if (existingAppointment?.[APPOINTMENT_ID_COLUMN]) {
        const { data: updatedRows, error: updateError } = await supabase
            .from(APPOINTMENT_TABLE)
            .update(dbPayload)
            .eq(APPOINTMENT_ID_COLUMN, existingAppointment[APPOINTMENT_ID_COLUMN])
            .select("*")

        if (updateError) {
            throw makeHttpError(500, "Unable to save appointment.")
        }

        savedRow = updatedRows?.[0] || null
    } else {
        const { data: insertedRows, error: insertError } = await supabase
            .from(APPOINTMENT_TABLE)
            .insert([dbPayload])
            .select("*")

        if (insertError) {
            throw makeHttpError(500, "Unable to save appointment.")
        }

        savedRow = insertedRows?.[0] || null
    }

    // send email — fire-and-forget so email failures don't block the booking response
    getApplicantName(supabase, email)
        .then((names) => sendConfirmationEmail(names.first_name, names.last_name, email, date, startTime, duration))
        .catch((err) => console.error("Confirmation email failed:", err));

    return buildAppointmentPayload(savedRow)
}

async function removeAppointment(email) {
    const supabase = getSupabaseServiceClient()
    const responseId = await getApplicantResponseId(supabase, email)

    if (!responseId) {
        return { removed: false }
    }

    const existingAppointment = await getLatestActiveAppointment(supabase, responseId)

    if (!existingAppointment?.[APPOINTMENT_ID_COLUMN]) {
        return { removed: false }
    }

    const { error: deleteError } = await supabase
        .from(APPOINTMENT_TABLE)
        .delete()
        .eq(APPOINTMENT_ID_COLUMN, existingAppointment[APPOINTMENT_ID_COLUMN])

    if (deleteError) {
        throw makeHttpError(500, "Unable to cancel appointment.")
    }

    // send email — fire-and-forget so email failures don't block the cancel response
    getApplicantName(supabase, email)
        .then((names) => sendCancellationEmail(names.first_name, names.last_name, email, existingAppointment.appointment_date, existingAppointment.appointment_time))
        .catch((err) => console.error("Cancellation email failed:", err));

    return { removed: true }
}

async function getRegistrationStatus(email) {
    const supabase = getSupabaseServiceClient()
    const data = await getApplicantRegistrationByEmail(supabase, email)
    return { completed: isRegistrationComplete(data) }
}

async function saveRegistration(email, values, householdMembers) {
    const payload = {
        ...values,
        [APPLICANT_EMAIL_COLUMN]: email,
    }

    const supabase = getSupabaseServiceClient()
    const existingRegistration = await getApplicantRegistrationByEmail(supabase, email)
    let error

    if (existingRegistration?.response_id) {
        const result = await supabase
            .from(APPLICANT_TABLE)
            .update(payload)
            .eq("response_id", existingRegistration.response_id)
        error = result.error
    } else {
        const result = await supabase
            .from(APPLICANT_TABLE)
            .insert([payload])
        error = result.error
    }

    if (error) {
        throw makeHttpError(500, error.message || "Unable to save registration.")
    }

    const responseId = await getApplicantResponseId(supabase, email)
    if (!responseId) {
        throw makeHttpError(500, "Unable to save household member data.")
    }

    await syncHouseholdMembers(supabase, responseId, householdMembers)
}

async function saveHouseholdMembers(email, householdMembers) {
    const supabase = getSupabaseServiceClient()
    const responseId = await getApplicantResponseId(supabase, email)

    if (!responseId) {
        throw makeHttpError(400, "Please complete registration before saving household members.")
    }

    await syncHouseholdMembers(supabase, responseId, householdMembers)
}

export {
    getAuthenticatedEmail,
    getRegistration,
    getAppointment,
    holdAppointment,
    releaseHold,
    saveAppointment,
    removeAppointment,
    getRegistrationStatus,
    saveRegistration,
    saveHouseholdMembers,
}
