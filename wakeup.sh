#!/bin/bash
# Script to wake Kronk services and turn on HDMI

echo "Waking up from sleep..."
sudo vcgencmd display_power 1
sudo systemctl start nginx.service
sudo systemctl start kronk.service
echo "HDMI on and services started."