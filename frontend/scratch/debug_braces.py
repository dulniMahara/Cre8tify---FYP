
def check_balance(filepath):
    balance = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            for char in line:
                if char == '{':
                    balance += 1
                elif char == '}':
                    balance -= 1
            if balance < 0:
                print(f"Balance went negative at line {i}: {line.strip()}")
                return
    print(f"Final balance: {balance}")

check_balance('src/pages/DesignTool.tsx')
