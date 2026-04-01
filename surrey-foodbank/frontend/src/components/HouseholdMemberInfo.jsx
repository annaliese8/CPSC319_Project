/**
 * Reusable household member list with add/remove and inline editing.
 * Used in StepHouseholdMembers (registration flow) and the profile/staff applicant info pages.
 */
import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EscalatorWarningIcon from "@mui/icons-material/EscalatorWarning";
import PersonIcon from "@mui/icons-material/Person";

// ── Constants ────────────────────────────────────────────────────────────────

const emptyMember = () => ({
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  ageGroup: "", // "infant" | "child" | "adult"
  // dob: "",
});

export const AGE_GROUPS = [
  {
    key: "infant",
    label: "Infant",
    range: "0 – 12 months",
    Icon: ChildCareIcon,
    color: "#b5174a", // darker pink for contrast on light bg
    bg: "#fff0f3",
    selectedBg: "#ffd6df",
    selectedBorder: "#b5174a",
  },
  {
    key: "child",
    label: "Child",
    range: "1 – 17 years",
    Icon: EscalatorWarningIcon,
    color: "#7a4f00", // dark brown instead of orange for contrast on yellow bg
    bg: "#fff8e1",
    selectedBg: "#ffe9a0",
    selectedBorder: "#f5a623", // keep border orange for visual style
  },
  {
    key: "adult",
    label: "Adult",
    range: "18+ years",
    Icon: PersonIcon,
    color: "#0d47a1", // darker blue for contrast on light blue bg
    bg: "#f0f7ff",
    selectedBg: "#c8dff8",
    selectedBorder: "#1a6abf",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

// Deterministic avatar colour from member id
const AVATAR_PALETTE = [
  "#3E8321",
  "#D9365C",
  "#0A7E80",
  "#A66908",
  "#9b59b6",
  "#DA16A6",
  "#B35E14",
  "#2752B4",
];
const getAvatarColor = (id) =>
  AVATAR_PALETTE[
  id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
  AVATAR_PALETTE.length
  ];

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

// ── AgeGroupPicker ────────────────────────────────────────────────────────────

/**
 * AgeGroupPicker
 * Three large clickable tiles for Infant / Child / Adult.
 * Below them: an optional "Enter exact date of birth" toggle.
 */
function AgeGroupPicker({
  ageGroup,
  /*dob,*/ onAgeGroup,
  /*onDob,*/ ageGroupError /*dobError*/,
}) {
  // const [showDob, setShowDob] = useState(!!dob);

  return (
    <Box>
      {/* Tiles */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
        {AGE_GROUPS.map(
          ({
            key,
            label,
            range,
            Icon,
            color,
            bg,
            selectedBg,
            selectedBorder,
          }) => {
            const selected = ageGroup === key;
            return (
              <Box
                key={key}
                onClick={() => onAgeGroup(key)}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onAgeGroup(key);
                }}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  py: 1.8,
                  px: 1,
                  borderRadius: "12px",
                  border: selected
                    ? `2px solid ${selectedBorder}`
                    : "2px solid #e8e8e8",
                  background: selected ? selectedBg : bg,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  userSelect: "none",
                  "&:hover": {
                    border: `2px solid ${selectedBorder}`,
                    background: selectedBg,
                    transform: "translateY(-1px)",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 32,
                    color: selected ? color : "#777 ",
                    transition: "color 0.15s",
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: selected ? color : "#333 ",
                    lineHeight: 1.2,

                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: selected ? color : "#444 ",
                    fontWeight: 500,
                    textAlign: "center"
                  }}
                >
                  {range}
                </Typography>
              </Box>
            );
          },
        )}
      </Stack>

      {ageGroupError && (
        <Typography
          sx={{ fontSize: 11, color: "var(--red, #d32f2f)", mb: 1, ml: 0.5 }}
        >
          {ageGroupError}
        </Typography>
      )}

      {/* <Box
        component="button"
        type="button"
        onClick={() => setShowDob((v) => !v)}
        sx={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: "var(--teal, #009688)",
          fontSize: 12,
          fontWeight: 600,
          p: 0,
          mb: showDob ? 1.5 : 0,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {showDob ? "▾" : "▸"} {showDob ? "Hide exact date of birth" : "Enter exact date of birth (optional)"}
      </Box>

      <Collapse in={showDob}>
        <TextField
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(e) => onDob(e.target.value)}
          error={!!dobError}
          helperText={dobError}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ background: "#fff", borderRadius: 1, width: "100%", maxWidth: 240 }}
        />
      </Collapse> */}
    </Box>
  );
}

// ── MemberCard ────────────────────────────────────────────────────────────────

/**
 * MemberCard
 * Collapsed row: avatar + name + age group badge.
 * Expand inline to edit name + age group + optional DOB.
 */
