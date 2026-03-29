import * as ROSLIB from 'roslib';

const { Ros, Topic, Message } = ROSLIB as any;

class RobotService {
  private ros: any;

  constructor() {
    this.ros = new Ros({
      url: 'ws://localhost:9090'
    });

    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
    });

    this.ros.on('error', (error: any) => {
      console.log('Error connecting to websocket server: ', error);
    });

    this.ros.on('close', () => {
      console.log('Connection to websocket server closed.');
    });
  }

  subscribeToJointStates(callback: (message: any) => void) {
    const listener = new Topic({
      ros: this.ros,
      name: '/joint_states',
      messageType: 'sensor_msgs/JointState'
    });

    listener.subscribe((message: any) => {
      callback(message);
    });

    return listener;
  }

  sendJointTrajectory(joints: string[], positions: number[]) {
    const topic = new Topic({
      ros: this.ros,
      name: '/arm_controller/joint_trajectory',
      messageType: 'trajectory_msgs/JointTrajectory'
    });

    const msg = new Message({
      header: {
        stamp: { sec: 0, nanosec: 0 },
        frame_id: ''
      },
      joint_names: joints,
      points: [
        {
          positions: positions,
          time_from_start: { sec: 1, nanosec: 0 }
        }
      ]
    });

    topic.publish(msg);
  }
}

export default new RobotService();
