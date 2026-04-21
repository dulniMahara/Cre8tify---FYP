
def count_tags(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    braces = 0
    parens = 0
    div_opens = content.count('<div')
    div_closes = content.count('</div')
    
    for char in content:
        if char == '{': braces += 1
        elif char == '}': braces -= 1
        elif char == '(': parens += 1
        elif char == ')': parens -= 1
        
    print(f"Braces balance: {braces}")
    print(f"Parens balance: {parens}")
    print(f"Div balance: {div_opens - div_closes}")

count_tags(r"c:\Users\1234\Documents\FYP\cre8tify\frontend\src\pages\DesignTool.tsx")
