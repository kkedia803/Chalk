import { createContext } from "react";
import type { ChalkContextValue } from "../types";

export const ChalkContext = createContext<ChalkContextValue | null>(null);
