"use client"

import { useState, useEffect } from "react"
import { Power, Wifi, Database, Server, Shield, Info } from "lucide-react"
import { SegmentedDisplay } from "./segmented-display"
import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InitializationScreenProps {
  onInitialize: () => void;
}

export default function InitializationScreen({ onInitialize }: InitializationScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isInitializing, setIsInitializing] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleInitialize = () => {
    if (isInitializing) return
    setIsInitializing(true)
    
    // Play background music
    const audio = new Audio('./audio/background-music.mp3')
    audio.loop = true
    audio.play().catch(error => console.log('Audio playback failed:', error))
    
    onInitialize()
  }

  return (
    <div className="min-h-screen bg-[#0B1219] text-white/80 p-6 font-mono relative overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Section */}
        <header className="border border-white/20 bg-black/20 p-4 rounded-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-wider text-[#00A3FF]">FLEET COMMAND INITIALIZATION</h1>
            </div>
            <div className="text-white/60 text-sm">
              <SegmentedDisplay
                value={currentTime.toLocaleTimeString("en-US", { hour12: false })}
                className="text-lg"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <SystemStatus icon={Power} label="POWER" status="ONLINE" color="#00FF9D" />
            <SystemStatus icon={Wifi} label="NETWORK" status="CONNECTED" color="#00FF9D" />
            <SystemStatus icon={Database} label="DATABASE" status="SYNCED" color="#00FF9D" />
            <SystemStatus icon={Server} label="SERVERS" status="OPERATIONAL" color="#00FF9D" />
          </div>
        </header>

        {/* Center Section */}
        <main className="border border-white/20 bg-black/20 p-12 rounded-sm flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <button 
            onClick={() => setShowInfo(true)}
            className="text-[#00A3FF] text-8xl font-bold mb-12 hover:opacity-80 transition-opacity"
            style={{
              textShadow: "0 0 20px rgba(0, 163, 255, 0.5), 0 0 40px rgba(0, 163, 255, 0.3)"
            }}
          >
            AVIA
          </button>
          
          <Button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="text-xl py-6 px-12 rounded-sm transition-all duration-200 bg-[#00A3FF] hover:bg-[#00A3FF]/80 cursor-pointer"
          >
            {isInitializing ? "INITIALIZING..." : "INITIALIZE COMMAND CENTER"}
          </Button>

          {showInfo && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
              <div className="max-w-4xl w-full bg-[#0B1219] border border-white/20 p-12 rounded-sm relative">
                <Button 
                  variant="ghost" 
                  className="absolute top-4 right-4 text-white/60 hover:text-white"
                  onClick={() => setShowInfo(false)}
                >
                  ✕
                </Button>
                
                <h2 className="text-4xl font-bold text-[#00A3FF] mb-8">Mission Overview</h2>
                
                <div className="space-y-8">
                  <p className="text-xl text-white/80">The US Air Force is not making data based decisions.</p>
                  
                  <div className="space-y-8">
                    <div>
                      <p className="text-[#00A3FF] text-5xl font-bold mb-2">$10.9M</p>
                      <p className="text-lg text-white/80">to train an Air Force Fighter Pilot</p>
                    </div>
                    
                    <div>
                      <p className="text-[#00A3FF] text-5xl font-bold mb-2">98%</p>
                      <p className="text-lg text-white/80">of pilots are in pain</p>
                    </div>
                    
                    <div>
                      <p className="text-[#00A3FF] text-5xl font-bold mb-2">90%</p>
                      <p className="text-lg text-white/80">saying it affects mission performance</p>
                    </div>
                  </div>
                  
                  <p className="text-xl text-white/80 mt-8">
                    AVIA helps Air Force commanders by using the pilot's health data to improve performance
                  </p>
                </div>
              </div>
            </div>
          )}

          {isInitializing && <div className="text-[#00A3FF] animate-pulse mt-8">Establishing secure connection...</div>}
        </main>

        {/* Bottom Section */}
        <footer className="border border-white/20 bg-black/20 p-4 rounded-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <ReadinessIndicator label="SYSTEM READINESS" percentage={100} />
              <ReadinessIndicator label="CREW READINESS" percentage={95} />
            </div>
            <div className="text-right">
              <div className="text-sm text-white/60">CONNECTION STATUS</div>
              <div className="text-lg text-[#00FF9D] flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                SECURE
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

interface SystemStatusProps {
  icon: React.ElementType;
  label: string;
  status: string;
  color: string;
}

function SystemStatus({ icon: Icon, label, status, color }: SystemStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      <Icon className="w-5 h-5 text-[#00A3FF]" />
      <span className="text-xs text-white/60">{label}:</span>
      <span className="text-xs" style={{ color }}>
        {status}
      </span>
    </div>
  )
}

interface ReadinessIndicatorProps {
  label: string;
  percentage: number;
}

function ReadinessIndicator({ label, percentage }: ReadinessIndicatorProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-xs text-white/60 w-32">{label}:</span>
      <div className="w-48 bg-black/40 rounded-sm h-2 overflow-hidden">
        <div
          className="bg-[#00FF9D] h-full rounded-sm transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-[#00FF9D] w-12">{percentage}%</span>
    </div>
  )
}