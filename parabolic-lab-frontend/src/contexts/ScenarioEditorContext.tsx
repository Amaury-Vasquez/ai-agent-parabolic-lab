"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { PhysicsConfig } from "@/types/physicsConfig";

interface ScenarioEditorContextType {
  physicsConfig: PhysicsConfig;
  updatePhysicsConfig: (config: Partial<PhysicsConfig>) => void;
  setPhysicsConfig: (config: PhysicsConfig) => void;
}

const ScenarioEditorContext = createContext<
  ScenarioEditorContextType | undefined
>(undefined);

interface ScenarioEditorProviderProps {
  children: ReactNode;
  initialConfig: PhysicsConfig;
}

export const ScenarioEditorProvider = ({
  children,
  initialConfig,
}: ScenarioEditorProviderProps) => {
  const [physicsConfig, setPhysicsConfigState] =
    useState<PhysicsConfig>(initialConfig);

  const updatePhysicsConfig = useCallback((config: Partial<PhysicsConfig>) => {
    setPhysicsConfigState((prev) => ({
      ...prev,
      ...config,
    }));
  }, []);

  const setPhysicsConfig = useCallback((config: PhysicsConfig) => {
    setPhysicsConfigState(config);
  }, []);

  const value = useMemo(
    () => ({
      physicsConfig,
      updatePhysicsConfig,
      setPhysicsConfig,
    }),
    [physicsConfig, updatePhysicsConfig, setPhysicsConfig]
  );

  return (
    <ScenarioEditorContext.Provider value={value}>
      {children}
    </ScenarioEditorContext.Provider>
  );
};

export const useScenarioEditor = () => {
  const context = useContext(ScenarioEditorContext);
  if (context === undefined) {
    throw new Error(
      "useScenarioEditor must be used within a ScenarioEditorProvider"
    );
  }
  return context;
};
