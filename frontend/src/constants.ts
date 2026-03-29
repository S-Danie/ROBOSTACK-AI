/**
 * @file constants.ts
 * @description Centralized configuration for the RoboStack AI application.
 * Defines ROS 2 topic names, node identifiers, and hardware parameters.
 */

export const ROS_CONFIG = {
  /** WebSocket bridge URL */
  WS_URL: 'ws://localhost:9090',
  /** Primary perception node name */
  NODE_NAME: 'mobile_manipulator_core',
  /** ROS 2 topics */
  TOPICS: {
    JOINT_STATES: '/joint_states',
    CAMERA_INFO: '/camera/aligned_depth_to_color/camera_info',
    IMAGE_RAW: '/camera/color/image_raw',
    DIAGNOSTICS: '/diagnostics',
    TELEMETRY: '/robot/telemetry',
  },
  /** MoveIt 2 Planning Group Names */
  PLANNING_GROUPS: {
    ARM: 'arm',
    GRIPPER: 'gripper',
  },
  /** Reconnection timeout in ms */
  RECONNECT_TIMEOUT: 5000,
};

export const HARDWARE_CONFIG = {
  CAMERA: {
    MODEL: 'Intel RealSense D455',
    RESOLUTION: '1280x720',
    FPS: 30,
    FOV: '86°x57°',
    DEPTH_TOPIC: '/camera/aligned_depth_to_color/image_raw',
  },
  ARM: {
    MODEL: 'Universal Robots UR5e',
    DOF: 6,
    CONTROLLER: '6-DOF Arm Controller',
    PLANNING_FRAME: 'base_link',
  },
  SOFTWARE: {
    YOLO_MODEL: 'yolov8n.pt',
    PERCEPTION_ENGINE: 'TensorRT',
  }
};

export const SYSTEM_STATES = {
  IDLE: 'IDLE',
  NAV_TO_SHELF: 'NAV_TO_SHELF',
  SCAN_ITEMS: 'SCAN_ITEMS',
  PICK_ITEM: 'PICK_ITEM',
} as const;

export type SystemState = keyof typeof SYSTEM_STATES;
