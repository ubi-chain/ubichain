import { createFileRoute } from "@tanstack/react-router";
import { CuiHex } from "@/components/cui-hex";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "IETFUBI" }],
  }),
  component: Home,
});

function Home() {
  return <CuiHex />;
}
