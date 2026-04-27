import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {Suspense} from "react";
import {SuccessClient} from "./SuccessClient";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{minHeight: "100vh", display: "grid", placeItems: "center"}}>
          <CircularProgress />
        </Box>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
