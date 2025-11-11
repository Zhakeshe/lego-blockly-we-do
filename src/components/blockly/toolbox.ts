export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Movement',
      colour: '160',
      contents: [
        {
          kind: 'block',
          type: 'robot_move_forward',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 50,
                },
              },
            },
            DURATION: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'robot_move_backward',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 50,
                },
              },
            },
            DURATION: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'robot_turn_left',
          inputs: {
            ANGLE: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 90,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'robot_turn_right',
          inputs: {
            ANGLE: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 90,
                },
              },
            },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Motors',
      colour: '230',
      contents: [
        {
          kind: 'block',
          type: 'motor_set_power',
          inputs: {
            POWER: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 50,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'motor_stop',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Sensors',
      colour: '290',
      contents: [
        {
          kind: 'block',
          type: 'sensor_read_distance',
        },
        {
          kind: 'block',
          type: 'sensor_read_tilt',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Control',
      colour: '120',
      contents: [
        {
          kind: 'block',
          type: 'robot_wait',
          inputs: {
            DURATION: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_if',
        },
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_whileUntil',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '210',
      contents: [
        {
          kind: 'block',
          type: 'logic_compare',
        },
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
          kind: 'block',
          type: 'logic_negate',
        },
        {
          kind: 'block',
          type: 'logic_boolean',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '230',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
        },
        {
          kind: 'block',
          type: 'math_arithmetic',
        },
        {
          kind: 'block',
          type: 'math_single',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '330',
      custom: 'VARIABLE',
    },
    {
      kind: 'category',
      name: 'Sound',
      colour: '65',
      contents: [
        {
          kind: 'block',
          type: 'robot_play_sound',
        },
      ],
    },
  ],
};
