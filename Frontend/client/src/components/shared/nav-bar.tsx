"use client"

import { Home, Plane, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { Screen } from "@/types/screen"

interface NavBarProps {
  onNavigate: (screen: Screen) => void;
  title: string;
  showFlightMonitoring?: boolean;
  showFinishMission?: boolean;
  onFinishMission?: () => void;
}

export function NavBar({ onNavigate, title, showFlightMonitoring, showFinishMission, onFinishMission }: NavBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-white/20 p-4 rounded-lg bg-black/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-[#00A3FF] font-bold text-2xl tracking-wider relative group"
          >
            <span className="relative z-10">AVIA</span>
            <motion.div
              className="absolute inset-0 bg-[#00A3FF]/10 -z-10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              animate={{ scale: [0.95, 1] }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
          <div className="text-[#00A3FF] text-xl tracking-wider">{title}</div>
        </div>
        <div className="flex items-center space-x-4">
          {showFlightMonitoring && (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#00A3FF] hover:bg-[#00A3FF]/10 rounded-lg"
                onClick={() => onNavigate("dashboard")}
              >
                <Plane className="w-4 h-4 mr-2" />
                Flight Monitoring
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#00A3FF] hover:bg-[#00A3FF]/10 rounded-lg"
              onClick={() => onNavigate("commander")}
            >
              <Home className="w-4 h-4 mr-2" />
              Command Center
            </Button>
          </motion.div>
          {showFinishMission && (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white rounded-lg"
                onClick={onFinishMission}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Finish Mission
              </Button>
            </motion.div>
          )}
          <div className="text-white/60 text-sm pl-4">
            TIME: <span className="text-[#00A3FF]">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}