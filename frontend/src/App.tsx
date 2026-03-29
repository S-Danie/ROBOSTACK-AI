import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Box, 
  Camera, 
  Cpu, 
  Database, 
  Layers, 
  LayoutDashboard, 
  Play, 
  Square,
  Settings, 
  ShieldCheck, 
  Terminal,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import Telemetry from '@/components/Telemetry';
import { HealthMonitor } from '@/components/HealthMonitor';
import SettingsPage from '@/components/Settings';
import { useRos } from '@/hooks/useRos';
import { ROS_CONFIG, HARDWARE_CONFIG, SYSTEM_STATES, SystemState } from '@/constants';

/**
 * @component RobotArmVisual
 * @description Professional SVG representation of a 6-DOF robotic arm.
 */
function RobotArmVisual({ jointValues }: { jointValues: number[] }) {
  // Simple mapping of joint values to SVG coordinates for visualization
  const j1 = jointValues[0] / 10;
  const j2 = jointValues[1] / 10;
  const j3 = jointValues[2] / 10;

  return (
    <svg viewBox="0 0 100 100" className="w-48 h-48 text-cyan-500/30">
      {/* Base */}
      <rect x="40" y="85" width="20" height="5" rx="1" fill="currentColor" />
      {/* Joint 1 */}
      <motion.circle 
        cx={50 + j1} 
        cy="80" 
        r="4" 
        fill="currentColor" 
        animate={{ cx: 50 + j1 }}
      />
      {/* Segment 1 */}
      <motion.line 
        x1={50 + j1} 
        y1="80" 
        x2={50 + j1 + j2} 
        y2="60" 
        stroke="currentColor" 
        strokeWidth="4" 
        animate={{ x1: 50 + j1, x2: 50 + j1 + j2 }}
      />
      {/* Joint 2 */}
      <motion.circle 
        cx={50 + j1 + j2} 
        cy="60" 
        r="4" 
        fill="currentColor" 
        animate={{ cx: 50 + j1 + j2 }}
      />
      {/* Segment 2 */}
      <motion.line 
        x1={50 + j1 + j2} 
        y1="60" 
        x2={70 + j1 + j2 + j3} 
        y2="40" 
        stroke="currentColor" 
        strokeWidth="4" 
        animate={{ x1: 50 + j1 + j2, x2: 70 + j1 + j2 + j3 }}
      />
      {/* Joint 3 */}
      <motion.circle 
        cx={70 + j1 + j2 + j3} 
        cy="40" 
        r="4" 
        fill="currentColor" 
        animate={{ cx: 70 + j1 + j2 + j3 }}
      />
      {/* Segment 3 */}
      <motion.line 
        x1={70 + j1 + j2 + j3} 
        y1="40" 
        x2={60 + j1 + j2 + j3} 
        y2="20" 
        stroke="currentColor" 
        strokeWidth="4" 
        animate={{ x1: 70 + j1 + j2 + j3, x2: 60 + j1 + j2 + j3 }}
      />
      {/* End Effector */}
      <motion.path 
        d="M55 15 L65 15 L60 25 Z" 
        fill="currentColor" 
        animate={{ x: j1 + j2 + j3 }}
      />
      
      {/* Ground Grid */}
      <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * @constant SKU_PERFORMANCE
 * @description Mock performance data for SKU auditing.
 */
const SKU_PERFORMANCE = Array.from({ length: 20 }, (_, i) => ({
  id: `SKU-${1000 + i}`,
  name: `Heterogeneous Item ${i + 1}`,
  successRate: Math.floor(Math.random() * 15) + 85,
  avgTime: (Math.random() * 2 + 3).toFixed(2),
  status: Math.random() > 0.1 ? 'Stable' : 'Degraded'
}));

/**
 * @constant TELEMETRY_DATA
 * @description Mock telemetry data for visualization.
 */
const TELEMETRY_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  torque: 15 + Math.sin(i / 2) * 5,
  velocity: 0.4 + Math.cos(i / 3) * 0.1
}));

