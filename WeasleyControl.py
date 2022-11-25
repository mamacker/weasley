#!/usr/bin/python3
from adafruit_servokit import ServoKit
kit = ServoKit(channels=16)
import time
import sys
import fcntl
import os
import math

# ===========================================================================
# Example Code
# ===========================================================================

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
  'work': 315,
  'school': 230,
  'friends': 270,
  'travel': 90,
  'exercise': 40,
}

rangeMapping = [
  { #grant
      'home': 0,
      'work': 315,
      'school': 230,
      'friends': 270,
      'travel': 90,
      'exercise': 40,
      'min': 600,
      'max': 2650
  },
  { #dad
      'home': 0,
      'work': 220,
      'school': 230,
      'friends': 270,
      'travel': 90,
      'exercise': 40,
      'min': 600,
      'max': 4096
  },
  { #mom
      'home': 0,
      'work': 315,
      'school': 230,
      'friends': 270,
      'travel': 90,
      'exercise': 40,
      'min': 600,
      'max': 2650
  },
  { #cole
      'home': 0,
      'work': 315,
      'school': 230,
      'friends': 270,
      'travel': 90,
      'exercise': 40,
      'min': 600,
      'max': 2650
  }
]

MAX_POSITION=360
servoMin = 600  # Min pulse length out of 4096
servoMax = 2650  # Max pulse length out of 4096

def setAngle(servo, angle):
  print("Setting angle for :", servo, angle);
  kit.servo[servo].set_pulse_width_range(servoMin, servoMax);
  kit.servo[servo].set_pulse_width_range(rangeMapping[math.floor(servo/4)]["min"], rangeMapping[math.floor(servo/4)]["max"]);
  kit.servo[servo].actuation_range = MAX_POSITION 
  kit.servo[servo].angle = angle

def setTargetAndPosition(target, position):
  print("Target", target)
  print("Postion", position)
  if target >= 0 and target < 4 and position >= 0 and position <= MAX_POSITION:
    target = target * 4;
    # Change speed of continuous servo on channel O
    setAngle(target, position)
    time.sleep(1)
  else:
    print("Bad data for servo position: ", target, position)

while (True):
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
      print("Target not mapped: ", lineBits[0], servoMapping.keys())

    # Check to see if this is in the known positions.
    print("Position:", target, lineBits[1]);
    if lineBits[1] in positionMapping:
      position = rangeMapping[target][lineBits[1]];
    else: 
      try:
        # Nope not in the list - must be a specific values
        position = int(lineBits[1]);
      except:
        print("Received bad position.", lineBits[1])

    if target != 99:
      setTargetAndPosition(target, position);
    else:
      setTargetAndPosition(0, position);
      setTargetAndPosition(1, position);
      setTargetAndPosition(2, position);
      setTargetAndPosition(3, position);
