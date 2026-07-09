import { createFileRoute } from "@tanstack/react-router";
import { AgentforceChat } from "@/components/AgentforceChat";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Agentforce Assistant — AI Chat Console" },
      {
        name: "description",
        content:
          "Vibrant Salesforce Agentforce AI chat interface with live agent status, grounded data sources, and enforced session guardrails.",
      },
      { property: "og:title", content: "Agentforce Assistant — AI Chat Console" },
      {
        property: "og:description",
        content:
          "Vibrant Salesforce Agentforce AI chat interface with live agent status and grounded data sources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return <AgentforceChat />;
}
