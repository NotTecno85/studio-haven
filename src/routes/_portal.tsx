import { createFileRoute } from "@tanstack/react-router";
import { PortalLayout } from "@/components/portal-chrome";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});