/**
 * @component App
 * @description Main application entry point for the RoboStack AI Control Center.
 * Manages high-level state machine and coordinates sub-components.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState<SystemState>(SYSTEM_STATES.IDLE);
  const [isMissionActive, setIsMissionActive] = useState(false);
  const isMissionActiveRef = useRef(false);
  const [jointValues, setJointValues] = useState([45, -30, 90, 0, -45, 12]);
  const [logs, setLogs] = useState<string[]>([
    `[INFO] Initializing ROS 2 Humble node: ${ROS_CONFIG.NODE_NAME}`,
    `[INFO] YOLOv8 Model loaded: ${HARDWARE_CONFIG.SOFTWARE.YOLO_MODEL}`,
    `[INFO] ${HARDWARE_CONFIG.CAMERA.MODEL} connected. Preset: High Accuracy`,
    `[INFO] MoveIt 2 MoveGroupInterface initialized.`
  ]);

  const { connected, error, latency, subscribe } = useRos();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * @function clearMissionTimeouts
   * @description Clears all pending mission step timeouts.
   */
  const clearMissionTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => clearMissionTimeouts();
  }, [clearMissionTimeouts]);

  /**
   * @function handleSystemLogs
   * @description Simulates real-time ROS 2 log updates when the system is active.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (systemStatus !== SYSTEM_STATES.IDLE) {
        const newLog = `[DEBUG] TF Lookup: camera_optical_frame -> base_link (latency: 0.02ms)`;
        setLogs(prev => [newLog, ...prev].slice(0, 50));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [systemStatus]);

  /**
   * @function handleSystemLogs
   * @description Helper to add a new log entry to the system console.
   */
  const handleSystemLogs = useCallback((message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50));
  }, []);

  /**
   * @function startMissionCycle
   * @description Runs a single cycle of the pick-and-place mission and schedules the next if active.
   */
  const startMissionCycle = useCallback(() => {
    if (!isMissionActiveRef.current) return;

    handleSystemLogs("Starting Mission Cycle...");
    setSystemStatus(SYSTEM_STATES.NAV_TO_SHELF);
    setJointValues([45, -30, 90, 0, -45, 12]);
    
    const t1 = setTimeout(() => {
      if (!isMissionActiveRef.current) return;
      handleSystemLogs("[INFO] Navigation goal reached. Starting perception scan...");
      setSystemStatus(SYSTEM_STATES.SCAN_ITEMS);
      setJointValues([50, -20, 100, 5, -40, 20]); // Move to scan pose
    }, 2000);

    const t2 = setTimeout(() => {
      if (!isMissionActiveRef.current) return;
      handleSystemLogs("[INFO] SKU identified: shelf_item_v2. Calculating grasp pose...");
      setSystemStatus(SYSTEM_STATES.PICK_ITEM);
      setJointValues([65, -10, 120, 15, -25, 55]); // Move to pick pose
    }, 4000);

    const t3 = setTimeout(() => {
      if (!isMissionActiveRef.current) return;
      handleSystemLogs("[SUCCESS] Item successfully picked and placed.");
      setSystemStatus(SYSTEM_STATES.IDLE);
      setJointValues([45, -30, 90, 0, -45, 12]); // Return to home
      
      // Schedule next cycle
      const t4 = setTimeout(() => {
        if (isMissionActiveRef.current) {
          startMissionCycle();
        }
      }, 1500);
      timeoutsRef.current.push(t4);
    }, 7000);

    timeoutsRef.current = [t1, t2, t3];
  }, [handleSystemLogs]);

  /**
   * @function executeMission
   * @description Triggers or stops a simulated pick-and-place mission sequence.
   */
  const executeMission = useCallback(() => {
    if (isMissionActive) {
      // Stop mission
      isMissionActiveRef.current = false;
      setIsMissionActive(false);
      clearMissionTimeouts();
      setSystemStatus(SYSTEM_STATES.IDLE);
      setJointValues([45, -30, 90, 0, -45, 12]); // Reset to home
      handleSystemLogs("[ABORT] Mission stopped by user.");
      return;
    }

    // Start mission
    isMissionActiveRef.current = true;
    setIsMissionActive(true);
    startMissionCycle();
  }, [isMissionActive, startMissionCycle, clearMissionTimeouts, handleSystemLogs]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0B] text-zinc-300 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#0D0D0F] flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <span className="font-bold tracking-tight text-white">ROBOSTACK AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavigationItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavigationItem 
            icon={<Camera />} 
            label="Perception" 
            active={activeTab === 'perception'} 
            onClick={() => setActiveTab('perception')} 
          />
          <NavigationItem 
            icon={<Layers />} 
            label="Manipulation" 
            active={activeTab === 'manipulation'} 
            onClick={() => setActiveTab('manipulation')} 
          />
          <NavigationItem 
            icon={<Database />} 
            label="SKU Audit" 
            active={activeTab === 'audit'} 
            onClick={() => setActiveTab('audit')} 
          />
          <NavigationItem 
            icon={<Terminal />} 
            label="ROS 2 Logs" 
            active={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')} 
          />
        </nav>

        <div className="p-4 border-t border-white/5">
          <NavigationItem 
            icon={<Settings />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Global Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0D0D0F]/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border transition-colors",
              connected 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-red-500/10 border-red-500/20"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
              <span className={cn(
                "text-xs font-medium uppercase tracking-widest",
                connected ? "text-emerald-400" : "text-red-400"
              )}>
                {connected ? 'System Online' : 'System Offline'}
              </span>
            </div>
            <span className="text-zinc-600">/</span>
            <span className="text-sm font-mono text-zinc-400">Node: {ROS_CONFIG.NODE_NAME}</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={executeMission}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg",
                !isMissionActive 
                  ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20" 
                  : "bg-red-500 text-white hover:bg-red-400 shadow-red-500/20"
              )}
            >
              {!isMissionActive ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Execute Mission
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Mission
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-6">
              {/* State Machine Visualization */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="glass-panel p-6 relative overflow-hidden">
                  <div className="scanline" />
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">State Machine</h3>
                      <p className="text-2xl font-mono text-white tracking-tighter">{systemStatus}</p>
                    </div>
                    <Activity className="text-cyan-500/50 w-6 h-6" />
                  </div>

                  <div className="flex items-center justify-between relative">
                    <div className="absolute h-0.5 bg-zinc-800 left-0 right-0 top-1/2 -translate-y-1/2 -z-10" />
                    <StateStep label="IDLE" active={systemStatus === SYSTEM_STATES.IDLE} completed={systemStatus !== SYSTEM_STATES.IDLE} />
                    <StateStep label="NAV" active={systemStatus === SYSTEM_STATES.NAV_TO_SHELF} completed={[SYSTEM_STATES.SCAN_ITEMS, SYSTEM_STATES.PICK_ITEM].includes(systemStatus)} />
                    <StateStep label="SCAN" active={systemStatus === SYSTEM_STATES.SCAN_ITEMS} completed={[SYSTEM_STATES.PICK_ITEM].includes(systemStatus)} />
                    <StateStep label="PICK" active={systemStatus === SYSTEM_STATES.PICK_ITEM} completed={false} />
                  </div>
                </div>

                {/* Performance Telemetry */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-panel p-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Manipulator Torque (Nm)</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TELEMETRY_DATA}>
                          <defs>
                            <linearGradient id="colorTorque" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="torque" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTorque)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="glass-panel p-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Base Velocity (m/s)</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TELEMETRY_DATA}>
                          <Line type="monotone" dataKey="velocity" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <Telemetry />
              </div>

              {/* System Health Monitor */}
              <div className="col-span-12 lg:col-span-4">
                <HealthMonitor 
                  rosConnected={connected}
                  hardwareStatus={[
                    { label: HARDWARE_CONFIG.CAMERA.MODEL, status: 'Optimal', type: 'perception' },
                    { label: HARDWARE_CONFIG.ARM.CONTROLLER, status: 'Optimal', type: 'manipulation' },
                    { label: 'Nav2 Navigation Stack', status: 'Standby', type: 'navigation' },
                    { label: 'YOLOv8 Inference Engine', status: 'Active', type: 'compute' }
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'perception' && (
            <div className="space-y-6">
              <div className="glass-panel aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/warehouse/1280/720')] bg-cover bg-center opacity-40 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                {/* Simulated Object Detection Overlays */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute border-2 border-cyan-500 w-32 h-40 left-1/3 top-1/4"
                >
                  <span className="absolute -top-6 left-0 bg-cyan-500 text-black text-[10px] font-bold px-1 uppercase">SKU-1042: 98%</span>
                </motion.div>

                <div className="absolute bottom-8 left-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono text-white">LIVE FEED: {HARDWARE_CONFIG.CAMERA.DEPTH_TOPIC}</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">
                    RES: {HARDWARE_CONFIG.CAMERA.RESOLUTION} | FPS: {HARDWARE_CONFIG.CAMERA.FPS} | FOV: {HARDWARE_CONFIG.CAMERA.FOV}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <DataCard label="Target Centroid (m)" value="X: 0.42 Y: -0.12 Z: 0.85" />
                <DataCard label="Inference Latency" value="12.4 ms" />
                <DataCard label="Point Cloud Filter" value="ROI: 0.5m³" />
              </div>
            </div>
          )}

          {activeTab === 'manipulation' && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">MoveGroup: {ROS_CONFIG.PLANNING_GROUPS.ARM}</h3>
                    <span className="text-[10px] font-mono text-cyan-400">PLANNING_FRAME: {HARDWARE_CONFIG.ARM.PLANNING_FRAME}</span>
                  </div>
                  
                  <div className="space-y-6">
                    <JointSlider label="Joint 1 (Base)" value={jointValues[0]} min={-180} max={180} />
                    <JointSlider label="Joint 2 (Shoulder)" value={jointValues[1]} min={-90} max={90} />
                    <JointSlider label="Joint 3 (Elbow)" value={jointValues[2]} min={-150} max={150} />
                    <JointSlider label="Joint 4 (Wrist 1)" value={jointValues[3]} min={-180} max={180} />
                    <JointSlider label="Joint 5 (Wrist 2)" value={jointValues[4]} min={-180} max={180} />
                    <JointSlider label="Joint 6 (Wrist 3)" value={jointValues[5]} min={-360} max={360} />
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Trajectory Execution</h3>
                  <div className="space-y-3">
                    <ExecutionStep 
                      label="Pre-Grasp Approach" 
                      status={systemStatus === SYSTEM_STATES.NAV_TO_SHELF ? 'In Progress' : (systemStatus === SYSTEM_STATES.IDLE ? 'Pending' : 'Completed')} 
                    />
                    <ExecutionStep 
                      label="Linear SKU Alignment" 
                      status={systemStatus === SYSTEM_STATES.SCAN_ITEMS ? 'In Progress' : ([SYSTEM_STATES.PICK_ITEM].includes(systemStatus) ? 'Completed' : 'Pending')} 
                    />
                    <ExecutionStep 
                      label="Gripper Actuation" 
                      status={systemStatus === SYSTEM_STATES.PICK_ITEM ? 'In Progress' : 'Pending'} 
                    />
                    <ExecutionStep 
                      label="Retreat to Home" 
                      status="Pending" 
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 space-y-6">
                <div className="glass-panel p-6 bg-cyan-500/5 border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Box className="text-cyan-400 w-5 h-5" />
                    <h3 className="text-sm font-bold text-cyan-400">Planning Scene</h3>
                  </div>
                  <div className="aspect-square rounded-lg bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <RobotArmVisual jointValues={jointValues} />
                    <div className="absolute top-4 right-4 text-[8px] font-mono text-zinc-500 uppercase">
                      Collision Object: shelf_v1
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Constraints</h3>
                  <div className="space-y-4">
                    <ConstraintSlider label="Velocity Scaling" value={0.50} />
                    <ConstraintSlider label="Acceleration Scaling" value={0.30} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SKU ID</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Success Rate</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg. Cycle (s)</th>
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SKU_PERFORMANCE.map(sku => (
                    <tr key={sku.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-sm text-cyan-400">{sku.id}</td>
                      <td className="p-4 text-sm text-white">{sku.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${sku.successRate}%` }} />
                          </div>
                          <span className="text-xs font-mono">{sku.successRate}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono">{sku.avgTime}</td>
                      <td className="p-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                          sku.status === 'Stable' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        )}>
                          {sku.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="glass-panel bg-black p-6 font-mono text-xs space-y-1 h-[600px] overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={cn(
                  "flex gap-4",
                  log.includes('[ERROR]') ? "text-red-400" : 
                  log.includes('[DEBUG]') ? "text-zinc-600" : "text-zinc-400"
                )}>
                  <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

/**
 * @component NavigationItem
 * @description Sidebar navigation button component.
 */
function NavigationItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-xl transition-all group",
        active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "hover:bg-white/5 text-zinc-500"
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );
}

/**
 * @component StateStep
 * @description Visual indicator for a step in the robot's state machine.
 */
function StateStep({ label, active, completed }: { label: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 relative">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
        completed ? "bg-cyan-500 border-cyan-500 text-black" : 
        active ? "bg-[#0D0D0F] border-cyan-500 text-cyan-400 neon-glow" : 
        "bg-[#0D0D0F] border-zinc-800 text-zinc-700"
      )}>
        {completed ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-xs font-bold font-mono">{label[0]}</span>}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest",
        active ? "text-cyan-400" : "text-zinc-600"
      )}>{label}</span>
    </div>
  );
}

/**
 * @component JointSlider
 * @description Visualization for a single robotic joint's position.
 */
function JointSlider({ label, value, min, max }: { label: string, value: number, min: number, max: number }) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-medium text-zinc-400">{label}</span>
        <motion.span 
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-mono text-white"
        >
          {value}°
        </motion.span>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          className="h-full bg-cyan-500/50 relative" 
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * @component ExecutionStep
 * @description Status indicator for a trajectory execution phase.
 */
function ExecutionStep({ label, status }: { label: string, status: 'Completed' | 'In Progress' | 'Pending' }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === 'Completed' ? "bg-emerald-500" : 
          status === 'In Progress' ? "bg-cyan-500 animate-pulse" : "bg-zinc-800"
        )} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-tighter",
        status === 'Completed' ? "text-emerald-500" : 
        status === 'In Progress' ? "text-cyan-400" : "text-zinc-600"
      )}>{status}</span>
    </div>
  );
}

/**
 * @component DataCard
 * @description Simple card for displaying key-value data.
 */
function DataCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="glass-panel p-4">
      <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">{label}</h4>
      <p className="text-xl font-mono text-white">{value}</p>
    </div>
  );
}

/**
 * @component ConstraintSlider
 * @description Visualization for planning constraints.
 */
function ConstraintSlider({ label, value }: { label: string, value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-zinc-500">{label}</span>
        <span className="text-white">{value.toFixed(2)}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-500" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}
