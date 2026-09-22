import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import AlarmBanner from './components/AlarmBanner';
import SpatialMineGrid from './components/SpatialMineGrid';
import TelemetryPanels from './components/TelemetryPanels';
import SimulationControls from './components/SimulationControls';
import EventLog from './components/EventLog';
import Earth3DExplorer from './components/Earth3DExplorer';
import SensorDeepDiveHub from './components/SensorDeepDiveHub';
import DgmsReportModal from './components/DgmsReportModal';
import ThemeCustomizerModal from './components/ThemeCustomizerModal';

// Dedicated Sensor & Analytics Sections
import TemperatureSection from './components/TemperatureSection';
import MoistureSection from './components/MoistureSection';
import VibrationSection from './components/VibrationSection';
import CrackSection from './components/CrackSection';
import GasSection from './components/GasSection';
import SensorLocationsSection from './components/SensorLocationsSection';
import CameraSection from './components/CameraSection';
import Strata3DVisualizer from './components/Strata3DVisualizer';
import Sensor3DModel from './components/Sensor3DModel';
import InnovationSection from './components/InnovationSection';
import SettingsSection from './components/SettingsSection';
import SensorDiagnosticsSection from './components/SensorDiagnosticsSection';
import CyberBackground from './components/CyberBackground';
import UserAccessLogSection from './components/UserAccessLogSection';

import { 
  LayoutDashboard, 
  Thermometer, 
  Droplets, 
  Activity, 
  Ruler, 
  Wind, 
  MapPin, 
  Camera, 
  Settings, 
  Cpu, 
  Sparkles, 
  Gauge, 
  Globe,
  Users
} from 'lucide-react';

