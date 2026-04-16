# CipherFlow - Node Cipher

**CipherFlow** is an AWESOME SITE FOR CREATING CIPHERS using interactive visual node-based programming. Like in Blender or Scratch. You can easily save and share your schemas

## ✨ Core Features

### Implemented Functions

- **ꙮ The cool node editor itself** - like geometry nodes in Blender, convenient, easy, and beautiful
- **Ԫ Encryption/Decryption mode** - Not only encrypts, but also decrypts! So you can conveniently exchange encrypted texts with friends, for example
- **Ꚙ Lots of different encryption algorithms** (the app has more detailed descriptions for each cipher):
  - **Caesar Cipher** with an adjustable shift
  - **Vigenère Cipher** polyalphabetic encryption with a keyword
  - **Morse Code** with improved support for Russian (the letter ё) and English languages
  - **Planet Enchanter** - encryption via coordinates of world cities. (M - Moscow)
  - **A1Z26 Cipher** - replacing letters with numbers
  - **Morse (Binary)** - encoding into 0 and 1
  - **Morse (Cat)** - like Morse, but with meow mrrow
  - **Multi-replacement** - multiple replacements by rules
  - **Atbash Cipher** - mirror replacement of letters in the alphabet
  - **Base64** - standard encoding/decoding
  - **Shark Cipher** - encoding through repetitions of the character "a"
  - **UwU-ficator (Cutie Cipher)** - transformation into a "cute" language
  - Number to word conversion (Russian/English)
  - Mathematical operations on numbers
  - Text reversal
  - Case changing
  - and much more!

- **⨭Autosave!** - automatic saving of your work
- **Cool UI/UX** - different themes and smooth animations

### Project Structure

```
CipherFlow/
├── index.html              # Main page
├── css/
│   └── style.css          # Main application styles
├── js/
│   ├── main.js           # Main application file
│   ├── nodes.js          # Node management system
│   ├── connections.js    # Connection system
│   ├── cipher-engine.js  # Encryption engine
│   └── file-manager.js   # File management
└── README.md             # Documentation
```

## HOW TO RUN?

1. Open `index.html` in a web browser (Definitely works in Chrome and Firefox)
2. Done!

### Basic Actions

1. **Creating nodes**: Drag a node from the left panel to the workspace
2. **Connecting nodes**: Click on an output point and drag it to an input point
3. **Configuring parameters**: Change values in the node fields
4. **Entering text**: Enter text in the bottom panel or in the "Text Input" node
5. **Viewing the result**: The result is displayed on the right side of the bottom panel

## Hotkeys (work half the time)

| Keys | Action | Russian Layout |
|---------|----------|-------------------|
| `Ctrl/Cmd + S` | Save schema with a name dialog | `Ctrl + Ы` |
| `Ctrl/Cmd + O` | Load schema | `Ctrl + Щ` |
| `Ctrl/Cmd + N` | New schema | `Ctrl + Т` |
| `Ctrl/Cmd + C` | Copy selected nodes | `Ctrl + С` |
| `Ctrl/Cmd + V` | Paste nodes | `Ctrl + М` |
| `Ctrl/Cmd + A` | Select all nodes | `Ctrl + Ф` |
| `Ctrl/Cmd + Z` | Undo action | - |
| `Ctrl/Cmd + Y` | Redo action | - |
| `Delete` | Delete selected node | - |
| `Escape` | Deselect / Cancel connection | - |
| `F1` | Show help | - |
| `X` | Toggle connection cutting mode | `Ч` |
| `+` / `=` | Zoom in | `Ъ` |
| `-` | Zoom out | - |
| `Ctrl/Cmd + 0` | Reset zoom | - |


## Operating Modes

**Encryption mode**:
- Data flows from left to right
- Algorithms work in the forward direction

**Decryption mode**:
- The direction of arrows changes
- Algorithms are automatically inverted
- For example, a Caesar cipher with a +3 shift becomes a -3 shift

## Schema File Format

Schemas are saved in JSON format and contain:

```json
{
  "version": "1.0",
  "created": "2024-01-01T00:00:00.000Z",
  "nodes":[
    {
      "id": "node_0",
      "type": "input",
      "x": 100,
      "y": 100,
      "data": { ... }
    }
  ],
  "connections":[
    {
      "id": "connection_0",
      "from": "node_0",
      "to": "node_1"
    }
  ]
}
```

## Technologies ( •̀ ω •́ )✧

- **HTML5** - application structure
- **CSS3** - modern design with CSS Grid, Flexbox, animations
- **Vanilla JavaScript** - pure JS without frameworks
- **SVG** - vector graphics for connections
- **Web APIs** - File API, localStorage, drag & drop

## 🌟 Usage Examples

### 1. Simple encryption
```
[Input] → [Caesar Cipher] → [Output]
```

### 2. Complex chain
```
[Input] → [Numbers to words] → [Caesar Cipher] → [Morse Code] →[Output]
```

### 3. Vigenère Cipher with a keyword
```
[Input] →[Text]    ↘
                     [Vigenère Cipher] → [Output]
[Secret word]  ↗
```

## Development Plans
- **Mobile version** - improve adaptability and add touch screen support
- **Online functions** - cloud saving of schemas, a gallery of encryption schemas
- **Achievements/Easter eggs** - Add more easter eggs and achievements
- **Code structure improvements** - Rewrite the cipher engine to make it more flexible, stable, and scalable 


# Visit demo
- https://biolog-end.github.io/CipherFlow/