function MemberCard({ member, idx, onField, onRemove, errors }) {
  const [expanded, setExpanded] = useState(
    !member.firstName && !member.lastName,
  );
  const hasErrors = errors && Object.keys(errors).length > 0;
  const avatarColor = getAvatarColor(member.id);
  const displayName =
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    "New Member";
  const ageGroupConfig = AGE_GROUPS.find((g) => g.key === member.ageGroup);

  // const dobFormatted = member.dob
  //   ? new Date(member.dob + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  //   : null;

  return (
    <Box
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        border: hasErrors
          ? "1.5px solid var(--red, #d32f2f)"
          : "1.5px solid #e8e8e8",
        mb: 1.5,
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 3px 10px rgba(0,0,0,0.1)" },
      }}
    >
      {/* Collapsed header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          px: 2,
          py: 1.5,
          cursor: "pointer",
          userSelect: "none",
          background: expanded ? "#fafafa" : "#fff",
          borderBottom: expanded ? "1px solid #f0f0f0" : "none",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Avatar */}
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            letterSpacing: 0.5,
          }}
        >
          <Typography>
            {getInitials(member.firstName, member.lastName)}
          </Typography>
        </Box>

        {/* Name + badges */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              color: "#1a1a1a",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayName}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.3 }}
          >
            {ageGroupConfig && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.4,
                  px: 1,
                  py: "1px",
                  borderRadius: "20px",
                  fontSize: 11,
                  fontWeight: 600,
                  background: ageGroupConfig.bg,
                  color: ageGroupConfig.color,
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ageGroupConfig.Icon
                    sx={{ fontSize: 16 }}
                    aria-hidden={true}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {ageGroupConfig.label}
                  </Typography>
                </Stack>
              </Box>
            )}
            {/* {dobFormatted && (
              <Typography sx={{ fontSize: 11, color: "#555 " }}>{dobFormatted}</Typography>
            )} */}
            {hasErrors && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: "var(--red, #d32f2f)",
                  fontWeight: 600,
                }}
              >
                · Incomplete
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Edit / Delete */}
        <Stack
          direction="row"
          spacing={0.5}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Edit member"}
            sx={{
              color: "#777  ",
              "&:hover": { color: "var(--teal, #009688)" },
            }}
          >
            {expanded ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <EditIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={onRemove}
            aria-label={`Remove ${displayName}`}
            sx={{ color: "#777 ", "&:hover": { color: "var(--red, #d32f2f)" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Expanded edit form */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pt: 2, pb: 2.5, background: "#fafafa" }}>
          {/* Name row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <TextField
              label="First Name"
              value={member.firstName}
              onChange={(e) => onField("firstName", e.target.value)}
              error={!!errors?.firstName}
              helperText={errors?.firstName}
              fullWidth
              required
              size="small"
              sx={{ background: "#fff", borderRadius: 1 }}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <TextField
              label="Last Name"
              value={member.lastName}
              onChange={(e) => onField("lastName", e.target.value)}
              error={!!errors?.lastName}
              helperText={errors?.lastName}
              fullWidth
              required
              size="small"
              sx={{ background: "#fff", borderRadius: 1 }}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          </Stack>

          {/* Age group tiles + optional DOB */}
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: "#333 ", mb: 1 }}
          >
            Age Group <span style={{ color: "var(--red, #d32f2f)" }}>*</span>
          </Typography>
          <AgeGroupPicker
            ageGroup={member.ageGroup}
            onAgeGroup={(val) => onField("ageGroup", val)}
            ageGroupError={errors?.ageGroup}
          // dobError={errors?.dob}
          // dob={member.dob}
          // onDob={(val) => onField("dob", val)}
          />

          {/* <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button size="small" variant="contained" onClick={() => setExpanded(false)}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: "8px", px: 2.5 }}>
              Done
            </Button>
          </Box> */}
        </Box>
      </Collapse>
    </Box>
  );
}

// ── HouseholdMemberInfo ───────────────────────────────────────────────────────

export default function HouseholdMemberInfo({
  householdMembers = [],
  onChange,
  errors = {},
}) {
  const handleAdd = () => onChange([...householdMembers, emptyMember()]);
  const handleRemove = (id) =>
    onChange(householdMembers.filter((m) => m.id !== id));
  const handleField = (id, field, value) =>
    onChange(
      householdMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );

  return (
    <Box>
      <Typography
        variant="body1"
        sx={{ mb: 3, color: "text.secondary", textAlign: "center" }}
      >
        Add the other people you live with. This helps us prepare enough food
        and plan your appointment time.
      </Typography>
      {householdMembers.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            px: 3,
            mb: 2,
            borderRadius: "12px",
            border: "2px dashed",
            borderColor: "grey.400",
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
            No additional household members added yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mb: 1 }}>
          {householdMembers.map((member, idx) => (
            <MemberCard
              key={member.id}
              member={member}
              idx={idx}
              onField={(field, value) => handleField(member.id, field, value)}
              onRemove={() => handleRemove(member.id)}
              errors={errors?.[member.id]}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdd}
          variant="text"
          color="primary"
          disableElevation
          sx={{
            fontWeight: 700,
            textTransform: "none",
            fontSize: 16,
            borderRadius: "10px",
            px: 3,
            py: 1.1,
          }}
        >
          Add Member
        </Button>
      </Box>
    </Box>
  );
}
