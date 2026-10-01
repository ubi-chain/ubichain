import { createFileRoute } from "@tanstack/react-router";
import { QConsole } from "@/components/q-console";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "IETFUBI" }],
  }),
  component: Home,
});

function Home() {
  return <QConsole />;
}
