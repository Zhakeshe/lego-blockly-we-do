import { Robot3DConfig } from '../../types';

export class CodeExecutor {
  private updateMotorPower: (motorId: string, power: number) => void;
  private getSensorValue: (sensorId: string) => number;
  private isExecuting: boolean = false;
  private stopRequested: boolean = false;

  constructor(
    updateMotorPower: (motorId: string, power: number) => void,
    getSensorValue: (sensorId: string) => number
  ) {
    this.updateMotorPower = updateMotorPower;
    this.getSensorValue = getSensorValue;
  }

  async execute(code: string): Promise<void> {
    if (this.isExecuting) {
      console.warn('Code is already executing');
      return;
    }

    this.isExecuting = true;
    this.stopRequested = false;

    try {
      // Create execution context with robot control functions
      const context = this.createExecutionContext();

      // Wrap code in async function
      const asyncCode = `
        (async function() {
          ${code}
        })();
      `;

      // Execute code with context
      const func = new Function(...Object.keys(context), `return ${asyncCode}`);
      await func(...Object.values(context));
    } catch (error) {
      console.error('Code execution error:', error);
      throw error;
    } finally {
      this.isExecuting = false;
      this.stopAllMotors();
    }
  }

  stop(): void {
    this.stopRequested = true;
    this.stopAllMotors();
  }

  private createExecutionContext() {
    return {
      // Motor control functions
      setMotorPower: (motorId: string, power: number) => {
        if (this.stopRequested) return;
        this.updateMotorPower(motorId, Math.max(-100, Math.min(100, power)));
      },

      stopMotor: (motorId: string) => {
        if (motorId === 'both') {
          this.updateMotorPower('motorA', 0);
          this.updateMotorPower('motorB', 0);
        } else {
          this.updateMotorPower(motorId, 0);
        }
      },

      // Movement functions
      moveForward: async (speed: number, duration: number) => {
        if (this.stopRequested) return;
        this.updateMotorPower('motorA', speed);
        this.updateMotorPower('motorB', speed);
        await this.wait(duration);
        this.updateMotorPower('motorA', 0);
        this.updateMotorPower('motorB', 0);
      },

      moveBackward: async (speed: number, duration: number) => {
        if (this.stopRequested) return;
        this.updateMotorPower('motorA', -speed);
        this.updateMotorPower('motorB', -speed);
        await this.wait(duration);
        this.updateMotorPower('motorA', 0);
        this.updateMotorPower('motorB', 0);
      },

      turnLeft: async (angle: number) => {
        if (this.stopRequested) return;
        const duration = angle / 90; // Simple calculation
        this.updateMotorPower('motorA', -50);
        this.updateMotorPower('motorB', 50);
        await this.wait(duration);
        this.updateMotorPower('motorA', 0);
        this.updateMotorPower('motorB', 0);
      },

      turnRight: async (angle: number) => {
        if (this.stopRequested) return;
        const duration = angle / 90; // Simple calculation
        this.updateMotorPower('motorA', 50);
        this.updateMotorPower('motorB', -50);
        await this.wait(duration);
        this.updateMotorPower('motorA', 0);
        this.updateMotorPower('motorB', 0);
      },

      // Sensor functions
      readDistanceSensor: (sensorId: string): number => {
        return this.getSensorValue(sensorId);
      },

      readTiltSensor: (axis: string): number => {
        // Simulate tilt sensor reading
        return Math.random() * 180 - 90;
      },

      // Utility functions
      wait: (duration: number): Promise<void> => {
        return this.wait(duration);
      },

      playSound: (sound: string) => {
        console.log(`Playing sound: ${sound}`);
        // In real implementation, play actual sound
      },

      // Console output
      console: {
        log: (...args: any[]) => console.log('[Robot]', ...args),
      },
    };
  }

  private wait(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const checkStop = () => {
        if (this.stopRequested) {
          resolve();
          return;
        }
        if (duration <= 0) {
          resolve();
          return;
        }
        duration -= 0.1;
        setTimeout(checkStop, 100);
      };
      checkStop();
    });
  }

  private stopAllMotors(): void {
    this.updateMotorPower('motorA', 0);
    this.updateMotorPower('motorB', 0);
  }
}
