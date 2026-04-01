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

/** Diaglog shown when an applicant tries to submit a registration form after indicating
 *  in the form that they're under the age of 18 years old
 */
function IneligibleAgeDialog({ open, onClose }) {
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
                You're Not Eligible to Register Online
                <IconButton
                    aria-label="Close ineligible age dialog"
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        You have indicated that you are <strong>under 18 years old</strong>. Applicants must be
                        over the age of 18 to book an appointment online.
                    </Typography>
                    <Box sx={{ border: "4px solid", borderColor: "secondary.main", borderRadius: 2, p: 2, mt: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                            Please call {" "}
                            <Link
                                href="tel:16045815443"
                                aria-label="Phone number of Surrey Food Bank"
                            >
                                (604) 581-5443
                            </Link>
                            {" "} so we can help you complete the registration process.
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

export default IneligibleAgeDialog;
