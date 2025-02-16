"use client"

import { useState } from "react"
import { Activity, AlertTriangle, Heart, Gauge, Thermometer, Plus, Info } from "lucide-react"
import { SegmentedDisplay } from "./segmented-display"
import { type Pilot, mockPilots, filterPilotsByStatus, updatePilotStatus } from "@/data/mockPilotData"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { MissionSession } from "@/types/session"

interface VitalMetricProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit: string;
  subValue?: string | number;
  subUnit?: string;
  status?: "stable" | "warning";
  info?: string;
}

function VitalMetric({ icon: Icon, label, value, unit, subValue, subUnit, status = "stable", info }: VitalMetricProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">{label}</span>
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-white/40" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[400px] bg-black/90 p-4 text-xs">
                  <div className="space-y-2">
                    <p className="font-mono text-white/80">{info}</p>
                    <pre className="bg-black/50 p-2 rounded-sm text-[10px] text-green-400">
                      {`if len(peaks) > 1:
    rr_intervals = np.diff(df["sample_index"].iloc[peaks])
    heart_rate = 60 / (np.mean(rr_intervals) / 100)
else:
    heart_rate = np.nan

SBP = 0.5 * heart_rate + 100
DBP = 0.3 * heart_rate + 60`}
                    </pre>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {status !== undefined && (
          <div className={`h-2 w-2 rounded-full ${status === "stable" ? "bg-[#00A3FF]" : "bg-[#FF5A1F]"}`} />
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <Icon className="w-4 h-4 text-[#00A3FF]" />
          <SegmentedDisplay value={value} className="text-3xl" />
          <span className="text-xs text-white/40">{unit}</span>
        </div>
        {subValue && (
          <div className="text-sm text-[#00A3FF] pl-6">
            {subValue} {subUnit}
          </div>
        )}
      </div>
    </div>
  )
}

interface PilotDetailModalProps {
  pilot: Pilot;
  onClose: () => void;
}

export function PilotDetailModal({ pilot, onClose }: PilotDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0B1219] border border-white/20 p-6 rounded-sm max-w-2xl w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-32 aspect-square bg-black border border-white/20 rounded-sm overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Photoroom-zt2ZaOWIYpeosy73bBMSY2odSdElBk.png"
                alt={pilot.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#00A3FF] mb-2">{pilot.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Role:</span>
                  <span className="ml-2 text-white">{pilot.role}</span>
                </div>
                <div>
                  <span className="text-white/60">Rank:</span>
                  <span className="ml-2 text-white">{pilot.rank}</span>
                </div>
                <div>
                  <span className="text-white/60">Experience:</span>
                  <span className="ml-2 text-white">{pilot.monthsOfExperience} months</span>
                </div>
                <div>
                  <span className="text-white/60">Age:</span>
                  <span className="ml-2 text-white">{pilot.age} years</span>
                </div>
                <div>
                  <span className="text-white/60">Height:</span>
                  <span className="ml-2 text-white">{pilot.height} cm</span>
                </div>
                <div>
                  <span className="text-white/60">Weight:</span>
                  <span className="ml-2 text-white">{pilot.weight} kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg text-white/80">Current Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-white/60 text-sm">Heart Rate</div>
                <div className="text-xl text-[#00A3FF]">{pilot.vitals.heartRate} BPM</div>
                <div className="text-xs text-white/40">Resting: {pilot.vitals.averageRestingHeartRate} BPM</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-white/60 text-sm">Blood Pressure</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-white/40" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[400px] bg-black/90 p-4 text-xs">
                        <div className="space-y-2">
                          <p className="font-mono text-white/80">Blood pressure is estimated using PPG (Photoplethysmography) data. The formula calculates Systolic (SBP) and Diastolic (DBP) blood pressure based on heart rate derived from peak detection in the PPG signal.</p>
                          <pre className="bg-black/50 p-2 rounded-sm text-[10px] text-green-400">
                            {`if len(peaks) > 1:
    rr_intervals = np.diff(df["sample_index"].iloc[peaks])
    heart_rate = 60 / (np.mean(rr_intervals) / 100)
else:
    heart_rate = np.nan

SBP = 0.5 * heart_rate + 100
DBP = 0.3 * heart_rate + 60`}
                          </pre>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-xl text-[#00A3FF]">{pilot.vitals.bloodPressure.sys}/{pilot.vitals.bloodPressure.dia} mmHg</div>
              </div>
              <div className="space-y-2">
                <div className="text-white/60 text-sm">Oxygen Level</div>
                <div className="text-xl text-[#00A3FF]">{pilot.vitals.oxygenLevel}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-white/60 text-sm">Body Temperature</div>
                <div className="text-xl text-[#00A3FF]">{(pilot.vitals.bodyTemp * 1.8 + 32).toFixed(1)}°F</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button
              className="w-full bg-[#00A3FF] hover:bg-[#00A3FF]/80"
              onClick={onClose}
            >
              Close Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PilotCardProps {
  pilot: Pilot;
  onStatusChange: (id: string, status: "active" | "standby") => void;
}

function PilotCard({ pilot, onStatusChange }: PilotCardProps) {
  const [showReadinessInfo, setShowReadinessInfo] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const readinessColor = pilot.vitals.calculatedMetrics.readinessScore >= 90 ? "#00FF9D" : "#00A3FF"

  return (
    <div
      className="border border-white/20 bg-black/40 p-4 rounded-sm relative overflow-hidden cursor-pointer"
      onClick={() => setShowDetails(true)}
    >
      <div className="grid grid-cols-[96px,1fr] gap-4">
        <div className="space-y-2">
          <div className="aspect-square w-24 bg-black border border-white/20 rounded-sm overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Photoroom-zt2ZaOWIYpeosy73bBMSY2odSdElBk.png"
              alt={pilot.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-bold text-[#00A3FF]">{pilot.name}</h3>
            <p className="text-xs text-white/60">{pilot.role}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <VitalMetric
              icon={Heart}
              label="BLOOD PRESSURE"
              value={`${pilot.vitals.bloodPressure.sys}/${pilot.vitals.bloodPressure.dia}`}
              unit="mmHg"
              status={undefined}
            />
            <VitalMetric
              icon={Gauge}
              label="O2 LEVEL"
              value={pilot.vitals.oxygenLevel}
              unit="%"
              status={undefined}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00A3FF]" />
              <span className="text-xs text-[#00A3FF] uppercase">{pilot.status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`px-2 py-1 rounded-sm bg-[${readinessColor}] bg-opacity-20 border border-opacity-30 cursor-pointer hover:bg-opacity-30 transition-colors duration-200`}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReadinessInfo(true)
                }}
              >
                <span className="text-xs font-bold" style={{ color: readinessColor }}>
                  {pilot.vitals.calculatedMetrics.readinessScore}% READY
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange(pilot.id, "active")
                }}
              >
                <Plus className="w-4 h-4" style={{ color: readinessColor }} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showReadinessInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation()
            setShowReadinessInfo(false)
          }}
        >
          <div
            className="bg-[#0B1219] border border-white/20 p-6 rounded-sm max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold text-[#00A3FF] mb-4">Readiness Assessment</h4>
            <p className="text-sm text-white/80 mb-4">
              Readiness Score: {pilot.vitals.calculatedMetrics.readinessScore}%
              <br />
              Performance Score: {pilot.vitals.calculatedMetrics.performanceScore}%
              <br />
              Success Score: {pilot.vitals.calculatedMetrics.successScore}%
            </p>
            <Button
              className="mt-6 bg-[#00A3FF] text-white px-4 py-2 rounded-sm hover:bg-[#00A3FF]/80 transition-colors duration-200"
              onClick={() => setShowReadinessInfo(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showDetails && <PilotDetailModal pilot={pilot} onClose={() => setShowDetails(false)} />}
    </div>
  )
}

