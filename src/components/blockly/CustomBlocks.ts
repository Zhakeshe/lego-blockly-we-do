import * as Blockly from 'blockly/core'; // core-дан импорттаймыз
import 'blockly/javascript'; // JS генераторын қосамыз

// Motor control blocks
export const defineCustomBlocks = () => {
  // Set Motor Power Block
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
      this.setHelpUrl('');
    },
  };

  // Stop Motor Block
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
      this.setHelpUrl('');
    },
  };

  // Move Forward Block
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
      this.setHelpUrl('');
    },
  };

  // Move Backward Block
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
      this.setHelpUrl('');
    },
  };

  // Turn Left Block
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
      this.setHelpUrl('');
    },
  };

  // Turn Right Block
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
      this.setHelpUrl('');
    },
  };

  // Read Distance Sensor Block
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
      this.setHelpUrl('');
    },
  };

  // Read Tilt Sensor Block
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
      this.setHelpUrl('');
    },
  };

  // Wait Block
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
      this.setHelpUrl('');
    },
  };

  // Play Sound Block
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
      this.setHelpUrl('');
    },
  };
};

// JavaScript code generators
export const defineCodeGenerators = () => {
  // Motor set power generator
  (Blockly as any).JavaScript['motor_set_power'] = function (block: any) {
    const motor = block.getFieldValue('MOTOR');
    const power = Blockly.JavaScript.valueToCode(block, 'POWER', Blockly.JavaScript.ORDER_ATOMIC) || '0';
    return `setMotorPower('${motor}', ${power});\n`;
  };

  // Motor stop generator
  (Blockly as any).JavaScript['motor_stop'] = function (block: any) {
    const motor = block.getFieldValue('MOTOR');
    return `stopMotor('${motor}');\n`;
  };

  // Move forward generator
  (Blockly as any).JavaScript['robot_move_forward'] = function (block: any) {
    const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC) || '50';
    const duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_ATOMIC) || '1';
    return `moveForward(${speed}, ${duration});\n`;
  };

  // Move backward generator
  (Blockly as any).JavaScript['robot_move_backward'] = function (block: any) {
    const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC) || '50';
    const duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_ATOMIC) || '1';
    return `moveBackward(${speed}, ${duration});\n`;
  };

  // Turn left generator
  (Blockly as any).JavaScript['robot_turn_left'] = function (block: any) {
    const angle = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_ATOMIC) || '90';
    return `turnLeft(${angle});\n`;
  };

  // Turn right generator
  (Blockly as any).JavaScript['robot_turn_right'] = function (block: any) {
    const angle = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_ATOMIC) || '90';
    return `turnRight(${angle});\n`;
  };

  // Read distance sensor generator
  (Blockly as any).JavaScript['sensor_read_distance'] = function (block: any) {
    const sensor = block.getFieldValue('SENSOR');
    const code = `readDistanceSensor('${sensor}')`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  // Read tilt sensor generator
  (Blockly as any).JavaScript['sensor_read_tilt'] = function (block: any) {
    const axis = block.getFieldValue('AXIS');
    const code = `readTiltSensor('${axis}')`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  // Wait generator
  (Blockly as any).JavaScript['robot_wait'] = function (block: any) {
    const duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_ATOMIC) || '1';
    return `await wait(${duration});\n`;
  };

  // Play sound generator
  (Blockly as any).JavaScript['robot_play_sound'] = function (block: any) {
    const sound = block.getFieldValue('SOUND');
    return `playSound('${sound}');\n`;
  };
};
