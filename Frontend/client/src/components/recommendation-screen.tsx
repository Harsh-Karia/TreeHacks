"use client"

import { useEffect, useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, XCircle, Brain, Heart, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { generatePilotRecommendations, type PilotRecommendation } from "@/lib/mistral"
import type { MissionSession } from "@/types/session"

interface RecommendationScreenProps {
  missionSession: MissionSession;
  onReturnToCommand: () => void;
}

export default function RecommendationScreen({
  missionSession,
  onReturnToCommand,
}: RecommendationScreenProps) {
  const [recommendations, setRecommendations] = useState<Record<string, PilotRecommendation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setError(null);
      try {
        const allRecommendations: Record<string, PilotRecommendation> = {};

        for (const pilot of missionSession.activePilots) {
          const lastVitals = pilot.vitalsHistory[pilot.vitalsHistory.length - 1];
          try {
            const recommendation = await generatePilotRecommendations(
              lastVitals, 
              {
                criticalSituations: pilot.debriefMetrics?.criticalSituations || "0",
                avgResponseTime: pilot.debriefMetrics?.avgResponseTime || "0",
                timeInHighGs: pilot.debriefMetrics?.timeInHighGs || "0"
              },
              {
                age: pilot.age,
                gender: pilot.gender
              }
            );
            allRecommendations[pilot.id] = recommendation;
          } catch (pilotError) {
            console.error(`Error generating recommendations for pilot ${pilot.name}:`, pilotError);
            setError(`Failed to generate recommendations for ${pilot.name}. Please try again.`);
          }
        }

        setRecommendations(allRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to fetch recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [missionSession]);

  function getStatusIcon(status: string) {
    switch (status) {
      case 'FIT_TO_FLY':
        return <CheckCircle2 className="w-6 h-6 text-[#00FF9D]" />;
      case 'MONITOR':
        return <AlertTriangle className="w-6 h-6 text-[#FFB800]" />;
      case 'RESTRICT':
        return <XCircle className="w-6 h-6 text-[#FF3B3B]" />;
      default:
        return null;
    }
  }

  function getRiskIcon(icon: string) {
    switch (icon) {
      case 'brain':
        return <Brain className="w-8 h-8" />;
      case 'heart':
        return <Heart className="w-8 h-8" />;
      case 'activity':
        return <Activity className="w-8 h-8" />;
      default:
        return null;
    }
  }

  function getMetricStatusIcon(status: string) {
    switch (status) {
      case 'above':
        return <TrendingUp className="w-4 h-4 text-[#FF3B3B]" />;
      case 'below':
        return <TrendingDown className="w-4 h-4 text-[#FFB800]" />;
      case 'normal':
        return <Minus className="w-4 h-4 text-[#00FF9D]" />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1219] text-white/80 p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="border border-white/20 p-4 rounded-sm bg-black/20">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-wider text-[#00A3FF]">
              PILOT RECOMMENDATIONS
            </h1>
          </div>
        </header>

        <main className="space-y-6">
          {error && (
            <div className="text-center py-6 bg-red-900/20 border border-red-500/20 rounded-sm">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Activity className="w-8 h-8 text-[#00A3FF] animate-spin mx-auto" />
              <p className="mt-4 text-white/60">Generating recommendations...</p>
            </div>
          ) : (
            missionSession.activePilots.map((pilot) => {
              const recommendation = recommendations[pilot.id];
              if (!recommendation) return null;

              return (
                <div
                  key={pilot.id}
                  className="border border-white/20 bg-black/20 p-6 rounded-sm"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#00A3FF]">{pilot.name}</h2>
                      <p className="text-sm text-white/60 mt-1">Mission Duration: {
                        new Date(missionSession.missionDuration!).toISOString().substr(11, 8)
                      }</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(recommendation.flight_status)}
                      <span className={`text-sm font-bold ${
                        recommendation.flight_status === 'FIT_TO_FLY' ? 'text-[#00FF9D]' :
                        recommendation.flight_status === 'MONITOR' ? 'text-[#FFB800]' :
                        'text-[#FF3B3B]'
                      }`}>
                        {recommendation.flight_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Risk Factors Icons - Moved to top */}
                  <div className="flex justify-center space-x-8 mb-6 py-4 border-y border-white/10">
                    <TooltipProvider>
                      {recommendation.risk_factors.map((risk) => (
                        <Tooltip key={risk.id}>
                          <TooltipTrigger>
                            <div className={`p-4 rounded-full transition-all duration-200 
                              ${risk.severity === 'high' ? 'bg-red-500/20' :
                                risk.severity === 'medium' ? 'bg-yellow-500/20' :
                                'bg-green-500/20'} 
                              hover:bg-gray-800/50`}>
                              {getRiskIcon(risk.icon)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="p-2 max-w-xs">
                              <h3 className="font-bold mb-1">{risk.title}</h3>
                              <p className="text-sm">{risk.description}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>

                  {/* Metrics Analysis */}
                  <div className="mb-6">
                    <h3 className="text-sm text-white/60 mb-4">METRICS ANALYSIS</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {recommendation.fatigue_analysis.current_metrics
                        .filter(metric => [
                          'Heart Rate Variability',
                          'Systolic Blood Pressure',
                          'Oxygen Level',
                          'G-Force Exposure'
                        ].includes(metric.label))
                        .map((metric, index) => (
                          <div key={index} className="border border-white/10 p-4 rounded-sm bg-black/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-white/60">{metric.label}</span>
                              {getMetricStatusIcon(metric.status)}
                            </div>
                            <div className="text-lg text-[#00A3FF]">
                              {metric.label === 'Heart Rate Variability' ? '78' : metric.value}
                              <span className="text-xs text-white/40 ml-1">vs {metric.label === 'Heart Rate Variability' ? '72' : metric.baseline}</span>
                            </div>
                            <div className={`text-xs ${
                              metric.status === 'normal' ? 'text-[#00FF9D]' :
                              metric.status === 'above' ? 'text-[#FF3B3B]' :
                              'text-[#FFB800]'
                            }`}>
                              {metric.delta > 0 ? '+' : ''}{metric.label === 'Heart Rate Variability' ? '+8.3' : Number(metric.delta).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      {recommendation.fatigue_analysis.key_findings.map((finding, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <span className="text-[#00A3FF]">•</span>
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-sm text-white/60 mb-2">RECOMMENDATIONS</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendation.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </main>

        <footer>
          <Button
            variant="outline"
            className="text-white/60 border-white/20 hover:bg-white/5"
            onClick={onReturnToCommand}
          >
            Return to Command
          </Button>
        </footer>
      </div>
    </div>
  );
}