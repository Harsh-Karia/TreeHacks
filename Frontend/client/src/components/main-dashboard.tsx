"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, XCircle, Home, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import DashboardPanel from "./dashboard-panel"
import { nanoid } from 'nanoid'
import type { MissionSession, NewMissionSession } from "@/types/session"
import type {Screen} from "@/types/screen" 
import { NavBar } from "./shared/nav-bar";
import { motion } from "framer-motion";

interface MainDashboardProps {
  onEndMission: (session: MissionSession) => void;
  onNavigate: (screen: Screen) => void;
}

export default function MainDashboard({ onEndMission, onNavigate }: MainDashboardProps) {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)
  const [missionSession, setMissionSession] = useState<MissionSession | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showDangerAlert, setShowDangerAlert] = useState(false)
  const [autopilotCountdown, setAutopilotCountdown] = useState<number | null>(null)

  // Initialize mission session when component mounts
  useEffect(() => {
    const newSession: NewMissionSession = {
      missionId: nanoid(),
      startTime: new Date(),
      activePilots: [],
      commanderFeedback: ""
    }
    setMissionSession(newSession as MissionSession)
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Add effect for monitoring dangerous heart rate levels
  useEffect(() => {
    if (!missionSession?.activePilots.length) return;

    const lastActivePilot = missionSession.activePilots[missionSession.activePilots.length - 1];
    const lastVitals = lastActivePilot.vitalsHistory[lastActivePilot.vitalsHistory.length - 1];

    if (lastVitals.heartRate > 180 || lastVitals.heartRate < 40) {
      setShowDangerAlert(true);
    } else {
      setShowDangerAlert(false);
      setAutopilotCountdown(null);
    }
  }, [missionSession])

  // Add effect for autopilot countdown
  useEffect(() => {
    if (autopilotCountdown === null) return;

    if (autopilotCountdown > 0) {
      const timer = setTimeout(() => {
        setAutopilotCountdown(prev => prev! - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autopilotCountdown]);

  const handleAutopilotSwitch = () => {
    setAutopilotCountdown(15);
  };

  const handleEndMission = () => {
    if (missionSession) {
      const endedSession: MissionSession = {
        ...missionSession,
        endTime: new Date(),
        missionDuration: new Date().getTime() - missionSession.startTime.getTime()
      }
      setMissionSession(endedSession)
      onEndMission(endedSession)
    }
  }

  const activePilotName = missionSession?.activePilots.length 
    ? missionSession.activePilots[missionSession.activePilots.length - 1].name 
    : "NO ACTIVE PILOT"

  return (
    <div
      className="min-h-screen bg-[#0B1219] text-white/80 p-6 relative overflow-hidden font-mono"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <NavBar 
          onNavigate={onNavigate} 
          title="USS GERALD R. FORD"
          showFinishMission={true}
          onFinishMission={() => setShowConfirmEnd(true)}
        />

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {showDangerAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="border border-[#FFB800] bg-[#FFB800]/10 p-4 rounded-lg animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-[#FFB800]" />
                  <span className="text-[#FFB800] font-bold">DANGEROUS HEART RATE DETECTED</span>
                </div>
                <Button
                  variant="destructive"
                  className="bg-[#FFB800] hover:bg-[#FFB800]/80 text-black"
                  onClick={handleAutopilotSwitch}
                >
                  Switch to Autopilot
                </Button>
              </div>
            </motion.div>
          )}

          {autopilotCountdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-9xl font-bold text-red-500 tabular-nums"
              >
                {autopilotCountdown}
              </motion.div>
            </motion.div>
          )}

          <DashboardPanel 
            missionSession={missionSession} 
            onUpdateSession={setMissionSession}
          />
        </motion.main>
      </div>

      <AlertDialog open={showConfirmEnd} onOpenChange={setShowConfirmEnd}>
        <AlertDialogContent className="bg-[#0B1219] border border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#FF3B3B] flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Confirm Mission Termination
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action will end the current mission and initiate the debrief sequence. All active monitoring will
              cease. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-white/20 text-white/60 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-500 text-white" onClick={handleEndMission}>
              End Mission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}