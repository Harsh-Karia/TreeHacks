import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { mockPilots, type Pilot } from '@/data/mockPilotData';
import { cn } from "@/lib/utils";
import { Plane, BarChart } from "lucide-react";
import { PilotDetailModal } from "./dashboard-panel";
import type { Screen } from "@/types/screen";
import { NavBar } from "./shared/nav-bar";
import { motion } from "framer-motion";

interface CommanderOverviewProps {
  onNavigate?: (screen: Screen) => void;
}

export const CommanderOverview: React.FC<CommanderOverviewProps> = ({ onNavigate }) => {
  const [selectedSquadron, setSelectedSquadron] = useState(1);
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [showChart, setShowChart] = useState<string | null>(null);

  const historicalData = {
    "Average Readiness": [92, 91, 90, 89, 88, 87, 86, 85],
    "Average Recovery Time": [6.0, 6.2, 6.5, 7.0, 7.2, 7.5, 7.8, 8.0],
    "Training Intensity": [85, 84, 83, 82, 81, 80, 79, 78],
    "Mission Success Rate": [94, 93.5, 93, 92.5, 92, 91.5, 91, 90.5],
    "Physiotherapy Hours": [24, 23, 25, 24, 26, 25, 24, 23],
  } as const;

  const LiveIndicator = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 bg-[#00FF9D] rounded-full"></div>
        <div className="w-2 h-2 bg-[#00FF9D] rounded-full absolute top-0 animate-ping"></div>
      </div>
      <span className="text-xs font-semibold text-[#00FF9D]">LIVE</span>
    </div>
  );

  const TrendArrow: React.FC<{ trend: 'up' | 'down' }> = ({ trend }) => (
    <span className={cn(
      "ml-1",
      trend === 'up' ? 'text-green-500' : 'text-red-500',
      trend === 'up' ? '↑' : '↓'
    )}>
      {trend === 'up' ? '↑' : '↓'}
    </span>
  );

  const MetricItem: React.FC<{
    label: string;
    current: string;
    previous?: string;
    trend?: 'up' | 'down';
  }> = ({ label, current, previous, trend }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#00A3FF]">
          {current}
          {previous && ` → ${previous}`}
          {trend && <TrendArrow trend={trend} />}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#00A3FF] hover:bg-[#00A3FF]/10 p-1 rounded-full"
          onClick={() => setShowChart(label)}
        >
          <BarChart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const ChartModal = () => {
    if (!showChart) return null;

    const data = historicalData[showChart as keyof typeof historicalData];
    const weeks = [...Array(8)].map((_, i) => `Week ${8-i}`);

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={() => setShowChart(null)}
      >
        <div
          className="bg-[#0B1219] border border-white/20 p-6 rounded-lg max-w-3xl w-full m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#00A3FF]">{showChart} - Last 8 Weeks</h3>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => setShowChart(null)}
            >
              Close
            </Button>
          </div>
          <div className="h-[400px] bg-black/40 rounded-lg p-4">
            <div className="h-full flex items-end justify-between gap-4">
              {data.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-[#00A3FF]/20 rounded-t-lg transition-all duration-500"
                    style={{ 
                      height: `${(value / Math.max(...data)) * 300}px`,
                      backgroundColor: index === 0 ? 'rgba(0, 163, 255, 0.4)' : 'rgba(0, 163, 255, 0.2)'
                    }}
                  />
                  <span className="text-xs text-white/60 rotate-45 origin-left">{weeks[index]}</span>
                  <span className="text-xs text-[#00A3FF]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add debug handler for navigation
  const handleFlightMonitoringClick = () => {
    console.log("Flight Monitoring button clicked");
    if (onNavigate) {
      console.log("Calling onNavigate with 'dashboard' screen");
      onNavigate("dashboard");
    } else {
      console.warn("onNavigate callback is not defined");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1219] text-white/80 p-6 font-mono relative overflow-hidden rounded-lg"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}>
      <div className="max-w-7xl mx-auto space-y-6 rounded-lg">
        <NavBar 
          onNavigate={onNavigate!} 
          title="COMMAND CENTER" 
          showFlightMonitoring={true}
        />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-12 gap-6 rounded-lg"
        >
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-4 rounded-lg space-y-6"
          >
            <Card className="border border-white/20 bg-black/20 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white/80">Health Overview</h3>
                <LiveIndicator />
              </div>
              <div className="space-y-3">
                <MetricItem
                  label="Average Readiness"
                  current="92%"
                  previous="87%"
                  trend="down"
                />
                <MetricItem
                  label="Average Recovery Time"
                  current="6hrs"
                  previous="8hrs"
                  trend="up"
                />
                <MetricItem
                  label="Training Intensity"
                  current="85%"
                  previous="78%"
                  trend="down"
                />
                <MetricItem
                  label="Mission Success Rate"
                  current="94%"
                  previous="91%"
                  trend="down"
                />
                <MetricItem
                  label="Physiotherapy Hours"
                  current="24hrs"
                  trend="up"
                />
              </div>
            </Card>

            <Card className="border border-white/20 bg-black/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white/80 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1 rounded-lg">
                  <span className="text-sm text-white/60">Hours in Air</span>
                  <span className="text-[#00A3FF]">156h</span>
                </div>
                <div className="flex justify-between items-center py-1 rounded-lg">
                  <span className="text-sm text-white/60">Time to Next Flight</span>
                  <span className="text-[#00A3FF]">2h 15m</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Edited Section Starts Here */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-8 space-y-6"
          >
            {/* Strategic Insights Card */}
            <Card className="border border-white/20 bg-black/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white/80 mb-6">Strategic Insights</h3>
              <div className="grid gap-4">
                <div className="p-4 border border-white/30 bg-black/10 rounded-lg">
                  <div className="flex items-center">
                    <h4 className="text-white font-semibold w-36">Readiness Alert</h4>
                    <p className="text-white/80">Squadron readiness dropping 8% week-over-week</p>
                  </div>
                </div>
                <div className="p-4 border border-white/30 bg-black/10 rounded-lg">
                  <div className="flex items-center">
                    <h4 className="text-white font-semibold w-36">Recovery Analysis</h4>
                    <p className="text-white/80">Recovery times increased 25% after night missions</p>
                  </div>
                </div>
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                  <div className="flex items-center">
                    <h4 className="text-red-500 font-semibold w-36">Performance Warning</h4>
                    <p className="text-white/80">Squadron recorded highest number of critical situations this week</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Strategy Adjustments Card */}
            <Card className="border border-white/20 bg-black/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white/80 mb-6">Strategy Adjustments</h3>
              <div className="grid gap-4">
                <div className="p-4 border border-[#00FF9D]/30 bg-[#00FF9D]/10 rounded-lg">
                  <h4 className="text-[#00FF9D] font-semibold mb-2">Sleep Optimization Protocol</h4>
                  <p className="text-white/80">Implement mandatory sleep requirements: minimum 2 hours REM sleep within 7-8 hours total rest period for all squadron personnel</p>
                </div>
                <div className="p-4 border border-[#00A3FF]/30 bg-[#00A3FF]/10 rounded-lg">
                  <h4 className="text-[#00A3FF] font-semibold mb-2">G-Force Management</h4>
                  <p className="text-white/80">Temporarily reduce high G-force training exercises by 30%. Implement progressive reintroduction based on individual pilot readiness scores</p>
                </div>
                <div className="p-4 border border-[#FFB800]/30 bg-[#FFB800]/10 rounded-lg">
                  <h4 className="text-[#FFB800] font-semibold mb-2">Enhanced Recovery Protocol</h4>
                  <p className="text-white/80">Extend post-night-mission recovery period by 2 hours. Implement mandatory biometric monitoring during recovery phase</p>
                </div>
              </div>
            </Card>
          </motion.div>
          {/* Edited Section Ends Here */}

          {/* Squadron Personnel Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="col-span-12 border border-white/20 bg-black/20 p-6 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white/80 mb-6">Squadron Personnel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPilots.map((pilot: Pilot, index: number) => (
                <div 
                  key={index} 
                  className="border border-white/20 bg-black/40 p-4 rounded-lg relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPilot(pilot)}
                >
                  <div className="grid grid-cols-[96px,1fr] gap-4">
                    <div className="space-y-2">
                      <div className="aspect-square w-24 bg-black border border-white/20 rounded-lg overflow-hidden">
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
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Heart Rate</span>
                          <span className="text-[#00A3FF]">{pilot.vitals.heartRate} BPM</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">O2 Level</span>
                          <span className="text-[#00A3FF]">{pilot.vitals.oxygenLevel}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">G-Force</span>
                          <span className="text-[#00A3FF]">{pilot.vitals.g_force}G</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {selectedPilot && (
          <PilotDetailModal 
            pilot={selectedPilot} 
            onClose={() => setSelectedPilot(null)} 
          />
        )}

        <ChartModal />
      </div>
    </div>
  );
};

export default CommanderOverview;