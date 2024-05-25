EXTEND
SETLOC NUM1
NUM1 000000         # Initialize NUM1 (will be loaded from ROM)
SETLOC NUM2
NUM2 000000         # Initialize NUM2 (will be loaded from ROM)
BANK 1
SETLOC RESULT
RESULT 000000       # Initialize RESULT with 0

BANK 0
START TC FETCH

FETCH CA ROM_NUM1   # Load ROM_NUM1 into the accumulator
      TS NUM1       # Store it in NUM1
      CA ROM_NUM2   # Load ROM_NUM2 into the accumulator
      TS NUM2       # Store it in NUM2

      CA NUM1       # Load NUM1 into the accumulator
      AD NUM2       # Add NUM2 to the accumulator
      BANK 1
      TS RESULT     # Store the result in RESULT (RAM bank 1)
      TC DONE       # Transfer control to DONE

DONE  HANG

HANG  TC HANG       # Infinite loop to halt execution

ROM_NUM1 0001       # Address of the first number in ROM
ROM_NUM2 0002       # Address of the second number in ROM
