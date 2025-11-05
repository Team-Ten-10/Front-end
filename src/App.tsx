import { BrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Router from "./routes/router";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Router />
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
