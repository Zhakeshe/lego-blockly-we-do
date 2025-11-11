// src/components/blockly/CustomBlocks.ts
import * as Blockly from 'blockly/core';
import 'blockly/javascript';

// Custom Blocks
export const defineCustomBlocks = () => {
  // ----- Motor Blocks -----
  Blockly.Blocks['motor_set_power'] = {
    init: function () {
      this.appendValueInput('POWER')
        .setCheck('Number')
        .appendField('Set motor')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'motorA'],
            ['B', 'motorB'],
          ]),
          'MOTOR'
        )
        .appendField('power to');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Set motor power (-100 to 100)');
    },
  };

  Blockly.Blocks['motor_stop'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Stop motor')
        .appendField(
          new Blockly.FieldDropdown([
            ['A', 'motorA'],
            ['B', 'motorB'],
            ['Both', 'both'],
          ]),
          'MOTOR'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Stop motor');
    },
  };

  // ----- Movement Blocks -----
  Blockly.Blocks['robot_move_forward'] = {
    init: function () {
      this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('Move forward at speed');
      this.appendValueInput('DURATION')
        .setCheck('Number')
        .appendField('for');
      this.appendDummyInput().appendField('seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Move robot forward');
    },
  };

  Blockly.Blocks['robot_move_backward'] = {
    init: function () {
      this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('Move backward at speed');
      this.appendValueInput('DURATION')
        .setCheck('Number')
        .appendField('for');
      this.appendDummyInput().appendField('seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Move robot backward');
    },
  };

  Blockly.Blocks['robot_turn_left'] = {
    init: function () {
      this.appendValueInput('ANGLE')
        .setCheck('Number')
        .appendField('Turn left');
      this.appendDummyInput().appendField('degrees');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Turn robot left');
    },
  };

  Blockly.Blocks['robot_turn_right'] = {
    init: function () {
      this.appendValueInput('ANGLE')
        .setCheck('Number')
        .appendField('Turn right');
      this.appendDummyInput().appendField('degrees');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Turn robot right');
    },
  };

  // ----- Sensor Blocks -----
  Blockly.Blocks['sensor_read_distance'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Read distance sensor')
        .appendField(
          new Blockly.FieldDropdown([
            ['1', 'sensor1'],
            ['2', 'sensor2'],
          ]),
          'SENSOR'
        );
      this.setOutput(true, 'Number');
      this.setColour(290);
      this.setTooltip('Read distance sensor value');
    },
  };

  Blockly.Blocks['sensor_read_tilt'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Read tilt sensor')
        .appendField(
          new Blockly.FieldDropdown([
            ['X', 'x'],
            ['Y', 'y'],
            ['Z', 'z'],
          ]),
          'AXIS'
        );
      this.setOutput(true, 'Number');
      this.setColour(290);
      this.setTooltip('Read tilt sensor value');
    },
  };

  // ----- Wait Block -----
  Blockly.Blocks['robot_wait'] = {
    init: function () {
      this.appendValueInput('DURATION')
        .setCheck('Number')
        .appendField('Wait for');
      this.appendDummyInput().appendField('seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Wait for specified duration');
    },
  };

  // ----- Sound Block -----
  Blockly.Blocks['robot_play_sound'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Play sound')
        .appendField(
          new Blockly.FieldDropdown([
            ['Beep', 'beep'],
            ['Success', 'success'],
            ['Error', 'error'],
          ]),
          'SOUND'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Play a sound');
    },
  };
};

// Custom JS Generators
export const defineCodeGenerators = () => {
  const JS = (Blockly as any).JavaScript;
  if (!JS) {
    console.error('Blockly.JavaScript is undefined!');
    return;
  }

  // Motor generators
  JS['motor_set_power'] = (block: any) => {
    const motor = block.getFieldValue('MOTOR');
    const power = JS.valueToCode(block, 'POWER', JS.ORDER_ATOMIC) || '0';
    return `setMotorPower('${motor}', ${power});\n`;
  };

  JS['motor_stop'] = (block: any) => {
    const motor = block.getFieldValue('MOTOR');
    return `stopMotor('${motor}');\n`;
  };

  // Movement generators
  JS['robot_move_forward'] = (block: any) => {
    const speed = JS.valueToCode(block, 'SPEED', JS.ORDER_ATOMIC) || '50';
    const duration = JS.valueToCode(block, 'DURATION', JS.ORDER_ATOMIC) || '1';
    return `moveForward(${speed}, ${duration});\n`;
  };

  JS['robot_move_backward'] = (block: any) => {
    const speed = JS.valueToCode(block, 'SPEED', JS.ORDER_ATOMIC) || '50';
    const duration = JS.valueToCode(block, 'DURATION', JS.ORDER_ATOMIC) || '1';
    return `moveBackward(${speed}, ${duration});\n`;
  };

  JS['robot_turn_left'] = (block: any) => {
    const angle = JS.valueToCode(block, 'ANGLE', JS.ORDER_ATOMIC) || '90';
    return `turnLeft(${angle});\n`;
  };

  JS['robot_turn_right'] = (block: any) => {
    const angle = JS.valueToCode(block, 'ANGLE', JS.ORDER_ATOMIC) || '90';
    return `turnRight(${angle});\n`;
  };

  // Sensor generators
  JS['sensor_read_distance'] = (block: any) => {
    const sensor = block.getFieldValue('SENSOR');
    return [`readDistanceSensor('${sensor}')`, JS.ORDER_FUNCTION_CALL];
  };

  JS['sensor_read_tilt'] = (block: any) => {
    const axis = block.getFieldValue('AXIS');
    return [`readTiltSensor('${axis}')`, JS.ORDER_FUNCTION_CALL];
  };

  // Wait generator
  JS['robot_wait'] = (block: any) => {
    const duration = JS.valueToCode(block, 'DURATION', JS.ORDER_ATOMIC) || '1';
    return `await wait(${duration});\n`;
  };

  // Sound generator
  JS['robot_play_sound'] = (block: any) => {
    const sound = block.getFieldValue('SOUND');
    return `playSound('${sound}');\n`;
  };
};
