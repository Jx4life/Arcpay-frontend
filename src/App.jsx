import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { OnboardingProvider } from "./context/OnboardingContext";
import LandingPage from "./components/LandingPage";
import MainApp from "./components/MainApp";

/**
 * App - top level routing and providers only.
 *
 * Responsibilities:
 * - Wrap application with providers (OnboardingProvider)
 * - Declare high-level routes:
 *   - "/" -> LandingPage (onboarding / public landing)
 *   - "/app/*" -> MainApp (the main authenticated application UI)
 *
 * Note: The previous large App implementation has been split:
 * - Main application UI should live in `src/components/MainApp.jsx`
 * - Onboarding logic/state is provided by `OnboardingProvider` and consumed
 *   by `LandingPage` and `MainApp` as needed.
 */
export default function App() {
  return (
    <OnboardingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/*" element={<MainApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </OnboardingProvider>
  );
}
