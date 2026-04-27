import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {getTranslations} from "next-intl/server";
import {Link} from "../../../../i18n/navigation";

type PageProps = {
  params: Promise<{locale: string}>;
  searchParams?: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
};

export default async function PaymentFailPage({params, searchParams}: PageProps) {
  const [{locale}, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const t = await getTranslations({locale, namespace: "fail"});
  const common = await getTranslations({locale, namespace: "common"});
  const query = resolvedSearchParams ?? {};

  return (
    <Box component="main" sx={{minHeight: "100vh", py: {xs: 4, md: 8}}}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{border: 1, borderColor: "divider"}}>
          <CardContent sx={{p: {xs: 3, md: 4}}}>
            <Stack spacing={3}>
              <Typography variant="h4" component="h1" sx={{fontWeight: 800}}>
                {t("title")}
              </Typography>
              <Alert severity="error">{t("alert")}</Alert>
              <Typography>{t("code", {value: query.code ?? "-"})}</Typography>
              <Typography>{t("message", {value: query.message ?? "-"})}</Typography>
              <Typography>{t("orderId", {value: query.orderId ?? "-"})}</Typography>
              <Button component={Link} href="/" variant="contained">
                {common("retryPayment")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
