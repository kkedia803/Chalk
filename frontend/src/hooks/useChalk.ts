import { useContext } from "react";
import { ChalkContext } from "../context/ChalkContext";
import type { ChalkContextValue } from "../types";

export function useChalk(): ChalkContextValue {
  const ctx = useContext(ChalkContext);
  if (!ctx) throw new Error("useChalk must be used inside <ChalkProvider>");
  return ctx;
}
