# weasley
The weasly clock implementation

For this to work you need to create a fifo named: servofifo.pipe

Its built using Adafruit's servo shield.

Also - mpg123 should be installed and there should be a config file for Alsa specifying which audio device the gongs should be played through.

A simple config is:
defaults.pcm.card 1
defaults.ctl.card 1

Where 1 is the number you see for the output in:
aplay -l

For config tools install:
sudo apt install alsa-utils