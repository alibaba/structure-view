# Structure-View
Structure View for [ATOM](https://atom.io/) editor, just like Outline view in Eclipse or Structure tool window in IDEA / WebStorm, provides quick navigation for symbols of source code with a tree view.

![demo](https://user-images.githubusercontent.com/8896124/30044182-61ee94c6-922e-11e7-8181-10122681a1d9.gif)

*Pull requests are welcomed! Raise an issue [here](https://github.com/alibaba/structure-view/issues) if you have any question.*

## Table of Contents

- [Installation](#installation)
- [Language Support](#language-support)
- [Usage](#usage)
- [Settings](#settings)
- [Contribution](#contribution)
- [License](#license)
- [TODO](#todo)




## Installation

Two ways to install:

- From command line:

```bash
apm install structure-view
```

- From Atom editor:

  Settings/Preferences ➔ Packages ➔ Search for `structure-view`




## Language Support

| Lanuage    | File Extensions                          | AST Parser                               |
| ---------- | ---------------------------------------- | ---------------------------------------- |
| HTML       | `.html` , `.njk` , `.xtpl` , ...         | [htmlparser2](https://github.com/fb55/htmlparser2) |
| CSS        | `.css`                                   | [css](https://github.com/reworkcss/css)  |
| Javascript | `.js`                                    | [esprima](http://esprima.org/) / [jsctags](https://github.com/ramitos/jsctags) |
| Others     | `.coffe` , `.less` , `.scss` , `.sass` , `.yaml` , `.yml` , `.md` , `.markdown` , `.mdown` , `.mkd` , `.mkdown` , `.ron` , `.json` , `.cson` , `.gyp` , `.c` , `.cpp` , `.mm` , `.rb` , `.php` , `.module` , `.go` , `.pl` , `.pod` , `.es6` , `.jsx` , `.es` , `.hx` , `.nim` , `.rs` , `.lc` , `.livecodescript` , `.irev` , `.sql` , `.bdy` , `.spc` , `.pls` , `plb` , `.ddl` , `.pks` , `.pkb` , `.sce` , `.sci` , `.m` , `.kla` , `.ini` | [ctags](http://ctags.sourceforge.net/)   |



## Usage

#### Commands

You can find all these commands by [`Command Palette`](http://flight-manual.atom.io/getting-started/sections/atom-basics/).

- `Structure View: Hide`
- `Structure View: Show`
- `Structure View: Toggle`

#### Shortcut

- `Ctrl-o` : `Structure View: Toggle`




## Settings

| Feature                | Description                              | Default |
| ---------------------- | ---------------------------------------- | ------- |
| Autoscroll from Source | Enable this feature to have Atom automatically move the focus in the Structure View to the node that corresponds to the code where the cursor is currently positioned in the editor. | False   |



## Icon alphabet meaning

##### HTML

- `<>` : Element

##### CSS

- `S` : Selector
- `P` : Property

##### Javascript

- `C` : Class
- `I` : Import
- `F` : Function
- `M` : Method
- `V` : Variable

#### Others

- `U` : Unknown



## TODO

See [`TODO.md`](./TODO.md).



## Contributing

- Universal tag generator comes from [symbols-tree-view](https://github.com/xndcn/symbols-tree-view)




## License

MIT