function ActivePilotMonitor({ pilot, onStatusChange }: { pilot: Pilot; onStatusChange: (id: string, status: "active" | "standby") => void }) {
  const [showDetails, setShowDetails] = useState(false)
  const hasWarning = pilot.vitals.heartRate > 100 || pilot.vitals.g_force > 7

  return (
    <div className="border border-white/20 bg-black/40 p-4 rounded-sm">
      <div className="grid grid-cols-[200px,1fr] gap-6">
        <div className="space-y-4">
          <div
            className="aspect-square w-full bg-black border border-white/20 rounded-sm overflow-hidden cursor-pointer"
            onClick={() => setShowDetails(true)}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Photoroom-zt2ZaOWIYpeosy73bBMSY2odSdElBk.png"
              alt={pilot.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-bold text-[#00A3FF]">{pilot.name}</h3>
          <p className="text-xs text-white/60">{pilot.role}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00FF9D]" />
              <span className="text-xs text-[#00FF9D] uppercase">{pilot.status}</span>
            </div>
            <Button
              variant="ghost"
              className="text-[#00FF9D] hover:text-[#00FF9D]/80"
              onClick={() => onStatusChange(pilot.id, "standby")}
            >
              Standby
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-6">
          <VitalMetric
            icon={Heart}
            label="HEART RATE"
            value={pilot.vitals.heartRate}
            unit="BPM"
            subValue={pilot.vitals.heartRateVar.toFixed(3)}
            status={pilot.vitals.heartRate > 100 ? "warning" : "stable"}
          />
          <VitalMetric
            icon={Heart}
            label="BLOOD PRESSURE"
            value={`${pilot.vitals.bloodPressure.sys}/${pilot.vitals.bloodPressure.dia}`}
            unit="mmHg"
            status="stable"
            info="Blood pressure is estimated using PPG (Photoplethysmography) data. The formula calculates Systolic (SBP) and Diastolic (DBP) blood pressure based on heart rate derived from peak detection in the PPG signal."
          />
          <VitalMetric
            icon={Gauge}
            label="G-FORCE"
            value={pilot.vitals.g_force}
            unit="G"
            status={pilot.vitals.g_force > 7 ? "warning" : "stable"}
          />
          <VitalMetric
            icon={Gauge}
            label="O2 LEVEL"
            value={pilot.vitals.oxygenLevel}
            unit="%"
            status={pilot.vitals.oxygenLevel < 95 ? "warning" : "stable"}
          />
        </div>
      </div>

      {hasWarning && (
        <div className="mt-4 border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 p-3 rounded-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-[#FF5A1F] w-5 h-5" />
            <div>
              <div className="text-[#FF5A1F] text-sm font-bold uppercase">Warning</div>
              <div className="text-white/60 text-xs">
                {pilot.vitals.heartRate > 100 ? "Elevated Heart Rate" : "High G-Force Detected"}
              </div>
            </div>
          </div>
          <span className="text-[#FF5A1F] text-sm font-bold">
            Autopilot enablement recommended
          </span>
        </div>
      )}

      {showDetails && <PilotDetailModal pilot={pilot} onClose={() => setShowDetails(false)} />}
    </div>
  )
}

interface DashboardPanelProps {
  missionSession: MissionSession | null;
  onUpdateSession: (session: MissionSession) => void;
}

export default function DashboardPanel({ missionSession, onUpdateSession }: DashboardPanelProps) {
  const [pilots, setPilots] = useState(mockPilots)
  const activePilots = filterPilotsByStatus(pilots, "active")
  const standbyPilots = filterPilotsByStatus(pilots, "standby")

  const handleStatusChange = (pilotId: string, newStatus: "active" | "standby") => {
    // Update local state first
    const updatedPilots = updatePilotStatus(pilots, pilotId, newStatus)
    setPilots(updatedPilots)

    if (missionSession) {
      const pilot = pilots.find(p => p.id === pilotId);
      if (pilot) {
        let updatedActivePilots = [...missionSession.activePilots]

        if (newStatus === "active") {
          // Add pilot to active pilots if not already present
          if (!updatedActivePilots.find(p => p.id === pilotId)) {
            updatedActivePilots.push({
              id: pilot.id,
              name: pilot.name,
              initialReadiness: pilot.vitals.calculatedMetrics.readinessScore,
              startTime: new Date(),
              vitalsHistory: [{
                timestamp: new Date(),
                heartRate: pilot.vitals.heartRate,
                bloodPressure: pilot.vitals.bloodPressure,
                oxygenLevel: pilot.vitals.oxygenLevel,
                g_force: pilot.vitals.g_force,
                readinessScore: pilot.vitals.calculatedMetrics.readinessScore,
                performanceScore: pilot.vitals.calculatedMetrics.performanceScore
              }]
            })
          }
        } else {
          // Remove pilot from active pilots when set to standby
          updatedActivePilots = updatedActivePilots.filter(p => p.id !== pilotId)
        }

        const updatedSession = {
          ...missionSession,
          activePilots: updatedActivePilots
        }
        onUpdateSession(updatedSession)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-white/20 bg-black/20 p-6 rounded-sm">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg uppercase tracking-wider">Active Pilot Monitor</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/60">EV1</span>
            <span className="text-xs text-[#00A3FF]">ZVE</span>
          </div>
        </div>

        <div className="space-y-6">
          {activePilots.map((pilot) => (
            <ActivePilotMonitor
              key={pilot.id}
              pilot={pilot}
              onStatusChange={handleStatusChange}
            />
          ))}
          {activePilots.length === 0 && (
            <div className="text-white/60 text-center py-8">
              No active pilots. Select a pilot from standby to begin monitoring.
            </div>
          )}
        </div>
      </div>

      <div className="border border-white/20 bg-black/20 p-6 rounded-sm">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg uppercase tracking-wider">Standby Pilots</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/60">EMU</span>
            <span className="text-xs text-[#00A3FF]">QST</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standbyPilots.map((pilot) => (
            <PilotCard
              key={pilot.id}
              pilot={pilot}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      
    </div>
  )
}