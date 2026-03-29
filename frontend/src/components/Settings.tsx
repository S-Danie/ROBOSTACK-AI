import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  Globe, 
  Moon, 
  Sun, 
  Wifi, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as ROSLIB from 'roslib';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [tempUrl, setTempUrl] = useState(settings.rosBridgeUrl);

  const testConnection = () => {
    setTestStatus('testing');
    const ros = new ROSLIB.Ros({
      url: tempUrl
    });

    ros.on('connection', () => {
      setTestStatus('success');
      ros.close();
    });

    ros.on('error', () => {
      setTestStatus('failed');
      ros.close();
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (testStatus === 'testing') {
        setTestStatus('failed');
        ros.close();
      }
    }, 5000);
  };

  const handleSave = () => {
    updateSettings({ rosBridgeUrl: tempUrl });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">System Settings</h2>
        <p className="text-zinc-500 text-sm">Configure your robot connection and interface preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Connection Settings */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">ROS Bridge Configuration</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">WebSocket URL</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="ws://192.168.1.10:9090"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button 
                  onClick={testConnection}
                  disabled={testStatus === 'testing'}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
                    testStatus === 'testing' ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" :
                    testStatus === 'success' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    testStatus === 'failed' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  )}
                >
                  {testStatus === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
                   testStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   testStatus === 'failed' ? <XCircle className="w-4 h-4" /> : null}
                  {testStatus === 'testing' ? 'Testing...' : 
                   testStatus === 'success' ? 'Success' :
                   testStatus === 'failed' ? 'Failed' : 'Test Connection'}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono">Default: ws://localhost:9090</p>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-cyan-500 text-black font-bold py-2 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Apply Connection Settings
            </button>
          </div>
        </section>

        {/* UI Preferences */}
        <section className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Interface Preferences</h3>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-white">Dark Mode</label>
                  <p className="text-xs text-zinc-500">Enable high-contrast dark interface.</p>
                </div>
                <button 
                  onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    settings.darkMode ? "bg-cyan-500" : "bg-zinc-800"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.darkMode ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.darkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                  <span className="text-xs font-mono text-zinc-400 uppercase">{settings.darkMode ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Languages className="w-4 h-4 text-zinc-500" />
                  <label className="text-sm font-medium text-white">Language</label>
                </div>
                <select 
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 appearance-none"
                >
                  <option value="en">English (US)</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <p className="text-xs text-amber-500/80 leading-relaxed">
          <strong>Note:</strong> Changing the ROS Bridge URL will trigger an immediate reconnection attempt. 
          Ensure the <code>rosbridge_suite</code> is running on the target machine and the port is accessible.
        </p>
      </div>
    </div>
  );
}
