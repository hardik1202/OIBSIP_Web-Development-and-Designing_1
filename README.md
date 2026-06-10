# Calculator

A simple web-based **Calculator** built with **HTML**, **CSS**, and **JavaScript**.  


---

## Features

- Basic operations: addition, subtraction, multiplication, division, modulo
- Scientific functions: `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, power (`x^y`), square (`x²`), cube (`x³`), factorial (`n!`)
- Constants: Pi (π) and Euler's number (e)
- Random number generator
- Parentheses support for complex expressions
- **DEG / RAD** mode for trigonometry
- **Memory buttons**: MC, MR, M+, M−, MS
- **Calculation history** (saved in browser using `localStorage`)
- **Dark mode / Light mode**
- Keyboard support
- Responsive layout for mobile and desktop
- Custom expression parser (**no `eval()`** used)

---

## Demo

Open the project in your browser:

```
https://newcalculatocalcy.netlify.app

```

---

## Project Structure

```
Calculator/
├── index.html      # Main HTML page
├── style.css       # Styling and dark mode
├── script.js       # Calculator logic
├── database.sql    # Optional MySQL database (for future PHP use)

```

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and buttons |
| CSS3 | Layout, colors, grid, dark mode |
| JavaScript | Calculator logic, history, theme |
| localStorage | Save history and theme settings |
| MySQL (optional) | 

No frameworks or libraries were used.

---


## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0` – `9` | Enter numbers |
| `+` `-` `*` `/` | Operators |
| `(` `)` | Brackets |
| `.` | Decimal point |
| `Enter` | Calculate (=) |
| `Backspace` | Delete last character |
| `Escape` | Clear all (AC) |

---

## How to Use

1. Click buttons or use the keyboard to type an expression.
2. Press **=** or **Enter** to get the result.
3. Use **DEG** / **RAD** for angle mode (trigonometry).
4. Use **History** to view past calculations.
5. Click a history item to use it again.
6. Use **Dark Mode** to switch theme.

### Memory Example

1. Type `10` and press **MS** (store in memory)
2. Press **MC** to clear memory, **MR** to recall
3. **M+** adds current value to memory, **M−** subtracts

---



## Future Improvements

- [ ] Connect to PHP and MySQL for server-side history
- [ ] User login system
- [ ] More scientific functions (asin, acos, etc.)
- [ ] Export history as PDF or CSV

---

## Author

**hardik jethava**  

---

## License

This project is open source and free to use for learning purposes.

---

## Contact

If you have any questions or suggestions, feel free to open an issue on GitHub.

⭐ If you like this project, give it a star on GitHub!
