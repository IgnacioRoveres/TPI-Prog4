import { useEffect } from "react";
import AppRouter from "@/routes/AppRouter";
import { useAuthStore } from "@/store/authStore";

/** Llama a checkSession al montar (única llamada dentro de un useEffect) y renderiza las rutas. */
function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}

export default App;
