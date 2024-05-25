EXTEND
    SETLOC NUM1
NUM1  000123         # Initialize NUM1 with 83 (octal 123)
    SETLOC NUM2
NUM2  000002         # Initialize NUM2 with 2 (octal 002)
    BANK 0

START TC FETCH

FETCH CA NUM1        # Load NUM1 into the accumulator
      CS NUM2        # Subtract NUM2 from the accumulator
      TS RESULT      # Store the result in RESULT
      TC DONE        # Transfer control to DONE

RESULT 00000         # Initialize RESULT with 0

DONE  HANG

HANG  TC HANG        # Infinite loop to halt execution
