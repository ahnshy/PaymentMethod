import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {LocaleRedirect} from "./LocaleRedirect";

export default function RootPage() {
  return (
    <>
      <LocaleRedirect />
      <Box sx={{minHeight: "100vh", display: "grid", placeItems: "center"}}>
        <CircularProgress />
      </Box>
    </>
  );
}
