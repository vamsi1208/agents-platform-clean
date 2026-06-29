import AgentPage from '../components/AgentPage';

export default function PlaywrightAgent() {
  return (
    <AgentPage
      title="Playwright Agent"
      icon="🎭"
      placeholder="Describe a URL or user journey to automate...&#10;&#10;Example: Go to https://example.com, click on Login, fill in email and password, click submit, verify dashboard is visible."
      endpoint="/agents/playwright"
      outputLabel="Generated Playwright Script"
    />
  );
}
