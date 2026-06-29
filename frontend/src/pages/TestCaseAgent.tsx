import AgentPage from '../components/AgentPage';

export default function TestCaseAgent() {
  return (
    <AgentPage
      title="Test Case Agent"
      icon="🧪"
      placeholder="Describe a feature or user story...&#10;&#10;Example: As a user, I want to log in with email and password so that I can access my dashboard."
      endpoint="/agents/test-case"
      outputLabel="Generated Test Cases"
    />
  );
}