import { 
  INITIAL_NODES, 
  calculateCMSI, 
  evaluateNodeStatus, 
  generateInitialChartHistory,
  DGMS_THRESHOLDS 
} from './utils/mockDataStream';
import { sirenEngine } from './utils/audioSiren';
import { generateDGMSReport } from './utils/dgmsReportGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [themeMode, setThemeMode] = useState('dark');
  const [currentUser, setCurrentUser] = useState({
    id: 'USR-CHIEF-01',
    name: 'Aman Kumar (Chief Officer)',
    role: 'admin',
    email: 'Chief Safety Officer'
  });

  function handleLogout() {
    // Reset to default session
    setActiveTab('overview');
  }

  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [historyData, setHistoryData] = useState(generateInitialChartHistory());
  const [selectedNodeId, setSelectedNodeId] = useState('NODE-01');
  const [dashboardTheme, setDashboardTheme] = useState('cyber');
  const [fontTheme, setFontTheme] = useState('inter');
  const [effect3DTheme, setEffect3DTheme] = useState('sensor-sync');
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [isSimStreamActive, setIsSimStreamActive] = useState(true);
  const activeSelectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [currentShift, setCurrentShift] = useState('Shift-A');
  const [activeMiners, setActiveMiners] = useState(48);
  const [isDgmsModalOpen, setIsDgmsModalOpen] = useState(false);
  const [thresholds, setThresholds] = useState({ ...DGMS_THRESHOLDS });
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialToast, setSerialToast] = useState(null);

  useEffect(() => {
    if (serialToast) {
      const timer = setTimeout(() => setSerialToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [serialToast]);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);

  async function handleDisconnectSerial(isUnplugged = false) {
    keepReadingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
    } catch (e) {}
    try {
      if (portRef.current) {
        await portRef.current.close();
      }
    } catch (e) {}
    portRef.current = null;
    readerRef.current = null;
    setSerialConnected(false);
    setIsSimStreamActive(true);
    setSerialToast({
      type: 'info',
      title: isUnplugged ? 'Hardware Unplugged' : 'Hardware Disconnected',
      message: isUnplugged 
        ? 'USB cable disconnected. Switched to digital twin baseline.' 
        : 'Disconnected from hardware gateway.'
    });
  }

  // OS Hotplug USB event listeners
  useEffect(() => {
    if (!('serial' in navigator)) return;

    const onDisconnect = () => {
      handleDisconnectSerial(true);
    };

    navigator.serial.addEventListener('disconnect', onDisconnect);
    return () => {
      navigator.serial.removeEventListener('disconnect', onDisconnect);
    };
  }, []);

  async function handleConnectSerial() {
    if (serialConnected) {
      await handleDisconnectSerial(false);
      return;
    }

    if (!('serial' in navigator)) {
      setSerialToast({
        type: 'error',
        title: 'Browser Unsupported',
        message: 'WebSerial API is supported in Google Chrome, Microsoft Edge, and Opera!'
      });
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      keepReadingRef.current = true;
      setSerialConnected(true);
      setIsSimStreamActive(false);
      setSerialToast({
        type: 'success',
        title: 'Hardware Connected!',
        message: 'ESP32 MPU-6050 live telemetry synchronized at 115200 baud.'
      });
      logEvent('normal', 'USB', 'ESP32 Hardware Node connected via WebSerial (115200 baud)');

      const decoder = new TextDecoder();
      let lineBuffer = '';

      while (port.readable && keepReadingRef.current) {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              lineBuffer += decoder.decode(value, { stream: true });
              const lines = lineBuffer.split(/\r?\n/);
              lineBuffer = lines.pop();

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                const startIdx = trimmed.indexOf('{');
                const endIdx = trimmed.lastIndexOf('}');
                if (startIdx !== -1 && endIdx > startIdx) {
                  try {
                    const jsonStr = trimmed.substring(startIdx, endIdx + 1);
                    const data = JSON.parse(jsonStr);
                    handleHardwareTelemetry(data);
                  } catch (e) {}
                }
              }
            }
          }
        } catch (readErr) {
          console.warn('Serial stream stopped:', readErr);
          break;
        } finally {
          try {
            reader.releaseLock();
          } catch (e) {}
          readerRef.current = null;
        }
      }

      if (keepReadingRef.current) {
        await handleDisconnectSerial(true);
      }
    } catch (err) {
      console.error('Serial port error:', err);
      await handleDisconnectSerial(false);
      if (err.name !== 'NotFoundError') {
        let msg = err.message;
        if (err.message && (err.message.includes('Failed to open') || err.name === 'NetworkError')) {
          msg = 'Port is busy! Please CLOSE the Serial Monitor in Arduino IDE (Ctrl+Shift+M), then click Connect again.';
        }
        setSerialToast({
          type: 'error',
          title: 'Serial Port Notice',
          message: msg
        });
      }
    }
  }

  function handleHardwareTelemetry(data) {
    const NODE_PROPAGATION = {
      'NODE-01': { tiltMul: 1.00, vibMul: 1.00, crackMul: 1.00, tempOff: 0.0 },
      'NODE-02': { tiltMul: 0.88, vibMul: 0.85, crackMul: 0.82, tempOff: -0.8 },
      'NODE-03': { tiltMul: 1.08, vibMul: 0.98, crackMul: 1.04, tempOff: +1.2 },
      'NODE-04': { tiltMul: 0.78, vibMul: 0.75, crackMul: 0.72, tempOff: -1.4 },
      'NODE-05': { tiltMul: 0.82, vibMul: 0.80, crackMul: 0.79, tempOff: -0.5 },
      'NODE-06': { tiltMul: 0.65, vibMul: 0.60, crackMul: 0.58, tempOff: -2.1 },
    };

    const baseTilt = typeof data.tilt === 'number' ? data.tilt : 0.0;
    const basePitch = typeof data.pitch === 'number' ? data.pitch : (typeof data.tiltX === 'number' ? data.tiltX : baseTilt);
    const baseRoll = typeof data.roll === 'number' ? data.roll : (typeof data.tiltY === 'number' ? data.tiltY : +(baseTilt * 0.5).toFixed(2));
    const baseVib = typeof data.vibration === 'number' ? data.vibration : 0.01;
    const baseCrack = typeof data.crack === 'number' ? data.crack : 0.0;
    const rawTemp = typeof data.temp === 'number' ? data.temp : 26.5;
    const baseTemp = +(rawTemp > 40 ? rawTemp - 19.5 : rawTemp).toFixed(1);

    setNodes(prevNodes => prevNodes.map(n => {
      const prop = NODE_PROPAGATION[n.id] || { tiltMul: 1.0, vibMul: 1.0, crackMul: 1.0, tempOff: 0 };
      const nodePitch = +(basePitch * prop.tiltMul).toFixed(2);
      const nodeRoll = +(baseRoll * prop.tiltMul).toFixed(2);
      const nodeTilt = +(Math.sqrt(nodePitch * nodePitch + nodeRoll * nodeRoll)).toFixed(2);
      const nodeVib = +(baseVib * prop.vibMul).toFixed(2);
      const nodeCrack = +(baseCrack * prop.crackMul).toFixed(2);
      const nodeTemp = +(baseTemp + prop.tempOff).toFixed(1);

      const nodeStatus = (
        nodeTilt >= DGMS_THRESHOLDS.TILT_CRITICAL || 
        nodeCrack >= DGMS_THRESHOLDS.CRACK_CRITICAL || 
        nodeVib >= DGMS_THRESHOLDS.VIBRATION_CRITICAL
      ) ? 'critical' : (
        nodeTilt >= DGMS_THRESHOLDS.TILT_ADVISORY || 
        nodeCrack >= DGMS_THRESHOLDS.CRACK_ADVISORY || 
        nodeVib >= DGMS_THRESHOLDS.VIBRATION_ADVISORY
      ) ? 'advisory' : 'normal';

      return {
        ...n,
        tiltX: nodePitch,
        tiltY: nodeRoll,
        vibrationG: nodeVib,
        crackDisplacement: nodeCrack,
        temperature: nodeTemp,
        status: nodeStatus,
        lastSeen: 'Live Hardware'
      };
    }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistoryData(prev => [
      ...prev.slice(1),
      {
        time: timeStr,
        tilt: +(baseTilt).toFixed(2),
        vibration: +(baseVib).toFixed(2),
        crack: +(baseCrack).toFixed(2),
        temp: +(baseTemp).toFixed(1),
        freq: 14.2,
        ch4: 0.22,
        co: 6.5
      }
    ]);
  }

  const [events, setEvents] = useState([
    {
      id: 'EVT-101',
      time: '09:15:20',
      nodeId: 'NODE-01',
      severity: 'normal',
      message: 'Node synchronized over LoRa 868MHz mesh (RSSI: -72 dBm)',
      signature: '0x9E4F...A102'
    },
    {
      id: 'EVT-102',
      time: '09:18:45',
      nodeId: 'NODE-03',
      severity: 'advisory',
      message: 'Micro-seismic acoustic activity recorded (0.18g peak acc)',
      signature: '0x3C8B...F944'
    },
    {
      id: 'EVT-103',
      time: '09:22:10',
      nodeId: 'NODE-06',
      severity: 'normal',
      message: 'Surface reference benchmark zeroed and locked',
      signature: '0x7D11...E328'
    }
  ]);

  // Overall calculations
  const cmsi = calculateCMSI(nodes);
  
  // Calculate max metrics across all nodes
  let maxTilt = 0;
  let maxCrack = 0;
  let maxCH4 = 0;
  let maxCO = 0;
  let maxVibration = 0;
  let maxMoisture = 0;
  let maxTemp = 0;

  // In hardware mode, evaluate exclusively NODE-01 (the physical device)
  const activeNodesForStatus = serialConnected
    ? nodes.filter(n => n.id === 'NODE-01')
    : nodes;

  activeNodesForStatus.forEach(n => {
    const totalTilt = Math.sqrt(n.tiltX * n.tiltX + n.tiltY * n.tiltY);
    if (totalTilt > maxTilt) maxTilt = totalTilt;
    if (n.crackDisplacement > maxCrack) maxCrack = n.crackDisplacement;
    if (n.ch4 > maxCH4) maxCH4 = n.ch4;
    if (n.co > maxCO) maxCO = n.co;
    if ((n.vibrationG || 0.05) > maxVibration) maxVibration = n.vibrationG || 0.05;
    if ((n.moisture || 40) > maxMoisture) maxMoisture = n.moisture || 40;
    if ((n.temperature || 28) > maxTemp) maxTemp = n.temperature || 28;
  });

  const overallStatus = 
    maxTilt >= DGMS_THRESHOLDS.TILT_CRITICAL || 
    maxCrack >= DGMS_THRESHOLDS.CRACK_CRITICAL || 
    maxVibration >= DGMS_THRESHOLDS.VIBRATION_CRITICAL ||
    (!serialConnected && (
      maxCH4 >= DGMS_THRESHOLDS.CH4_POWER_TRIP || 
      maxCO >= DGMS_THRESHOLDS.CO_CRITICAL ||
      maxMoisture >= DGMS_THRESHOLDS.MOISTURE_CRITICAL ||
      maxTemp >= 48.0
    ))
      ? 'critical'
      : maxTilt >= DGMS_THRESHOLDS.TILT_ADVISORY || 
        maxCrack >= DGMS_THRESHOLDS.CRACK_ADVISORY || 
        maxVibration >= DGMS_THRESHOLDS.VIBRATION_ADVISORY
      ? 'advisory'
      : 'normal';

  // Automated siren trigger: starts on critical, and AUTOMATICALLY stops as soon as normal/advisory
  useEffect(() => {
    if (overallStatus === 'critical') {
      if (!isSirenActive) {
        sirenEngine.startSiren();
        setIsSirenActive(true);
        logEvent('critical', 'NODE-01', 'CRITICAL STRATA RUPTURE DETECTED - AUTOMATED EVACUATION ENGAGED');
      }
    } else {
      // Auto-silence whenever readings return to safe/advisory
      if (isSirenActive) {
        sirenEngine.stopSiren();
        setIsSirenActive(false);
        logEvent('normal', 'SYS', 'Working strata stabilized - Emergency siren silenced automatically.');
      }
    }
  }, [overallStatus, isSirenActive]);

  function logEvent(severity, nodeId, message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const newEvt = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      time: timeStr,
      nodeId,
      severity: severity.toLowerCase(),
      message,
      signature: `0x${randomHex}...${Date.now().toString().slice(-4)}`
    };
    setEvents(prev => [newEvt, ...prev.slice(0, 49)]);
  }

  // Periodic subtle jitter / streaming data tick (Continuous Digital Twin stream)
  useEffect(() => {
    if (!isSimStreamActive) return;

    const interval = setInterval(() => {
      setHistoryData(prevHistory => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const newPoint = {
          time: timeStr,
          tilt: +(maxTilt + (Math.random() * 0.08 - 0.04)).toFixed(2),
          vibration: +(maxVibration + (Math.random() * 0.02 - 0.01)).toFixed(2),
          crack: +(maxCrack + (Math.random() * 0.04 - 0.02)).toFixed(2),
          temp: +(maxTemp + (Math.random() * 0.2 - 0.1)).toFixed(1),
          freq: +(12.0 + (Math.random() * 2.0 - 1.0)).toFixed(1),
          ch4: +(maxCH4 + (Math.random() * 0.02 - 0.01)).toFixed(2),
          co: +(maxCO + (Math.random() * 0.4 - 0.2)).toFixed(1)
        };
        return [...prevHistory.slice(1), newPoint];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [maxTilt, maxCrack, maxCH4, maxCO, isSimStreamActive]);

  // Siren toggle handler
  function handleToggleSiren() {
    if (isSirenActive) {
      sirenEngine.stopSiren();
      setIsSirenActive(false);
      logEvent('normal', 'OPERATOR', 'Emergency siren manually silenced by safety operator.');
    } else {
      sirenEngine.startSiren();
      setIsSirenActive(true);
      logEvent('critical', 'OPERATOR', 'Manual acoustic siren test activated from command console.');
    }
  }

  // Quick scenario triggers for demo
  function handleTriggerScenario(scenario) {
    const NODE_PROP = {
      'NODE-01': { tiltMul: 1.00, vibMul: 1.00, crackMul: 1.00 },
      'NODE-02': { tiltMul: 0.88, vibMul: 0.85, crackMul: 0.82 },
      'NODE-03': { tiltMul: 1.08, vibMul: 0.98, crackMul: 1.04 },
      'NODE-04': { tiltMul: 0.78, vibMul: 0.75, crackMul: 0.72 },
      'NODE-05': { tiltMul: 0.82, vibMul: 0.80, crackMul: 0.79 },
      'NODE-06': { tiltMul: 0.65, vibMul: 0.60, crackMul: 0.58 },
    };

    if (scenario === 'normal') {
      setNodes(INITIAL_NODES.map(n => ({ ...n, status: 'normal' })));
      logEvent('normal', 'ALL', 'Reset all nodes to normal operational baseline.');
    } else if (scenario === 'advisory') {
      setNodes(prev => prev.map(n => {
        const p = NODE_PROP[n.id] || { tiltMul: 1, vibMul: 1, crackMul: 1 };
        return {
          ...n,
          tiltX: +(2.8 * p.tiltMul).toFixed(2),
          tiltY: +(2.0 * p.tiltMul).toFixed(2),
          crackDisplacement: +(1.8 * p.crackMul).toFixed(2),
          vibrationG: +(0.16 * p.vibMul).toFixed(2),
          status: 'advisory'
        };
      }));
      logEvent('advisory', 'ALL', 'Sand-tray tilt simulation active: Seam tilt ~3.44° (Exceeds 2.5° limit across seam).');
    } else if (scenario === 'critical') {
      setNodes(prev => prev.map(n => {
        const p = NODE_PROP[n.id] || { tiltMul: 1, vibMul: 1, crackMul: 1 };
        return {
          ...n,
          tiltX: +(4.8 * p.tiltMul).toFixed(2),
          tiltY: +(3.5 * p.tiltMul).toFixed(2),
          crackDisplacement: +(4.2 * p.crackMul).toFixed(2),
          vibrationG: +(0.72 * p.vibMul).toFixed(2),
          status: 'critical'
        };
      }));
      logEvent('critical', 'ALL', 'Sudden strata collapse simulation active: Angle ~5.94° & Crack ~4.2mm!');
    } else if (scenario === 'gas') {
      setNodes(prev => prev.map(n => {
        const p = NODE_PROP[n.id] || { tiltMul: 1, vibMul: 1, crackMul: 1 };
        return {
          ...n,
          ch4: +(1.45 * p.tiltMul).toFixed(2),
          co: +(42.0 * p.tiltMul).toFixed(1),
          status: 'critical'
        };
      }));
      logEvent('critical', 'ALL', 'Gas strata fissure simulation: CH4 1.45% (Interlock Power Trip Limit Breached).');
    }
  }

  // Manual slider modification
  function handleManualSliderChange(nodeId, param, value) {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        let updated = { ...n };
        if (param === 'tilt') {
          updated.tiltX = +(value * 0.8).toFixed(2);
          updated.tiltY = +(value * 0.6).toFixed(2);
        } else if (param === 'crack') {
          updated.crackDisplacement = +value.toFixed(2);
        } else if (param === 'ch4') {
          updated.ch4 = +value.toFixed(2);
        }
        updated.status = evaluateNodeStatus(updated);
        return updated;
      }
      return n;
    }));
  }

  // Tremor injection from Vibration section
  function handleInjectTremor(nodeId, gVal) {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, vibrationG: gVal } : n));
    if (gVal >= 0.3) {
      logEvent('critical', nodeId, `Simulated seismic micro-tremor: Resultant peak ${gVal}g`);
    }
  }

  // PDF Export
  function handleDirectPdfExport() {
    generateDGMSReport({
      nodes,
      cmsi,
      status: overallStatus,
      activeMiners,
      shiftName: currentShift
    });
    logEvent('normal', 'SYSTEM', `Statutory DGMS Shift Audit Report PDF exported for ${currentShift}.`);
  }

  const isAdmin = currentUser?.role === 'admin';

  // Base navigation tabs accessible to all verified mine safety inspectors
  const baseTabs = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'earth3d', label: '3D Earth & Subsidence Depth', icon: Globe },
    { id: 'sensorhub', label: 'Sensor Deep-Dive & Health', icon: Cpu },
    { id: 'temperature', label: 'Temperature & Heat', icon: Thermometer },
    { id: 'moisture', label: 'Moisture & Water Sump', icon: Droplets },
    { id: 'vibration', label: 'Seismic Vibration & Waves', icon: Activity },
    { id: 'cracks', label: 'Strata Fissures & Cracks', icon: Ruler },
    { id: 'gas', label: 'Gas Safety (CH4/CO)', icon: Wind },
    { id: 'sensor3d', label: '3D Hardware Twin', icon: Gauge },
    { id: 'locations', label: 'Sensor Locations', icon: MapPin },
    { id: 'cameras', label: 'Surveillance & Fog CAMs', icon: Camera },
    { id: 'innovation', label: 'Why Green ThinkerX Wins', icon: Sparkles },
  ];

  // Restricted admin tabs (Visible ONLY to Owner / Master Admin Aman Kumar)
  const adminTabs = [
    { id: 'users', label: '👑 Visitor & User Logins', icon: Users },
    { id: 'settings', label: '👑 Hardware & Settings', icon: Settings },
  ];

  const navTabs = isAdmin ? [...baseTabs, ...adminTabs] : baseTabs;

  // Security guard: redirect if non-admin attempts to view restricted tabs
  useEffect(() => {
    if (!isAdmin && (activeTab === 'users' || activeTab === 'settings')) {
      setActiveTab('overview');
    }
  }, [isAdmin, activeTab]);

  const fontClass = fontTheme === 'mono' 
    ? 'font-theme-mono'
    : fontTheme === 'orbitron'
    ? 'font-theme-orbitron'
    : fontTheme === 'roboto'
    ? 'font-theme-roboto'
    : fontTheme === 'space'
    ? 'font-theme-space'
    : 'font-theme-inter';

  return (
    <div className={`min-h-screen ${
      themeMode === 'light' 
        ? 'bg-slate-200 text-slate-900' 
        : dashboardTheme === 'amber'
        ? 'bg-[#180f08] text-amber-100'
        : dashboardTheme === 'emerald'
        ? 'bg-[#05170f] text-emerald-100'
        : dashboardTheme === 'midnight'
        ? 'bg-[#000000] text-slate-100'
        : dashboardTheme === 'titanium'
        ? 'bg-[#11161f] text-slate-100'
        : 'bg-[#090f1f] text-slate-100'
    } flex flex-col ${fontClass} relative transition-colors duration-500 ${
      overallStatus === 'critical' ? 'ring-8 ring-inset ring-red-600/40' : ''
    }`}>
      
      {/* Animated Subterranean Particle Cyber Background */}
      {themeMode === 'dark' && <CyberBackground />}
      
      {/* Top Header with Brand, CMSI Radial Meter, User Profile & Logout */}
      <Header
        cmsi={cmsi}
        status={overallStatus}
        activeMiners={activeMiners}
        isSirenActive={isSirenActive}
        onToggleSiren={handleToggleSiren}
        onExportReport={() => setIsDgmsModalOpen(true)}
        currentShift={currentShift}
        onChangeShift={setCurrentShift}
        currentUser={currentUser}
        onLogout={handleLogout}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
        dashboardTheme={dashboardTheme}
        onSelectTheme={setDashboardTheme}
        fontTheme={fontTheme}
        onSelectFontTheme={setFontTheme}
        effect3DTheme={effect3DTheme}
        onSelect3DEffectTheme={setEffect3DTheme}
        onOpenCustomizer={() => setIsThemeCustomizerOpen(true)}
        serialConnected={serialConnected}
        onConnectSerial={handleConnectSerial}
        onNavigateHome={() => setActiveTab('overview')}
      />

      {/* Floating Hardware Status Toast */}
      {serialToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce-in shadow-2xl">
          <div className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 ${
            serialToast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-emerald-950/50' 
              : serialToast.type === 'error'
              ? 'bg-red-950/90 border-red-500/80 text-red-100 shadow-red-950/50'
              : 'bg-slate-900/90 border-cyan-500/80 text-cyan-100 shadow-cyan-950/50'
          }`}>
            <div className="flex-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">{serialToast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{serialToast.message}</p>
            </div>
            <button 
              onClick={() => setSerialToast(null)} 
              className="text-xs opacity-60 hover:opacity-100 font-black cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tri-State Alarm Banner */}
      <div className="relative z-10">
        <AlarmBanner
          status={overallStatus}
          maxTilt={maxTilt}
          maxCrack={maxCrack}
          maxCH4={maxCH4}
          maxCO={maxCO}
        />
      </div>

      {/* Modern High-Contrast Navigation Tab Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/90 sticky top-[76px] z-30 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-3">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/60 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area based on Selected Tab */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Industrial 3-Light Mine Safety Indicator Bar */}
            <div className="bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-black/80 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
                  {/* Red Light */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      overallStatus === 'critical'
                        ? 'bg-red-500 border-red-200 shadow-[0_0_22px_rgba(239,68,68,1)] animate-pulse ring-4 ring-red-500/50 scale-110'
                        : 'bg-red-950/40 border-red-900/50 opacity-25'
                    }`} />
                    <span className={`text-xs font-mono font-black ${overallStatus === 'critical' ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                      RED (DANGER)
                    </span>
                  </div>

                  <div className="w-[1px] h-6 bg-slate-700 mx-1" />

                  {/* Yellow Light */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      overallStatus === 'advisory'
                        ? 'bg-amber-400 border-amber-100 shadow-[0_0_22px_rgba(245,158,11,1)] animate-pulse ring-4 ring-amber-400/50 scale-110'
                        : 'bg-amber-950/40 border-amber-900/50 opacity-25'
                    }`} />
                    <span className={`text-xs font-mono font-black ${overallStatus === 'advisory' ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                      YELLOW (ADVISORY)
                    </span>
                  </div>

                  <div className="w-[1px] h-6 bg-slate-700 mx-1" />

                  {/* Green Light */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      overallStatus === 'normal'
                        ? 'bg-emerald-400 border-emerald-100 shadow-[0_0_22px_rgba(16,185,129,1)] ring-4 ring-emerald-400/50 scale-110'
                        : 'bg-emerald-950/40 border-emerald-900/50 opacity-25'
                    }`} />
                    <span className={`text-xs font-mono font-black ${overallStatus === 'normal' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      GREEN (SAFE)
                    </span>
                  </div>
                </div>

                <div className="leading-tight">
                  <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">
                    DGMS STATUTORY SAFETY LEVEL
                  </span>
                  <span className={`text-sm font-black font-mono tracking-wide ${
                    overallStatus === 'critical' ? 'text-red-400 animate-pulse' : overallStatus === 'advisory' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {overallStatus === 'critical' 
                      ? '🔴 CRITICAL HAZARD: STRATA RUPTURE / ROOF FALL DANGER — EVACUATE' 
                      : overallStatus === 'advisory' 
                      ? '🟡 ADVISORY STRAIN: MONITOR SHEAR DISPLACEMENT & TILT' 
                      : '🟢 ALL CLEAR: STRATA HOMOGENEOUS & FULLY SECURE'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  REAL-TIME DIGITAL TWIN ACTIVE
                </span>
              </div>
            </div>
            
            {/* Top Row: 2D Spatial Mine Grid + 3D Geological Strata Model */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 min-h-[460px]">
                <SpatialMineGrid
                  nodes={nodes}
                  onSelectNode={(node) => {
                    setSelectedNodeId(node.id);
                    setActiveTab('sensorhub');
                  }}
                  selectedNodeId={selectedNodeId}
                />
              </div>

              <div className="lg:col-span-5 min-h-[460px]">
                <Strata3DVisualizer
                  maxTilt={maxTilt}
                  maxCrack={maxCrack}
                />
              </div>
            </div>

            {/* Middle Row: Full-Width Multi-Parametric Telemetry Arrays (All 6 Separated Graphs) */}
            <div className="w-full">
              <TelemetryPanels
                historyData={historyData}
                status={overallStatus}
                isSimStreamActive={isSimStreamActive}
                onToggleSimStream={() => setIsSimStreamActive(prev => !prev)}
              />
            </div>

            {/* Bottom Row: Simulation Controls + Event Audit Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <SimulationControls
                  nodes={nodes}
                  onTriggerScenario={handleTriggerScenario}
                  onManualSliderChange={handleManualSliderChange}
                />
              </div>

              <div className="lg:col-span-5">
                <EventLog events={events} />
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 3D SUBTERRANEAN EARTH & SUBSIDENCE DEPTH */}
        {activeTab === 'earth3d' && (
          <Earth3DExplorer
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
            maxTilt={maxTilt}
            maxCrack={maxCrack}
            maxVibration={maxVibration}
            effect3DTheme={effect3DTheme}
          />
        )}

        {/* TAB 3: DEDICATED SENSOR DEEP-DIVE & HEALTH HUB */}
        {activeTab === 'sensorhub' && (
          <SensorDeepDiveHub
            selectedNode={activeSelectedNode}
            allNodes={nodes}
            onSelectNodeId={setSelectedNodeId}
            onBackToOverview={() => setActiveTab('overview')}
          />
        )}

        {/* TAB 2: TEMPERATURE */}
        {activeTab === 'temperature' && (
          <TemperatureSection
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
          />
        )}

        {/* TAB 3: MOISTURE */}
        {activeTab === 'moisture' && (
          <MoistureSection
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
          />
        )}

        {/* TAB 4: VIBRATION */}
        {activeTab === 'vibration' && (
          <VibrationSection
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
            onInjectTremor={handleInjectTremor}
          />
        )}

        {/* TAB 5: CRACKS */}
        {activeTab === 'cracks' && (
          <CrackSection
            nodes={nodes}
            maxCrack={maxCrack}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
          />
        )}

        {/* TAB 6: GAS */}
        {activeTab === 'gas' && (
          <GasSection
            nodes={nodes}
            maxCH4={maxCH4}
            maxCO={maxCO}
          />
        )}

        {/* TAB 7: 3D HARDWARE TWIN */}
        {activeTab === 'sensor3d' && (
          <Sensor3DModel
            status={overallStatus}
            node={activeSelectedNode}
            allNodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
            effect3DTheme={effect3DTheme}
          />
        )}

        {/* TAB 8: SENSOR DIAGNOSTICS & RATIOS */}
        {activeTab === 'diagnostics' && (
          <SensorDiagnosticsSection
            nodes={nodes}
          />
        )}

        {/* TAB 9: SENSOR LOCATIONS */}
        {activeTab === 'locations' && (
          <SensorLocationsSection
            nodes={nodes}
            onSelectNode={(node) => {
              setSelectedNodeId(node.id);
              setActiveTab('sensorhub');
            }}
          />
        )}

        {/* TAB 9: CAMERAS & SURVEILLANCE */}
        {activeTab === 'cameras' && (
          <CameraSection />
        )}

        {/* TAB 10: INNOVATION & RESEARCH */}
        {activeTab === 'innovation' && (
          <InnovationSection />
        )}

        {/* TAB 11: SETTINGS & DGMS SAFETY CONSOLE (OWNER / ADMIN EXCLUSIVE) */}
        {activeTab === 'settings' && isAdmin && (
          <SettingsSection 
            thresholds={thresholds}
            onUpdateThresholds={(newThresh) => {
              setThresholds(newThresh);
              logEvent('normal', 'ADMIN', 'DGMS Statutory Thresholds updated.');
            }}
          />
        )}

        {/* TAB 12: VISITOR & USER LOGINS AUDIT (OWNER / ADMIN EXCLUSIVE) */}
        {activeTab === 'users' && isAdmin && (
          <UserAccessLogSection currentUser={currentUser} />
        )}

      </main>

      {/* Footer bar */}
      <footer className="relative z-10 bg-slate-950/90 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">Team Green ThinkerX</span>
            <span className="text-slate-600">•</span>
            <span>Smart India Hackathon 2026 (SIH26025)</span>
          </div>
          <div className="font-mono text-xs text-emerald-400 font-bold">
            DGMS Compliant • Offline LoRa Sub-GHz • 3D Digital Twin Active
          </div>
        </div>
      </footer>

      {/* DGMS Shift Audit Exporter Modal Preview */}
      <DgmsReportModal
        isOpen={isDgmsModalOpen}
        onClose={() => setIsDgmsModalOpen(false)}
        nodes={nodes}
        cmsi={cmsi}
        status={overallStatus}
        activeMiners={activeMiners}
        shiftName={currentShift}
        onDownloadPdf={handleDirectPdfExport}
      />

      {/* Theme, Font & 3D Effect Studio Customizer (5x5x5) */}
      <ThemeCustomizerModal
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
        currentColorTheme={dashboardTheme}
        onSelectColorTheme={setDashboardTheme}
        currentFontTheme={fontTheme}
        onSelectFontTheme={setFontTheme}
        current3DEffectTheme={effect3DTheme}
        onSelect3DEffectTheme={setEffect3DTheme}
      />

      {/* Real-time Hardware Serial Connection Floating Toast Notification */}
      {serialToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
            serialToast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-100 shadow-emerald-950/80'
              : 'bg-rose-950/95 border-rose-500/80 text-rose-100 shadow-rose-950/80'
          }`}>
            <div className={`p-2 rounded-xl text-lg ${
              serialToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {serialToast.type === 'success' ? '🟢' : '⚠️'}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-black tracking-wide font-mono">
                {serialToast.title}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {serialToast.message}
              </p>
            </div>
            <button
              onClick={() => setSerialToast(null)}
              className="text-slate-400 hover:text-white text-xs font-mono font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
