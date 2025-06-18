# userinput.py
while True:
    user_input = input("prompt: ")
    if user_input.lower() == "stop":
        break
    print(f"You entered: {user_input}") 