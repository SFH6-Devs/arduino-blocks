export const MISSION_SOLUTIONS = {
    m1: `<xml><block type="move_forward"><field name="TIME">10000</field></block></xml>`,
    m2: `<xml><block type="move_forward"><field name="TIME">10000</field></block></xml>`,
    m3: `<xml>
            <block type="move_forward"><field name="TIME">500</field>
                <next>
                    <block type="turn_right"><field name="DEGREES">45</field>
                        <next>
                            <block type="move_forward"><field name="TIME">3000</field>
                                <next>
                                    <block type="turn_left"><field name="DEGREES">45</field>
                                        <next>
                                            <block type="move_forward"><field name="TIME">6000</field></block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </next>
            </block>
         </xml>`,
    m4: `<xml>
            <block type="forever">
                <statement name="DO">
                    <block type="if_obstacle">
                        <statement name="DO">
                            <block type="turn_left"><field name="DEGREES">90</field>
                                <next>
                                    <block type="move_forward"><field name="TIME">1500</field>
                                        <next>
                                            <block type="turn_right"><field name="DEGREES">90</field></block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </statement>
                        <next>
                            <block type="move_forward"><field name="TIME">200</field></block>
                        </next>
                    </block>
                </statement>
            </block>
         </xml>`,
    m5: `<xml>
            <block type="forever">
                <statement name="DO">
                    <block type="if_else">
                        <value name="IF0">
                            <block type="on_line_left"></block>
                        </value>
                        <statement name="DO0">
                            <block type="if_else">
                                <value name="IF0">
                                    <block type="on_line_right"></block>
                                </value>
                                <statement name="DO0">
                                    <block type="set_motors"><field name="SPEED_L">15</field><field name="SPEED_R">15</field></block>
                                </statement>
                                <statement name="ELSE">
                                    <block type="set_motors"><field name="SPEED_L">15</field><field name="SPEED_R">0</field></block>
                                </statement>
                            </block>
                        </statement>
                        <statement name="ELSE">
                            <block type="if_else">
                                <value name="IF0">
                                    <block type="on_line_right"></block>
                                </value>
                                <statement name="DO0">
                                    <block type="set_motors"><field name="SPEED_L">0</field><field name="SPEED_R">15</field></block>
                                </statement>
                                <statement name="ELSE">
                                    <block type="set_motors"><field name="SPEED_L">15</field><field name="SPEED_R">15</field></block>
                                </statement>
                            </block>
                        </statement>
                    </block>
                </statement>
            </block>
         </xml>`,
    m6: `<xml>
            <block type="forever">
                <statement name="DO">
                    <block type="if_else">
                        <value name="IF0">
                            <block type="on_line_left"></block>
                        </value>
                        <statement name="DO0">
                            <block type="if_else">
                                <value name="IF0">
                                    <block type="on_line_right"></block>
                                </value>
                                <statement name="DO0">
                                    <block type="set_motors"><field name="SPEED_L">15</field><field name="SPEED_R">15</field></block>
                                </statement>
                                <statement name="ELSE">
                                    <block type="set_motors"><field name="SPEED_L">15</field><field name="SPEED_R">0</field></block>
                                </statement>
                            </block>
                        </statement>
                        <statement name="ELSE">
                            <block type="if_else">
                                <value name="IF0">
                                    <block type="on_line_right"></block>
                                </value>
                                <statement name="DO0">
                                    <block type="set_motors"><field name="SPEED_L">0</field><field name="SPEED_R">15</field></block>
                                </statement>
                                <statement name="ELSE">
                                    <block type="set_motors"><field name="SPEED_L">15</field><field name="SPEED_R">15</field></block>
                                </statement>
                            </block>
                        </statement>
                    </block>
                </statement>
            </block>
         </xml>`
};
