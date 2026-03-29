/**
 * @file useRos.ts
 * @description Custom React hook for managing ROS 2 WebSocket connections and topic subscriptions.
 * Provides a centralized interface for interacting with the robot's middleware.
 */

import { useCallback } from 'react';
import * as ROSLIB from 'roslib';
import { useRosContext } from '../context/RosContext';

/**
 * Custom hook for interacting with ROS 2.
 * Provides utilities for subscribing to topics and publishing messages using a shared connection.
 */
export function useRos() {
  const { ros, connected, error, latency } = useRosContext();

  /**
   * Subscribes to a ROS topic
   * @param {string} name Topic name
   * @param {string} messageType ROS message type
   * @param {Function} callback Callback function for new messages
   */
  const subscribe = useCallback((name: string, messageType: string, callback: (msg: any) => void) => {
    if (!ros || !connected) return () => {};

    const topic = new ROSLIB.Topic({
      ros,
      name,
      messageType,
    });

    topic.subscribe(callback);
    return () => topic.unsubscribe(callback);
  }, [ros, connected]);

  /**
   * Publishes a message to a ROS topic
   * @param {string} name Topic name
   * @param {string} messageType ROS message type
   * @param {any} message Message payload
   */
  const publish = useCallback((name: string, messageType: string, message: any) => {
    if (!ros || !connected) return;

    const topic = new ROSLIB.Topic({
      ros,
      name,
      messageType,
    });

    const msg = new (ROSLIB as any).Message(message);
    topic.publish(msg);
  }, [ros, connected]);

  return {
    connected,
    error,
    latency,
    subscribe,
    publish,
    ros,
  };
}
