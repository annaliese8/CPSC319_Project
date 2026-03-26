const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const LOGIN_TABLE =
	(process.env.SUPABASE_LOGIN_TABLE || "logininformation").trim();
const LOGIN_EMAIL_COLUMN =
	(process.env.SUPABASE_LOGIN_EMAIL_COLUMN || "email_address").trim();
const LOGIN_ROLE_COLUMN =
	(process.env.SUPABASE_LOGIN_ROLE_COLUMN || "role").trim();

const APPLICANT_TABLE =
	(process.env.SUPABASE_APPLICANT_TABLE || "registrationformresponse").trim();
const APPLICANT_EMAIL_COLUMN =
	(process.env.SUPABASE_APPLICANT_EMAIL_COLUMN || "email_address").trim();

const APPOINTMENT_TABLE =
	(process.env.SUPABASE_APPOINTMENT_TABLE || "appointments").trim();
const APPOINTMENT_ID_COLUMN =
	(process.env.SUPABASE_APPOINTMENT_ID_COLUMN || "appointment_id").trim();
const APPOINTMENT_RESPONSE_ID_COLUMN =
	(process.env.SUPABASE_APPOINTMENT_RESPONSE_ID_COLUMN || "response_id").trim();
const APPOINTMENT_DATE_COLUMN =
	(process.env.SUPABASE_APPOINTMENT_DATE_COLUMN || "appointment_date").trim();
const APPOINTMENT_TIME_COLUMN =
	(process.env.SUPABASE_APPOINTMENT_TIME_COLUMN || "appointment_time").trim();
const APPOINTMENT_DURATION_COLUMN =
	(process.env.SUPABASE_APPOINTMENT_DURATION_COLUMN || "duration").trim();
const APPOINTMENT_STATUS_COLUMN =
	(process.env.SUPABASE_APPOINTMENT_STATUS_COLUMN || "appointment_status").trim();

function requireEnv(name, value) {
	if (!value) {
		throw new Error(`Missing required env var: ${name}`);
	}
}

let anonClient;
let serviceClient;

function getSupabaseAnonClient() {
	if (anonClient) return anonClient;

	requireEnv("SUPABASE_URL", SUPABASE_URL);
	requireEnv("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY);

	anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});

	return anonClient;
}

function getSupabaseServiceClient() {
	if (serviceClient) return serviceClient;

	requireEnv("SUPABASE_URL", SUPABASE_URL);
	requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);

	serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});

	return serviceClient;
}

module.exports = {
	getSupabaseAnonClient,
	getSupabaseServiceClient,
	LOGIN_TABLE,
	LOGIN_EMAIL_COLUMN,
	LOGIN_ROLE_COLUMN,
	APPLICANT_TABLE,
	APPLICANT_EMAIL_COLUMN,
	APPOINTMENT_TABLE,
	APPOINTMENT_ID_COLUMN,
	APPOINTMENT_RESPONSE_ID_COLUMN,
	APPOINTMENT_DATE_COLUMN,
	APPOINTMENT_TIME_COLUMN,
	APPOINTMENT_DURATION_COLUMN,
	APPOINTMENT_STATUS_COLUMN,
};
