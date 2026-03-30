import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Link,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ELIGIBLE_STATUS_OPTIONS } from "./RegistrationFields";

/** Diaglog shown when applicants try to submit a registration form with an ineligible
 *  status in Canada (eg. visitor)
 */
function IneligibleStatusDialog({ open, onClose, status }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "primary.main",
                    fontWeight: 800,
                }}
            >
                You're Not Eligible at This Time
                <IconButton
                    aria-label="Close ineligible status in Canada dialog"
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Your selected status of <strong>{status}</strong> does not meet the
                        eligibility requirements for registration at the Surrey Food Bank.
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        We can register clients who have the following statuses:
                    </Typography>
                    <Box component="ul" sx={{ pl: 4 }}>
                        {ELIGIBLE_STATUS_OPTIONS.map((s) => (
                            <Typography key={s} component="li" variant="body2" color="text.secondary">{s}</Typography>
                        ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        If your status changes, you are welcome to register with us at that time.
                    </Typography>
                    <Box sx={{ border: "4px solid", borderColor: "secondary.main", borderRadius: 2, p: 2, mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Call or text{" "}
                            <Link
                                href="tel:211"
                                aria-label="Phone number for community resource referral line"
                            >2-1-1</Link >
                            {" "} for free and confidential information and referrals
                            to community resources. Available 24/7 with support for 240+ languages.
                        </Typography></ Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    sx={{ fontWeight: 800, color: "common.white" }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default IneligibleStatusDialog;
