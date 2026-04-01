import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Divider from "@mui/material/Divider";
import EmailField from "../../components/EmailField";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import PasswordField from "../../components/PasswordField";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LanguageIcon from "@mui/icons-material/Language";
import IconButton from "@mui/material/IconButton";
import logo from "../../styles/full-logo.png";

import useTextField from "../../hooks/useTextField";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "../../lib/supabaseClient";

// ─── Translations ────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "fa", label: "دری", dir: "rtl" },
  { code: "ps", label: "پښتو", dir: "rtl" },
];

const T = {
  en: {
    pageTitle: "Create Account | Surrey Food Bank",
    welcomeTitle: "Welcome to the Surrey Food Bank Booking System",
    prospective: "If you're a prospective client, you're in the right place.",
    followSteps: "Follow the steps below to complete your registration.",
    step1: "Create an account using the form on this page.",
    step1sub: "Already have an account? Log in",
    step1subHere: "here.",
    step2: "Fill out a short form with your personal information.",
    step3: "Pick an appointment date and time that works for you.",
    step3sub: "You can cancel or reschedule your appointment at any time.",
    step4: "Attend your scheduled appointment at our",
    step4link: "registration office.",
    step4sub: "Bring proof of address and original government-issued photo ID for each household member.",
    step5: "Visit us on your biweekly pick-up day to collect your food hamper!",
    createAccount: "Create an Account",
    setupAccount: "Set up your account to start booking your appointment.",
    emailFormat: "Email format:",
    hoverHelp: "Hover on each part for help",
    passwordMust: "Your password must:",
    pwLength: "Be at least 10 characters long",
    pwUpper: "Contain at least one capital letter (e.g., A, B, C, ...)",
    pwNumber: "Contain at least one number (e.g., 1, 2, 3, ...)",
    emailHint: "e.g. yourname@example.com",
    emailPlaceholder: "yourname@example.com",
    emailInvalid: "Please enter a valid email address in the format: yourname@example.com",
    emailExists: "An account with this email address already exists",
    pwMismatch: "Passwords do not match",
    alreadyHave: "Already have an account?",
    createBtn: "Create Account",
    emailParts: [
      { text: "yourname", label: "Your name or username", detail: 'This is how you identify yourself — like a nickname. It can include letters, numbers, dots, or underscores. Example: "john.doe" or "jane123"' },
      { text: "@", label: 'The "at" symbol', detail: 'This symbol (called "at") separates your name from the email service. Every email address has exactly one "@".' },
      { text: "example", label: "Email service name", detail: 'This is the company or service that provides your email. Common ones are "gmail", "yahoo", or "hotmail".' },
      { text: ".com", label: "Domain ending", detail: 'This ending shows what kind of service it is. Common endings are ".com", ".ca", ".org", or ".net".' },
    ],
  },
  es: {
    pageTitle: "Crear cuenta | Surrey Food Bank",
    welcomeTitle: "Bienvenido al sistema de reservas del Surrey Food Bank",
    prospective: "Si es un cliente potencial, está en el lugar correcto.",
    followSteps: "Siga los pasos a continuación para completar su registro.",
    step1: "Cree una cuenta usando el formulario en esta página.",
    step1sub: "¿Ya tiene una cuenta? Inicie sesión",
    step1subHere: "aquí.",
    step2: "Complete un breve formulario con su información personal.",
    step3: "Elija una fecha y hora de cita que le convenga.",
    step3sub: "Puede cancelar o reprogramar su cita en cualquier momento.",
    step4: "Asista a su cita programada en nuestra",
    step4link: "oficina de registro.",
    step4sub: "Traiga comprobante de domicilio e identificación oficial con foto emitida por el gobierno para cada miembro del hogar.",
    step5: "¡Visítenos en su día de recogida quincenal para recoger su canasta de alimentos!",
    createAccount: "Crear una cuenta",
    setupAccount: "Configure su cuenta para comenzar a reservar su cita.",
    emailFormat: "Formato de correo:",
    hoverHelp: "Pase el cursor sobre cada parte para obtener ayuda",
    passwordMust: "Su contraseña debe:",
    pwLength: "Tener al menos 10 caracteres",
    pwUpper: "Contener al menos una letra mayúscula (p. ej., A, B, C, ...)",
    pwNumber: "Contener al menos un número (p. ej., 1, 2, 3, ...)",
    emailHint: "p. ej. sunombre@ejemplo.com",
    emailPlaceholder: "sunombre@ejemplo.com",
    emailInvalid: "Ingrese una dirección de correo válida en el formato: sunombre@ejemplo.com",
    emailExists: "Ya existe una cuenta con esta dirección de correo electrónico",
    pwMismatch: "Las contraseñas no coinciden",
    alreadyHave: "¿Ya tiene una cuenta?",
    createBtn: "Crear cuenta",
    emailParts: [
      { text: "sunombre", label: "Su nombre o usuario", detail: 'Así se identifica, como un apodo. Puede incluir letras, números, puntos o guiones bajos. Ejemplo: "juan.perez" o "maria123"' },
      { text: "@", label: 'El símbolo "arroba"', detail: 'Este símbolo (llamado "arroba") separa su nombre del servicio de correo. Cada dirección de correo tiene exactamente un "@".' },
      { text: "ejemplo", label: "Nombre del servicio de correo", detail: 'Es la empresa que le provee el correo. Los más comunes son "gmail", "yahoo" u "hotmail".' },
      { text: ".com", label: "Extensión del dominio", detail: 'Esta extensión indica el tipo de servicio. Las más comunes son ".com", ".ca", ".org" o ".net".' },
    ],
  },
  ar: {
    pageTitle: "إنشاء حساب | بنك طعام سري",
    welcomeTitle: "مرحبًا بكم في نظام حجز مواعيد بنك طعام سري",
    prospective: "إذا كنت عميلًا محتملًا، فأنت في المكان الصحيح.",
    followSteps: "اتبع الخطوات أدناه لإتمام تسجيلك.",
    step1: "أنشئ حسابًا باستخدام النموذج في هذه الصفحة.",
    step1sub: "هل لديك حساب بالفعل؟ سجّل الدخول",
    step1subHere: "من هنا.",
    step2: "املأ نموذجًا قصيرًا بمعلوماتك الشخصية.",
    step3: "اختر تاريخًا ووقتًا للموعد يناسبك.",
    step3sub: "يمكنك إلغاء موعدك أو إعادة جدولته في أي وقت.",
    step4: "احضر إلى موعدك المحدد في",
    step4link: "مكتب التسجيل.",
    step4sub: "أحضر معك إثبات العنوان وبطاقة هوية رسمية صادرة عن الحكومة تحمل صورتك لكل فرد من أفراد الأسرة.",
    step5: "زورونا في يوم استلام طردتك كل أسبوعين لاستلام سلة الطعام الخاصة بك!",
    createAccount: "إنشاء حساب",
    setupAccount: "أنشئ حسابك لبدء حجز موعدك.",
    emailFormat: "تنسيق البريد الإلكتروني:",
    hoverHelp: "مرّر المؤشر على كل جزء للحصول على مساعدة",
    passwordMust: "يجب أن تكون كلمة المرور:",
    pwLength: "مكوّنة من 10 أحرف على الأقل",
    pwUpper: "تحتوي على حرف كبير واحد على الأقل (مثلًا A، B، C ...)",
    pwNumber: "تحتوي على رقم واحد على الأقل (مثلًا 1، 2، 3 ...)",
    emailHint: "مثال: اسمك@example.com",
    emailPlaceholder: "اسمك@example.com",
    emailInvalid: "يرجى إدخال عنوان بريد إلكتروني صالح بالتنسيق: اسمك@example.com",
    emailExists: "يوجد حساب بهذا البريد الإلكتروني بالفعل",
    pwMismatch: "كلمتا المرور غير متطابقتين",
    alreadyHave: "هل لديك حساب بالفعل؟",
    createBtn: "إنشاء حساب",
    emailParts: [
      { text: "اسمك", label: "اسمك أو اسم المستخدم", detail: 'هكذا تُعرّف نفسك، كلقب. يمكن أن يحتوي على حروف وأرقام ونقاط أو شرطات سفلية. مثال: "ahmad.ali" أو "fatima123"' },
      { text: "@", label: 'رمز "@"', detail: 'هذا الرمز (يُسمّى "at" أو "عند") يفصل اسمك عن خدمة البريد. كل عنوان بريد إلكتروني يحتوي على "@" واحدة فقط.' },
      { text: "example", label: "اسم خدمة البريد", detail: 'هذه هي الشركة التي تقدّم لك البريد الإلكتروني، مثل "gmail" أو "yahoo" أو "hotmail".' },
      { text: ".com", label: "امتداد النطاق", detail: 'يُشير إلى نوع الخدمة. الامتدادات الشائعة هي ".com" أو ".ca" أو ".org" أو ".net".' },
    ],
  },
  fa: {
    pageTitle: "ایجاد حساب | بانک غذای سری",
    welcomeTitle: "به سیستم رزرو بانک غذای سری خوش آمدید",
    prospective: "اگر مشتری بالقوه هستید، در جای درستی هستید.",
    followSteps: "مراحل زیر را دنبال کنید تا ثبت‌نام خود را کامل کنید.",
    step1: "یک حساب کاربری با استفاده از فرم این صفحه ایجاد کنید.",
    step1sub: "آیا قبلاً حساب دارید؟ وارد شوید",
    step1subHere: "اینجا.",
    step2: "یک فرم کوتاه با اطلاعات شخصی خود پر کنید.",
    step3: "یک تاریخ و زمان مناسب برای قرار ملاقات انتخاب کنید.",
    step3sub: "می‌توانید قرار ملاقات خود را هر زمان لغو یا تغییر دهید.",
    step4: "در قرار ملاقات تعیین‌شده در",
    step4link: "دفتر ثبت‌نام حضور یابید.",
    step4sub: "مدرک آدرس و کارت شناسایی رسمی دولتی با عکس برای هر عضو خانواده همراه داشته باشید.",
    step5: "در روز دریافت دو هفته‌ای خود برای گرفتن سبد غذایی‌تان به ما مراجعه کنید!",
    createAccount: "ایجاد حساب",
    setupAccount: "حساب خود را برای شروع رزرو قرار ملاقات راه‌اندازی کنید.",
    emailFormat: "فرمت ایمیل:",
    hoverHelp: "برای راهنمایی نشانگر را روی هر بخش نگه دارید",
    passwordMust: "رمز عبور شما باید:",
    pwLength: "حداقل ۱۰ کاراکتر داشته باشد",
    pwUpper: "حداقل یک حرف بزرگ داشته باشد (مثلاً A، B، C ...)",
    pwNumber: "حداقل یک عدد داشته باشد (مثلاً ۱، ۲، ۳ ...)",
    emailHint: "مثال: نام‌شما@example.com",
    emailPlaceholder: "نام‌شما@example.com",
    emailInvalid: "لطفاً یک آدرس ایمیل معتبر وارد کنید: نام‌شما@example.com",
    emailExists: "حسابی با این آدرس ایمیل از قبل وجود دارد",
    pwMismatch: "رمزهای عبور مطابقت ندارند",
    alreadyHave: "آیا قبلاً حساب دارید؟",
    createBtn: "ایجاد حساب",
    emailParts: [
      { text: "نام‌شما", label: "نام یا نام کاربری شما", detail: 'این نحوه شناسایی شما است، مانند یک لقب. می‌تواند شامل حروف، اعداد، نقطه یا زیرخط باشد. مثال: "ahmad.ali" یا "fatima123"' },
      { text: "@", label: 'نماد "@"', detail: 'این نماد (به نام "at") نام شما را از سرویس ایمیل جدا می‌کند. هر آدرس ایمیل دقیقاً یک "@" دارد.' },
      { text: "example", label: "نام سرویس ایمیل", detail: 'این شرکت یا سرویسی است که ایمیل شما را ارائه می‌دهد. معمول‌ترین‌ها "gmail"، "yahoo" یا "hotmail" هستند.' },
      { text: ".com", label: "پسوند دامنه", detail: 'این پسوند نوع سرویس را نشان می‌دهد. پسوندهای رایج ".com"، ".ca"، ".org" یا ".net" هستند.' },
    ],
  },
  ps: {
    pageTitle: "حساب جوړول | د سري د خوراک بانک",
    welcomeTitle: "د سري د خوراک بانک د بکنګ سیسټم ته ښه راغلاست",
    prospective: "که تاسو یو احتمالي پیرودونکي یاست، تاسو سم ځای کې یاست.",
    followSteps: "د خپل ثبت نام بشپړولو لپاره لاندې ګامونه تعقیب کړئ.",
    step1: "پدې پاڼه کې د فورمه له لارې یو حساب جوړ کړئ.",
    step1sub: "ایا مخکې حساب لرئ؟ ننوتل",
    step1subHere: "دلته.",
    step2: "د خپلو شخصي معلوماتو سره یو لنډ فورمه ډک کړئ.",
    step3: "هغه نیټه او وخت غوره کړئ چې ستاسو لپاره مناسب وي.",
    step3sub: "تاسو کولای شئ د خپل ملاقات لغوه یا بیا مهاله کړئ.",
    step4: "زموږ د",
    step4link: "د ثبت نام دفتر کې خپل مهاله ملاقات ته حاضر شئ.",
    step4sub: "د کور هر غړي لپاره د پتې ثبوت او د حکومت لخوا صادر شوی اصلي عکس لرونکي پیژندنه کارت راوړئ.",
    step5: "د خپل خوراکي سبد اخیستلو لپاره هر دوه اونۍ کې زموږ سره لیدنه وکړئ!",
    createAccount: "حساب جوړول",
    setupAccount: "د خپل ملاقات بکنګ پیل کولو لپاره خپل حساب تنظیم کړئ.",
    emailFormat: "د بریښنا لیک بڼه:",
    hoverHelp: "د مرستې لپاره پر هر برخه باندې نشانګر کیږدئ",
    passwordMust: "ستاسو پاسورډ باید:",
    pwLength: "لږ تر لږه ۱۰ توري ولري",
    pwUpper: "لږ تر لږه یو لوی توری ولري (لکه A، B، C ...)",
    pwNumber: "لږ تر لږه یو شمیره ولري (لکه ۱، ۲، ۳ ...)",
    emailHint: "مثال: ستاسونوم@example.com",
    emailPlaceholder: "ستاسونوم@example.com",
    emailInvalid: "مهرباني وکړئ یو معتبر بریښنا لیک ادرس دننه کړئ: ستاسونوم@example.com",
    emailExists: "دا بریښنا لیک ادرس سره حساب دمخه شتون لري",
    pwMismatch: "پاسورډونه سره یو نه دي",
    alreadyHave: "ایا مخکې حساب لرئ؟",
    createBtn: "حساب جوړول",
    emailParts: [
      { text: "ستاسونوم", label: "ستاسو نوم یا کارونکي نوم", detail: 'دا ستاسو د پیژندلو لاره ده، لکه لقب. کولای شي توري، شمیرې، نقطې یا انډر سکور ولري. مثال: "ahmad.ali" یا "fatima123"' },
      { text: "@", label: '"@" نښه', detail: 'دا نښه ستاسو نوم د بریښنا لیک خدمت څخه جلا کوي. هر بریښنا لیک ادرس کې دقیقاً یو "@" وي.' },
      { text: "example", label: "د بریښنا لیک خدمت نوم", detail: 'دا هغه شرکت یا خدمت دی چې ستاسو بریښنا لیک چمتو کوي. عام یې "gmail"، "yahoo" یا "hotmail" دي.' },
      { text: ".com", label: "د ډومین پای", detail: 'دا پای د خدمت ډول ښیي. عام پایونه ".com"، ".ca"، ".org" یا ".net" دي.' },
    ],
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmailFormatGuide({ t }) {
  const colors = [
    { color: "#1565c0", bg: "#e3f2fd" },
    { color: "#6a1b9a", bg: "#f3e5f5" },
    { color: "#2e7d32", bg: "#e8f5e9" },
    { color: "#e65100", bg: "#fff3e0" },
  ];
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 1.25,
        mb: 1.5,
        backgroundColor: "#f5f7fa",
      }}
    >
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap", fontSize: "0.95rem" }}>
          {t.emailFormat}
        </Typography>
        <Stack direction="row" alignItems="center" flexWrap="wrap">
          {t.emailParts.map((part, i) => (
            <Tooltip
              key={i}
              title={
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{part.label}</Typography>
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5, fontSize: "0.9rem" }}>{part.detail}</Typography>
                </Box>
              }
              arrow
              placement="top"
              enterTouchDelay={0}
              slotProps={{
                tooltip: { sx: { backgroundColor: "primary.main" } },
                arrow: { sx: { color: "primary.main" } },
              }}
            >
              <Box
                component="span"
                sx={{
                  color: colors[i].color,
                  backgroundColor: colors[i].bg,
                  borderRadius: 0.75,
                  px: 0.5,
                  py: 0.1,
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "help",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                {part.text}
              </Box>
            </Tooltip>
          ))}
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: "#6F6F71", whiteSpace: "nowrap" }}
        >
          Hover over each part for help
        </Typography>
      </Stack>
    </Paper>
  );
}

