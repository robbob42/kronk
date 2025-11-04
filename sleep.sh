#!/bin/bash
# Script to put Kronk services to sleep and turn off HDMI

echo "Entering deep sleep..."
sudo systemctl stop kronk.service
sudo systemctl stop nginx.service
sudo vcgencmd display_power 0
echo "Services stopped and HDMI off."