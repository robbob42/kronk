import os
import time
from gpiozero import DigitalInputDevice
from signal import pause

# --- CONFIGURATION ---
GPIO_PIN = 4    # Using GPIO4 (physical pin 7)
STATE_FILE = "/tmp/kronk_display.state"

def write_state(state):
    """Writes 'bright' or 'dim' to the state file."""
    try:
        with open(STATE_FILE, "w") as f:
            f.write(state)
        print(f"State set to: {state}", flush=True)
    except IOError as e:
        print(f"Error writing state file: {e}", flush=True)

def light_is_dim():
    """Called when the sensor detects dimness (pin goes HIGH)."""
    print("Sensor: Light is DIM", flush=True)
    write_state("dim")

def light_is_bright():
    """Called when the sensor detects light (pin goes LOW)."""
    print("Sensor: Light is BRIGHT", flush=True)
    write_state("bright")

# --- INITIALIZATION ---
print("Starting light controller...", flush=True)

try:
    # The correct argument is pull_up=False to enable the pull-down resistor.
    # This works in both mock and hardware modes.
    sensor = DigitalInputDevice(
        GPIO_PIN, 
        pull_up=False, 
        bounce_time=1.0
    )
    
    sensor.when_activated = light_is_dim    # Pin went HIGH (dim)
    sensor.when_deactivated = light_is_bright # Pin went LOW (bright)

    # Set initial state
    if sensor.is_active:
        light_is_dim()
    else:
        light_is_bright()

    print("Controller is running. Waiting for sensor events.", flush=True)
    pause() # Keep the script alive

except Exception as e:
    print(f"Error initializing GPIO: {e}", flush=True)
    print("Falling back to running without sensor.", flush=True)
    write_state("bright") # Default to bright if sensor fails
    pause()