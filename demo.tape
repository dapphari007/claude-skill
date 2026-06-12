# demo.tape — regenerate the README GIF with:  vhs demo.tape
# Requires VHS: https://github.com/charmbracelet/vhs  (brew install vhs / winget install charmbracelet.vhs)
Output demo.gif

Set Shell bash
Set FontSize 18
Set Width 1180
Set Height 620
Set Padding 24
Set Theme "Catppuccin Mocha"

# Setup (hidden): build once and alias the local CLI to `cs`.
Hide
Type "npm run build >/dev/null 2>&1; alias cs='node dist/cli.js'; clear" Enter
Show

Sleep 800ms
Type "# A vague description? create-claude-skill catches it." Enter Sleep 1200ms
Type "cs new payment-flow --description 'a helper for various stuff'" Sleep 500ms Enter
Sleep 3s
Type "clear" Enter

Type "# Sharpen it, and it scores 95/100 — ready to ship." Enter Sleep 1200ms
Type "cs validate skills/escalate-smart" Sleep 500ms Enter
Sleep 3500ms
