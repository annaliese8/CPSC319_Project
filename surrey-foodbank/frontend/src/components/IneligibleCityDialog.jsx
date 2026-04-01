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

// Diaglog shown when applicants try to submit a registration form with an ineligible city
function IneligibleCityDialog({ open, onClose, city }) {
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
                    aria-label="Close ineligible city dialog"
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Your indicated city of <strong>{city}</strong> is not within the Surrey Food Bank's catchment area.
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        We currently serve clients who live in:
                    </Typography>
                    <Box component="ul" sx={{ pl: 4 }}>
                        <Typography component="li" variant="body2" color="text.secondary">Surrey</Typography>
                        <Typography component="li" variant="body2" color="text.secondary">North Delta</Typography>
                        <Typography component="li" variant="body2" color="text.secondary">Cloverdale (north of 40th Avenue)</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        If your city of residence changes to one of the areas we support, you are welcome to register with us at that time.
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

export default IneligibleCityDialog;
