#!/usr/bin/python

from Adafruit_PWM_Servo_Driver import PWM
import time
import sys
import fcntl
import os

# ===========================================================================
# Example Code
# ===========================================================================

# Initialise the PWM device using the default address
pwm = PWM(0x40)
# Note if you'd like more debug output you can instead run:
#pwm = PWM(0x40, debug=True)

servoMin = 150  # Min pulse length out of 4096
servoMax = 600  # Max pulse length out of 4096
totalRange = servoMax - servoMin

servoMapping = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  'cole': 3,
  'dad': 1,
  'mom': 2,
  'grant': 0,
  'all':99
}

positionMapping = {
  'home': 0,
  'work': 350,
  'school': 240,
  'friends': 293,
  'travel': 90,
}

def setServoPulse(channel, pulse):
  pulseLength = 1000000                   # 1,000,000 us per second
  pulseLength /= 60                       # 60 Hz
  print "%d us per period" % pulseLength
  pulseLength /= 4096                     # 12 bits of resolution
  print "%d us per bit" % pulseLength
  pulse *= 1000
  pulse /= pulseLength
  pwm.setPWM(channel, 0, pulse)

def setAngle(servo, angle):
  angleRatio = float(float(angle)/360.00)
  rounded = int(round(angleRatio * totalRange));

  pwmValue = rounded + servoMin
  #print("Servo: ", servo, "Angle: ", angle, "pwmValue: ", pwmValue, angleRatio, rounded)
  pwm.setPWM(servo, 0, pwmValue)

def setTargetAndPosition(target, position):
  if target >= 0 and target < 4 and position >= 0 and position <= 360:
    pwm.setPWMFreq(60)                        # Set frequency to 60 Hz
    target = target * 4;

    # Change speed of continuous servo on channel O
    setAngle(target, position)
    time.sleep(1)
  else:
    print "Bad data for servo position: ", target, position

pwm.setPWMFreq(60)                        # Set frequency to 60 Hz
while (True):
    pwm.setAllPWM(0,0);
    pwm.setPWMFreq(60)
    lineBits = [];
    with open('/home/pi/weasley/servofifo.pipe') as fp:
      line = fp.readline();
      lineBits = line.split();
      fp.close();

    target = -1
    position = -1

    if len(lineBits) < 2:
      continue

    if lineBits[0] in servoMapping:
      target = servoMapping[lineBits[0]];
    else:
      print "Target not mapped: ", lineBits[0], servoMapping.keys()

    # Check to see if this is in the known positions.
    if lineBits[1] in positionMapping:
      position = positionMapping[lineBits[1]];
    else: 
      try:
        # Nope not in the list - must be a specific values
        position = int(lineBits[1]);
      except:
        print "Received bad position.", lineBits[1]

    if target != 99:
      setTargetAndPosition(target, position);
    else:
      setTargetAndPosition(0, position);
      setTargetAndPosition(1, position);
      setTargetAndPosition(2, position);
      setTargetAndPosition(3, position);
