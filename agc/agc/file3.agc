    EXTEND
    SETLOC NUM1
NUM1  000003         # Initialize NUM1 with 3 (octal 003)
    SETLOC NUM2
NUM2  000005         # Initialize NUM2 with 5 (octal 005)
    BANK 0

START TC FETCH

FETCH CA NUM1        # Load NUM1 into the accumulator
      AD NUM2        # Add NUM2 to the accumulator
      TS RESULT      # Store the result in RESULT
      TC DONE        # Transfer control to DONE

RESULT 00000         # Initialize RESULT with 0

DONE  HANG

HANG  TC HANG        # Infinite loop to halt execution
