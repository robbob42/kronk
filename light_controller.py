import os
import time
from gpiozero import DigitalInputDevice
from signal import pause

# --- CONFIGURATION ---
GPIO_PIN = 4    # GPIO pin 4
STATE_FILE = "/tmp/kronk_display.state"

def write_state(state):
    """Writes 'bright' or 'dim' to the state file."""
    try:
        with open(STATE_FILE, "w") as f:
            f.write(state)
        print(f"State set to: {state}")
    except IOError as e:
        print(f"Error writing state file: {e}")

def light_is_dim():
    """Called when the sensor detects dimness (pin goes HIGH)."""
    print("Sensor: Light is DIM")
    write_state("dim")

def light_is_bright():
    """Called when the sensor detects light (pin goes LOW)."""
    print("Sensor: Light is BRIGHT")
    write_state("bright")

# --- INITIALIZATION ---
print("Starting light controller...")

# Check if we are in mock mode
is_mock_mode = os.environ.get('GPIOZERO_PIN_FACTORY') == 'mock'

try:
    if is_mock_mode:
        # In mock mode, we CANNOT use pull_down
        print("Running in MOCK mode.")
        sensor = DigitalInputDevice(GPIO_PIN)
    else:
        # On the Pi, we NEED pull_down for the sensor
        print("Running in HARDWARE mode.")
        sensor = DigitalInputDevice(GPIO_PIN, pull_down=True)
    
    sensor.when_activated = light_is_dim    # Pin went HIGH (dim)
    sensor.when_deactivated = light_is_bright # Pin went LOW (bright)

    # Set initial state
    if sensor.is_active:
        light_is_dim()
    else:
        light_is_bright()

    print("Controller is running. Waiting for sensor events.")
    pause() # Keep the script alive

except Exception as e:
    print(f"Error initializing GPIO: {e}")
    if not is_mock_mode:
        print("Is the lgpio daemon running? (sudo systemctl start lgpiod)")
    print("Falling back to running without sensor.")
    write_state("bright") # Default to bright if sensor fails
    pause()