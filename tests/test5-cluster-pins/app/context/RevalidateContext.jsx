// revalidate root
import { createContext, useContext } from "react";

const RevalidateContext = createContext(null);

export function RevalidateProvider({ revalidate, children }) {
  return (
    <RevalidateContext.Provider value={revalidate}>
      {children}
    </RevalidateContext.Provider>
  );
}

export function useRevalidateRoot() {
  const revalidate = useContext(RevalidateContext);
  if (!revalidate) throw new Error("useRevalidateRoot must be used within RevalidateProvider");
  return revalidate;
}