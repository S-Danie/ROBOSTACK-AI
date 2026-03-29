import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as ROSLIB from 'roslib';
import { ROS_CONFIG } from '../constants';
import { useSettings } from './SettingsContext';

interface RosContextType {
  ros: ROSLIB.Ros | null;
  connected: boolean;
  error: string | null;
  latency: number;
}

const RosContext = createContext<RosContextType | undefined>(undefined);

/**
 * Provider component that manages a single ROS connection for the entire application.
 * @param children - React children
 */
export const RosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState(0);
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const latencyIntervalRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (rosRef.current) {
      rosRef.current.close();
    }

    const ros = new ROSLIB.Ros({
      url: settings.rosBridgeUrl
    });

    ros.on('connection', () => {
      setConnected(true);
      setError(null);
      
      // Start latency monitoring
      latencyIntervalRef.current = window.setInterval(() => {
        setLatency(Math.floor(Math.random() * 20) + 5); // Mock latency for UI
      }, 2000);
    });

    ros.on('error', (err) => {
      setConnected(false);
      setError('ROS Connection Error');
      console.error('ROS Error:', err);
    });

    ros.on('close', () => {
      setConnected(false);
      if (latencyIntervalRef.current) {
        clearInterval(latencyIntervalRef.current);
      }
      // Reconnect after delay
      setTimeout(connect, ROS_CONFIG.RECONNECT_TIMEOUT);
    });

    rosRef.current = ros;
  }, [settings.rosBridgeUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (rosRef.current) {
        rosRef.current.close();
      }
      if (latencyIntervalRef.current) {
        clearInterval(latencyIntervalRef.current);
      }
    };
  }, [connect]);

  return (
    <RosContext.Provider value={{ ros: rosRef.current, connected, error, latency }}>
      {children}
    </RosContext.Provider>
  );
};

/**
 * Hook to access the ROS connection context.
 */
export const useRosContext = () => {
  const context = useContext(RosContext);
  if (context === undefined) {
    throw new Error('useRosContext must be used within a RosProvider');
  }
  return context;
};
