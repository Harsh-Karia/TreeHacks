"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import InitializationScreen from "@/components/initialization-screen"
import MainDashboard from "@/components/main-dashboard"
import DebriefScreen from "@/components/debrief-screen"
import RecommendationScreen from "@/components/recommendation-screen"
import CommanderOverview from "@/components/commander-overview"
import type { MissionSession } from "@/types/session"
import type { Screen } from "@/types/screen"

function DashboardPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("init")
  const [missionSession, setMissionSession] = useState<MissionSession | null>(null)

  const handleInitialize = () => {
    setCurrentScreen("dashboard")
  }

  const handleEndMission = (session: MissionSession) => {
    setMissionSession(session)
    setCurrentScreen("debrief")
  }

  const handleSubmitDebrief = () => {
    if (missionSession) {
      setCurrentScreen("recommendations")
    }
  }

  const handleReturnToCommand = () => {
    setCurrentScreen("dashboard")
    setMissionSession(null)
  }

  switch (currentScreen) {
    case "init":
      return <InitializationScreen onInitialize={handleInitialize} />
    case "dashboard":
      return <MainDashboard onEndMission={handleEndMission} onNavigate={setCurrentScreen} />
    case "commander":
      return <CommanderOverview onNavigate={setCurrentScreen} />
    case "debrief":
      if (!missionSession) {
        setCurrentScreen("dashboard")
        return null
      }
      return (
        <DebriefScreen
          onReturnToCommand={handleReturnToCommand}
          onSubmitDebrief={handleSubmitDebrief}
          missionSession={missionSession}
        />
      )
    case "recommendations":
      if (!missionSession) {
        setCurrentScreen("dashboard")
        return null
      }
      return (
        <RecommendationScreen
          onReturnToCommand={handleReturnToCommand}
          missionSession={missionSession}
        />
      )
    default:
      return null
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  );
}