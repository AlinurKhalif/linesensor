function onBluetoothDataReceived () {
    receivedData = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    
    basic.showString("Received: " + receivedData)
    
    if (receivedData == "A") {
        // Command to move forward
        
        adjustMotorsWithPID(0, 1, 0)
    } else {
    	
    }
}
bluetooth.onBluetoothConnected(function () {
    connected = true
    basic.showIcon(IconNames.Yes)
    basic.forever(function (): void {
        if (connected) {
            lineFollower();  // Call the line follower function continuously when connected
        }
    });
})
function adjustMotorsWithPID (leftSensor: number, middleSensor: number, rightSensor: number) {
    // Calculate the PID control signal
    pidControl = calculatePIDControl(leftSensor, middleSensor, rightSensor)
    // Adjust the motor speeds based on the PID control signal
    motor.MotorRun(motor.Motors.M1, motor.Dir.CW, speed + pidControl)
    motor.MotorRun(motor.Motors.M2, motor.Dir.CW, speed + pidControl)
    motor.MotorRun(motor.Motors.M3, motor.Dir.CW, speed - pidControl)
    motor.MotorRun(motor.Motors.M4, motor.Dir.CW, speed - pidControl)
}
bluetooth.onBluetoothDisconnected(function () {
    connected = false
    basic.showIcon(IconNames.No)
})
input.onButtonPressed(Button.A, function () {
    // Button A pressed to  move forward
    
    adjustMotorsWithPID(0, 1, 0)
})
function calculateError (leftSensor: number, middleSensor: number, rightSensor: number) {
    // Calculate the error signal based on sensor readings
    position = leftSensor * -1 + middleSensor * 0 + rightSensor * 1
    return position
}
function lineFollower () {
    leftSensor = pins.digitalReadPin(DigitalPin.P16)
    middleSensor = pins.digitalReadPin(DigitalPin.P15)
    rightSensor = pins.digitalReadPin(DigitalPin.P14)
    
    basic.showString("L:" + leftSensor + " M:" + middleSensor + " R:" + rightSensor)
    if (leftSensor == 0 && middleSensor == 1 && rightSensor == 0) {
        // Follow a straight line
        adjustMotorsWithPID(leftSensor, middleSensor, rightSensor)
    } else if (leftSensor == 1 && middleSensor == 0 && rightSensor == 1) {
        // Follow a curved line (adjust motor control for a curve)
        adjustMotorsWithPID(leftSensor, middleSensor, rightSensor)
    } else if (leftSensor == 1 && middleSensor == 0 && rightSensor == 0) {
        // Adjust for left curve
        adjustMotorsWithPID(leftSensor, middleSensor, rightSensor)
    } else if (leftSensor == 0 && middleSensor == 0 && rightSensor == 1) {
        // Adjust for right curve
        adjustMotorsWithPID(leftSensor, middleSensor, rightSensor)
    } else {
        // No line detected, stop all motors
        motor.MotorRun(motor.Motors.M1, motor.Dir.CW, 0)
        motor.MotorRun(motor.Motors.M2, motor.Dir.CW, 0)
        motor.MotorRun(motor.Motors.M3, motor.Dir.CW, 0)
        motor.MotorRun(motor.Motors.M4, motor.Dir.CW, 0)
    }
}
function calculatePIDControl (leftSensor: number, middleSensor: number, rightSensor: number) {
    error = calculateError(leftSensor, middleSensor, rightSensor)
    
    proportional = Kp * error
    
    integral += error
    integralTerm = Ki * integral
    
    derivative = Kd * (error - prevError)
    prevError = error
    // Calculate the PID control signal
    controlSignal = proportional + integralTerm + derivative
    // Return the adjusted control signal
    return controlSignal
}
let controlSignal = 0
let prevError = 0
let derivative = 0
let integralTerm = 0
let integral = 0
let proportional = 0
let error = 0
let rightSensor = 0
let middleSensor = 0
let leftSensor = 0
let position = 0
let pidControl = 0
let receivedData = ""
let speed = 0
let Kd = 0
let Ki = 0
let Kp = 0
let connected = false
basic.showIcon(IconNames.No)
basic.pause(1000)
basic.clearScreen()
led.enable(false)
// PID constants
Kp = 1
Ki = 0.1
Kd = 0.01
speed = 255
bluetooth.setTransmitPower(7)
bluetooth.startUartService()
