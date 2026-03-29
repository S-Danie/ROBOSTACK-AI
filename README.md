# RoboStack AI: Mobile Manipulator SKU Picking Stack

A production-ready software stack for 6-DOF mobile manipulators designed for heterogeneous SKU picking in warehouse environments. This project integrates **ROS 2 Humble**, **MoveIt 2**, **YOLOv8**, and **Intel RealSense D455**.

## 🏗️ System Architecture

- **Perception**: YOLOv8 inference combined with RealSense depth alignment for 3D centroid calculation.
- **Kinematics**: MoveIt 2 MoveGroup Interface for 3-stage trajectory planning (Pre-Grasp, Approach, Retreat).
- **Navigation**: Integration with ROS 2 Nav2 stack for mobile base positioning.
- **Coordination**: SMACH-based state machine for mission lifecycle management and error recovery.
- **Monitoring**: Web-based HMI Dashboard for real-time telemetry and SKU performance auditing.

## 📋 Prerequisites

### Hardware
- 6-DOF Robotic Arm (supported by MoveIt 2)
- Mobile Base (supported by Nav2)
- Intel RealSense D455 Depth Camera

### Software
- **OS**: Ubuntu 22.04 LTS
- **ROS 2**: Humble Hawksbill
- **Libraries**:
  - MoveIt 2
  - `ultralytics` (YOLOv8)
  - `cv_bridge`
  - `realsense2_camera`
  - `smach_ros`

## 🚀 Installation & Setup

### 1. Clone & Build Workspace
```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
# Copy the mobile_manipulator package here
cd ~/ros2_ws
rosdep install -i --from-path src --rosdistro humble -y
colcon build --symlink-install
source install/setup.bash
```

### 2. Python Dependencies
```bash
pip3 install ultralytics opencv-python numpy
```

## ⚙️ Configuration

### RealSense D455
The camera is configured for the **"High Accuracy"** preset. You can modify these parameters in:
`ros2_ws/src/mobile_manipulator/config/hardware_params.yaml`

### MoveIt 2 Scaling
To ensure smooth industrial movement, scaling factors are set to:
- `max_velocity_scaling_factor`: 0.5
- `max_acceleration_scaling_factor`: 0.3

## 🏃 Running the Project

### 1. Launch the ROS 2 Stack
Start the core nodes (Perception, TF Handler, and Manipulation Server):
```bash
# Terminal 1: Perception & TF
ros2 run mobile_manipulator perception_bridge.py
ros2 run mobile_manipulator tf_handler

# Terminal 2: Manipulation Server
ros2 run mobile_manipulator pick_place_server
```

### 2. Start the State Machine
```bash
ros2 run mobile_manipulator smach_coordinator.py
```

### 3. Launch the Dashboard
The dashboard provides a real-time view of the system state and telemetry.
```bash
npm install
npm run dev
```
Access the dashboard at: `http://localhost:3000`

## 📊 Performance Auditing

To run a performance audit on 200+ SKUs and generate a CSV report:
```bash
python3 src/mobile_manipulator/scripts/test_pick_accuracy.py
```
This will generate `pick_performance_audit.csv` containing success rates and cycle times.

## 🛠️ Core Components

| Component | File | Description |
|-----------|------|-------------|
| **Perception Bridge** | `perception_bridge.py` | YOLOv8 + Depth projection to 3D. |
| **TF Handler** | `tf_handler.cpp` | Camera to Base frame transformations. |
| **Pick Server** | `pick_place_server.cpp` | MoveIt 2 trajectory execution. |
| **Coordinator** | `smach_coordinator.py` | High-level mission logic. |
| **Hardware Config** | `hardware_params.yaml` | Camera and Motion parameters. |

## 🎮 Gazebo Ignition Simulation

This project includes a Gazebo Ignition world and a URDF for simulation testing.

### 1. Launch Simulation
```bash
# Terminal 1: Launch Gazebo with Warehouse World
ign gazebo src/mobile_manipulator/simulation/warehouse.sdf

# Terminal 2: Spawn Robot & Controllers
ros2 launch mobile_manipulator simulation_launch.py
```

### 2. Simulation Components
- **World**: `warehouse.sdf` (Includes a static shelf at X=2.0).
- **Robot**: `mobile_manipulator.urdf.xacro` (6-DOF arm + mobile base).
- **Control**: `ros2_control` via `ign_ros2_control` plugin.

---
*Developed by Expert Robotics Architect for Industrial Automation.*
