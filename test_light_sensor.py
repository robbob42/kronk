from gpiozero import DigitalInputDevice
from time import sleep

# gpiozero defaults to BCM pin numbering, so no 'setmode' is needed.
# The pin is automatically configured as an input when you create the object.
input_pin = DigitalInputDevice(4)

# Loop 5 times
for _ in range(10):
    # 1. 'print' is now a function, so it needs parentheses.
    # 2. You read the pin's state using the .value property.
    #    This will print True (for high) or False (for low).
    print(input_pin.value)
    
    # It's good practice to add a small delay in a hardware loop
    # to prevent it from consuming 100% CPU.
    sleep(0.5)