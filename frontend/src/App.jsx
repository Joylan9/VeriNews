import { useState } from 'react';
import Home from "./pages/Home";
import ReviewSplash from "./components/ReviewSplash";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <ReviewSplash onComplete={() => setShowSplash(false)} />;
  }

  return <Home />;
}

export default App;
