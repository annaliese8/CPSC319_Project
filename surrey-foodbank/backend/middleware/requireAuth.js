const {
  getSupabaseAnonClient,
  getSupabaseServiceClient,
  LOGIN_TABLE,
  LOGIN_EMAIL_COLUMN,
  LOGIN_ROLE_COLUMN,
} = require("../lib/supabase");

function getBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token." });
    }

    const supabase = getSupabaseAnonClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.user = data.user;
    req.accessToken = token;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unable to verify token." });
  }
}

async function requireApplicant(req, res, next) {
  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res.status(403).json({ error: "Authenticated user is missing email." });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from(LOGIN_TABLE)
      .select(`${LOGIN_ROLE_COLUMN}`)
      .eq(LOGIN_EMAIL_COLUMN, email)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Unable to verify account role." });
    }

    const role = String(data?.[LOGIN_ROLE_COLUMN] || "").trim().toLowerCase();
    if (role !== "applicant") {
      return res.status(403).json({ error: "Applicant access required." });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: "Unable to verify account role." });
  }
}

module.exports = {
  requireAuth,
  requireApplicant,
  normalizeEmail,
};
