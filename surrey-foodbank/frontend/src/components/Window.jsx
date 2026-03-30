import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// This component is a centered container with a blue bar at the top containing a {title},
// and a white body underneath where you can put other {children} components
function Window({ title, width = "40%", children }) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          px: 2
        }}
      >
        <Paper
          sx={{
            borderRadius: 2,
            width: "100%",
            maxWidth: 700,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "primary.main",
              py: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: { xs: 25, sm: 30 },
                fontWeight: "bold",
              }}
            >
              {title}
            </Typography>
          </Box>
          <Stack
            sx={{
              p: 2,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {children}
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

export default Window;
