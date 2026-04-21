
def find_imbalance(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    balance = 0
    for i, line in enumerate(lines):
        for char in line:
            if char == '{': balance += 1
            elif char == '}': balance -= 1
        if balance < 0:
            print(f"Imbalance at line {i+1}: balance={balance}")
            # return
    print(f"Final balance: {balance}")

find_imbalance(r"c:\Users\1234\Documents\FYP\cre8tify\frontend\src\pages\DesignTool.tsx")
