import React, { useState } from "react";
import NewsPage from "./pages/NewsPage";
import SecPage from "./pages/SecPage";

const App: React.FC = () => {
  const [buttonState, setButtonState] = useState<string>("sec");

  return (
    <div className="App">
      <button
        style={{
          width: 50,
          height: 20,
          borderRadius: 5,
          backgroundColor: "green",
        }}
        onClick={() => setButtonState("sec")}
      >
        Sec
      </button>
      <button
        style={{
          width: 50,
          height: 20,
          borderRadius: 5,
          backgroundColor: "red",
        }}
        onClick={() => setButtonState("news")}
      >
        News
      </button>

      {buttonState === "sec" ? <SecPage /> : <NewsPage />}
    </div>
  );
};

export default App;
