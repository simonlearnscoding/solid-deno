import { Route, Router } from "@solidjs/router";
import Index from "./pages/Index.tsx";
import Dinosaur from "./pages/Dinosaur.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { onMount } from "solid-js";
import { useAuthStore } from "./stores/authStore.ts";
import "./App.css";

const App = () => {
  const auth = useAuthStore();
  onMount(() => {
    auth.actions.verifyToken();
  });
  //TODO: protect routes when user not logged in
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Index} />
        <Route path="/:selectedDinosaur" component={Dinosaur} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Register} />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