function PasswordRequirementsChecklist({ value, t }) {
  const PASSWORD_RULES = [
    { id: "length", label: t.pwLength, test: (v) => v.length >= 10 },
    { id: "uppercase", label: t.pwUpper, test: (v) => /[A-Z]/.test(v) },
    { id: "number", label: t.pwNumber, test: (v) => /[0-9]/.test(v) },
  ];
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 1.5,
        mb: 1,
        backgroundColor: "#f5f7fa",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600, fontSize: "1rem" }}
      >
        {t.passwordMust}
      </Typography>
      <Stack spacing={1}>
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <Stack key={rule.id} direction="row" spacing={1.5} alignItems="center">
              {passed ? (
                <CheckCircleIcon sx={{ color: "success.main", flexShrink: 0 }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: "text.disabled", flexShrink: 0 }} />
              )}
              <Typography
                variant="body1"
                sx={{
                  color: passed ? "success.main" : "text.primary",
                  textDecoration: passed ? "line-through" : "none",
                  transition: "color 0.2s, text-decoration 0.2s",
                }}
              >
                {rule.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function CreateAccount() {
  const [langCode, setLangCode] = useState("en");
  const [anchorEl, setAnchorEl] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = T[langCode];
  const dir = LANGUAGES.find((l) => l.code === langCode)?.dir || "ltr";

  const listItemIconStyle = { fontSize: "2rem", fontWeight: "bold", color: "warning.main" };
  const listItemTextStyle = { primary: { fontSize: "1.2rem" }, secondary: { fontSize: "1.05rem" } };

  const PASSWORD_RULES = [
    { id: "length", label: t.pwLength, test: (v) => v.length >= 10 },
    { id: "uppercase", label: t.pwUpper, test: (v) => /[A-Z]/.test(v) },
    { id: "number", label: t.pwNumber, test: (v) => /[0-9]/.test(v) },
  ];

  const emailField = useTextField("", (value) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.emailInvalid;
    return "";
  });

  const passwordField = useTextField("", (value) => {
    const failed = PASSWORD_RULES.filter((rule) => !rule.test(value));
    if (failed.length === 0) return "";
    return `${t.passwordMust} ${failed[0].label.toLowerCase()}`;
  });

  const confirmPasswordField = useTextField("", (value) =>
    value !== passwordField.value ? t.pwMismatch : "",
  );

  useEffect(() => {
    confirmPasswordField.validate();
  }, [passwordField.value]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const hasErrors =
      Boolean(emailField.validate()) ||
      Boolean(passwordField.validate()) ||
      Boolean(confirmPasswordField.validate());
    const hasEmptyField =
      !emailField.value || !passwordField.value || !confirmPasswordField.value;
    if (hasErrors || hasEmptyField) return;

    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: emailField.value,
      password: passwordField.value,
      options: {
        data: {
          role: "applicant",
        },
      },
    });

    if (error) {
      setSubmitError(error.message || "Unable to create account. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!users.some((user) => user.email === emailField.value)) {
      users.push({ email: emailField.value, password: passwordField.value });
      localStorage.setItem("users", JSON.stringify(users));
    }

    const { error: insertError } = await supabase
      .from("logininformation")
      .insert([
        {
          email_address: emailField.value,
          role: "applicant",
        },
      ]);

    if (insertError) {
      setSubmitError(insertError.message || "Account created, but role setup failed.");
      setIsSubmitting(false);
      return;
    }

    const applicantKey = `applicant_${emailField.value}`;
    if (!localStorage.getItem(applicantKey)) {
      localStorage.setItem(
        applicantKey,
        JSON.stringify({
          email: emailField.value,
          firstName: "",
          lastName: "",
          name: "",
          phone: "",
          streetAddress: "",
          city: "",
          province: "British Columbia",
          postalCode: "",
          address: "",
          statusInCanada: "",
          language: "English",
          applyingToTinyBundles: "no",
          householdMembers: [],
          day: "",
          startTime: "",
          duration: 0,
          dateLabel: "",
          timeLabel: "",
        }),
      );
    }

    localStorage.setItem("activeUser", JSON.stringify({ email: emailField.value }));

    let session = data?.session || null;
    if (!session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailField.value,
        password: passwordField.value,
      });

      if (signInError || !signInData?.session) {
        setSubmitError("Account created. Please verify your email if needed, then log in to continue.");
        setIsSubmitting(false);
        navigate("/applicant/login");
        return;
      }

      session = signInData.session;
    }

    if (!session?.access_token) {
      setSubmitError("Account created, but sign-in was not completed. Please log in to continue.");
      setIsSubmitting(false);
      navigate("/applicant/login");
      return;
    }

    setIsSubmitting(false);
    navigate("/applicant/register");
  };

  return (
    <Box dir={dir} sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f0f4f8" }}>
      <title>{t.pageTitle}</title>

      {/* Navbar */}
      <AppBar position="sticky" color="transparent" elevation={1} sx={{ backgroundColor: "#fff" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Link href="https://surreyfoodbank.org/">
            <Box component="img" src={logo} alt="Surrey Food Bank Logo" height={40} />
          </Link>

          {/* Language Selector */}
          <Box>
            <Tooltip title="Select Language / اختر اللغة / Seleccionar idioma">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Select language"
                sx={{ color: "primary.main" }}
              >
                <LanguageIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem
                  key={lang.code}
                  selected={lang.code === langCode}
                  onClick={() => { setLangCode(lang.code); setAnchorEl(null); }}
                  sx={{ fontWeight: lang.code === langCode ? 700 : 400, direction: lang.dir }}
                >
                  {lang.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page body */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Paper elevation={3} sx={{ width: "100%", maxWidth: 1360, borderRadius: 4, overflow: "hidden", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>

          {/* ── LEFT: Overview / Steps ── */}
          <Box sx={{ px: { xs: 4, md: 6 }, py: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", backgroundColor: "#e8eef5" }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ lineHeight: 1.2 }}>
              {t.welcomeTitle}
            </Typography>
            <Divider sx={{ borderColor: "warning.main", borderBottomWidth: 3, mb: 3, width: 280 }} />
            <Typography variant="h6" sx={{ mb: 0.5 }}>{t.prospective}</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>{t.followSteps}</Typography>
            <List disablePadding sx={{ width: "100%", maxWidth: 520 }}>
              <ListItem alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>1.</Typography></ListItemIcon>
                <ListItemText
                  primary={t.step1}
                  secondary={<>{t.step1sub} <Link href="/applicant/login" color="primary">{t.step1subHere}</Link></>}
                  slotProps={listItemTextStyle}
                />
              </ListItem>
              <ListItem alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>2.</Typography></ListItemIcon>
                <ListItemText primary={t.step2} slotProps={listItemTextStyle} />
              </ListItem>
              <ListItem alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>3.</Typography></ListItemIcon>
                <ListItemText primary={t.step3} secondary={t.step3sub} slotProps={listItemTextStyle} />
              </ListItem>
              <ListItem alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>4.</Typography></ListItemIcon>
                <ListItemText
                  primary={<>{t.step4} <Link href="https://maps.app.goo.gl/1H39wzvMBqmki2se6" color="primary" aria-label="Google Maps of Surrey Food Bank's registration office">{t.step4link}</Link></>}
                  secondary={t.step4sub}
                  slotProps={listItemTextStyle}
                />
              </ListItem>
              <ListItem alignItems="flex-start" disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Typography sx={listItemIconStyle}>5.</Typography></ListItemIcon>
                <ListItemText primary={t.step5} slotProps={listItemTextStyle} />
              </ListItem>
            </List>
          </Box>

          {/* ── RIGHT: Account Creation Form ── */}
          <Box sx={{ px: { xs: 4, md: 6 }, py: 7, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
            <Box sx={{ width: "100%", maxWidth: 480 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>{t.createAccount}</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>{t.setupAccount}</Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column" }} noValidate>
                <EmailFormatGuide t={t} />
                <EmailField
                  placeholder={t.emailPlaceholder}
                  value={emailField.value}
                  onChange={emailField.onChange}
                  error={emailField.isInvalid}
                  helperText={emailField.isInvalid ? emailField.errorMessage : t.emailHint}
                />
                <Box sx={{ mt: 2 }}>
                  <PasswordRequirementsChecklist value={passwordField.value} t={t} />
                </Box>
                <PasswordField
                  value={passwordField.value}
                  onChange={passwordField.onChange}
                  error={passwordField.isInvalid}
                  helperText={passwordField.errorMessage}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm Password"
                  value={confirmPasswordField.value}
                  onChange={confirmPasswordField.onChange}
                  error={confirmPasswordField.isInvalid}
                  helperText={confirmPasswordField.errorMessage}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center", justifyContent: "space-between", mt: 2 }}
                >
                  <Link href="/CPSC319_Project/#/applicant/login" underline="hover">
                    <Typography variant="body2">{t.alreadyHave}</Typography>
                  </Link>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ fontWeight: "bold" }}
                    disabled={isSubmitting}
                  >
                    {t.createBtn}
                  </Button>
                </Stack>
                {submitError ? (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {submitError}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>

        </Paper>
      </Box>
    </Box>
  );
}

export default CreateAccount;