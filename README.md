# AiCade Code Iterator UI

Welcome to **AiCade Code Iterator** – the smart, creative way to iterate and improve your code with AI.

## 🚀 Overview

This UI empowers developers to:
- Instantly enhance code in multiple languages
- Get AI-driven suggestions and clear explanations
- Accept or reject improvements with a single click
- Enjoy a seamless, modern coding experience

## ✨ Features

- **Multi-language Monaco Editor:** Supports C++, Python, JavaScript, Java, and more.
- **Selection-based Suggestions:** Select a region of code, describe your desired change, and get targeted improvements.
- **Temporary Suggestion Preview:** Suggestions are shown as temporary blocks in the editor, clearly marked and highlighted, until you accept or reject them.
- **Effortless Integration:** Accept to replace the selected code, or reject to discard the suggestion.
- **Modern UI:** Built with Chakra UI for a clean, intuitive workflow.

## 🛠️ How It Works

1. **Pick a Language:** Select your preferred language.
2. **Paste or Write Code:** Use the Monaco editor.
3. **Select Code:** Highlight the code you want to improve.
4. **Describe Your Change:** Enter your prompt.
5. **Get Smart Suggestions:** Click "Get Improvement Suggestions".
6. **Preview & Decide:** The suggestion appears as a highlighted block below your selection.
7. **Integrate or Reject:** Accept to apply the improvement, or discard to remove the suggestion.

## ⚡ Quick Start

```bash
npm install
npm start
```
> Ensure your backend API is running at `http://localhost:8000/suggest`.

## 🧩 Tech Stack

- React
- Chakra UI
- Monaco Editor
- Axios

## 🧪 Sample Code & Prompt

You can use the following game-related sample code and prompt to test the platform:

### Example 1: Python (Guess the Number Game)

**Sample Code:**
```python
import random

number = random.randint(1, 10)
guess = int(input("Guess a number between 1 and 10: "))
if guess == number:
    print("You win!")
else:
    print("Try again!")
```

**Prompt:**
```
Add a loop so the user can keep guessing until they get the correct number. Show the number of attempts at the end.
```

---

### Example 2: C++ (Simple Score Counter)

**Sample Code:**
```cpp
#include <iostream>
int main() {
    int score = 0;
    std::cout << "Score: " << score << std::endl;
    // TODO: Add points for collecting a coin
    return 0;
}
```

**Prompt:**
```
Add code to ask the user how many coins they collected and update the score by adding 10 points per coin.
```

---

### Example 3: JavaScript (Basic Click Game)

**Sample Code:**
```javascript
let score = 0;
function clickButton() {
  score++;
  document.getElementById('score').innerText = score;
}
```

**Prompt:**
```
Add a reset button that sets the score back to zero when clicked.
```

---

Try selecting a function or block, enter the prompt, and click "Get Improvement Suggestions" to see the AI-powered enhancement!

**AiCade: Iterate smarter. Code better.**

