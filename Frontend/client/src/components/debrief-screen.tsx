"use client";

import { useState } from "react";
import { Activity, ArrowLeft, Heart, Brain, Moon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { SegmentedDisplay } from "./segmented-display";
import type { LucideIcon } from "lucide-react";
import type { MissionSession } from "@/types/session";

interface NumericMetric {
  label: string;
  value: string;
  unit: string;
  placeholder: string;
}

interface DebriefScreenProps {
  onReturnToCommand: () => void;
  onSubmitDebrief: () => void;
  missionSession: MissionSession;
}

interface MetricDisplayProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  status?: "success" | "warning" | "error" | "normal";
}

const formatDuration = (startTime: Date, endTime: Date) => {
  const duration = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function DebriefScreen({
  onReturnToCommand,
  onSubmitDebrief,
  missionSession,
}: DebriefScreenProps) {
  const [assessment, setAssessment] = useState("");
  const [healthImpact, setHealthImpact] = useState(3);
  const [missionFinished, setMissionFinished] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, string>>({
    criticalSituations: "",
    avgResponseTime: "",
    timeInHighGs: "",
  });

  // Get the last active pilot's data
  const lastActivePilot =
    missionSession.activePilots[missionSession.activePilots.length - 1];
  const lastVitalsRecord =
    lastActivePilot?.vitalsHistory[lastActivePilot.vitalsHistory.length - 1];

  const numericMetrics: NumericMetric[] = [
    {
      label: "Critical situations encountered",
      value: metrics.criticalSituations,
      unit: "No.",
      placeholder: "Enter number of critical situations",
    },
    {
      label: "Average response time",
      value: metrics.avgResponseTime,
      unit: "ms",
      placeholder: "73",
    },
    {
      label: "Time Spent in High Gs",
      value: metrics.timeInHighGs,
      unit: "ms",
      placeholder: "Enter time in high G-force",
    },
  ];

  const handleMetricChange = (key: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMetrics((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleFinishMission = () => {
    // Add debrief metrics to the last active pilot
    const lastActivePilot =
      missionSession.activePilots[missionSession.activePilots.length - 1];
    if (lastActivePilot) {
      lastActivePilot.debriefMetrics = {
        criticalSituations: metrics.criticalSituations,
        avgResponseTime: metrics.avgResponseTime,
        timeInHighGs: metrics.timeInHighGs,
      };
    }
    setMissionFinished(true);
  };

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
        <header className="border border-white/20 p-4 rounded-sm bg-black/20">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-wider text-[#00A3FF]">
              MISSION BIOMETRIC ANALYSIS COMPLETE
            </h1>
            <div className="text-white/60 text-sm space-x-4">
              <span>
                DURATION:{" "}
                <SegmentedDisplay
                  value={formatDuration(
                    missionSession.startTime,
                    missionSession.endTime!,
                  )}
                  className="text-[#00A3FF]"
                />
              </span>
              <span>
                PILOT:{" "}
                <span className="text-[#00A3FF]">{lastActivePilot.name}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-2 gap-6">
          <div className="border border-white/20 bg-black/20 p-6 rounded-sm space-y-6">
            <h2 className="text-lg font-semibold text-white/80">
              Vital Trends
            </h2>
            <div className="space-y-4">
              <MetricDisplay
                icon={Heart}
                label="Average Heart Rate"
                value={lastVitalsRecord.heartRate}
                unit="BPM"
              />
              <MetricDisplay
                icon={Activity}
                label="Blood Pressure"
                value={`${lastVitalsRecord.bloodPressure.sys}/${lastVitalsRecord.bloodPressure.dia}`}
                unit="mmHg"
              />
              <MetricDisplay
                icon={Brain}
                label="Heart Rate Variability"
                value={lastVitalsRecord.performanceScore}
                unit="ms"
              />
            </div>
          </div>

          <div className="border border-white/20 bg-black/20 p-6 rounded-sm space-y-6">
            <h2 className="text-lg font-semibold text-white/80">
              Performance Analysis
            </h2>
            <div className="space-y-4">
              <MetricDisplay
                icon={Activity}
                label="Readiness Score"
                value={lastVitalsRecord.readinessScore}
                unit="%"
                status="success"
              />
              <MetricDisplay
                icon={Moon}
                label="Sleep Quality"
                value={85}
                unit="%"
                status="success"
              />
              <MetricDisplay
                icon={Activity}
                label="Maximum G-Force"
                value={lastVitalsRecord.g_force}
                unit="G"
                status={lastVitalsRecord.g_force > 5 ? "warning" : "success"}
              />
            </div>
          </div>

          <div className="col-span-2 border border-white/20 bg-black/20 p-6 rounded-sm space-y-6">
            <h2 className="text-lg font-semibold text-white/80">
              Commander Assessment
            </h2>

            <div className="space-y-6">
              <Textarea
                placeholder="Enter biometric assessment..."
                className="bg-black/40 border-white/20 text-white/80 h-32"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
              />

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/60">
                    Health-Based Decision Impact (1-5)
                  </label>
                  <Slider
                    value={[healthImpact]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([value]) => setHealthImpact(value)}
                    className="w-full"
                  />
                  <div className="text-right text-sm text-[#00A3FF]">
                    {healthImpact}/5
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {numericMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm text-white/60 block">
                        {metric.label}
                        <span className="text-[#00A3FF] ml-1">
                          ({metric.unit})
                        </span>
                      </label>
                      <Input
                        type="text"
                        placeholder={metric.placeholder}
                        value={metric.value}
                        onChange={(e) =>
                          handleMetricChange(
                            Object.keys(metrics)[index],
                            e.target.value,
                          )
                        }
                        className="bg-black/40 border-white/20 text-white/80"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex justify-between items-center">
          <Button
            variant="outline"
            className={`text-white/60 border-white/20 ${missionFinished ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}`}
            onClick={onReturnToCommand}
            disabled={missionFinished}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Command
          </Button>

          <Button
            className={`bg-[#00A3FF] ${missionFinished ? "opacity-80 cursor-not-allowed" : "hover:bg-[#00A3FF]/80"}`}
            onClick={() => {
              handleFinishMission();
              onSubmitDebrief();
            }}
            disabled={missionFinished}
          >
            <Send className="w-4 h-4 mr-2" />
            {missionFinished ? "Mission Complete" : "Submit Analysis"}
          </Button>
        </footer>

        {/* Screen Navigation */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 text-sm">
          <div className="text-white/60">Screen</div>
          <div className="bg-black/40 border border-white/20 px-2 py-1 rounded-sm">
            3
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricDisplay({
  icon: Icon,
  label,
  value,
  unit,
  status = "normal",
}: MetricDisplayProps) {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-[#00FF9D]";
      case "warning":
        return "text-[#FFB800]";
      case "error":
        return "text-[#FF3B3B]";
      default:
        return "text-[#00A3FF]";
    }
  };

  return (
    <div className="flex items-center justify-between border border-white/10 bg-black/40 p-4 rounded-sm">
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${getStatusColor()}`} />
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <div className="flex items-baseline space-x-1">
        <SegmentedDisplay value={value} />
        <span className="text-xs text-white/40">{unit}</span>
      </div>
    </div>
  );
}
