# Update and embed the meeting demo

## Update the existing local repository

From PowerShell:

```powershell
$repo = "$HOME\Documents\march-convergence-demo"
$zip = "$HOME\Downloads\march-convergence-demo-v2.zip"
$stage = Join-Path $env:TEMP "march-convergence-demo-v2"

Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $zip -DestinationPath $stage -Force

Set-Location $repo
Get-ChildItem -LiteralPath $stage -Force |
    Copy-Item -Destination $repo -Recurse -Force
Remove-Item $stage -Recurse -Force

py scripts/validate.py
git status --short
git add -A
git commit -m "Harden StoryMap embed accessibility and layout"
git push
```

GitHub Pages redeploys automatically from `main`.

## Public URLs

Standalone page:

```text
https://patternscientist.github.io/march-convergence-demo/
```

Compact StoryMap embed:

```text
https://patternscientist.github.io/march-convergence-demo/?embed=1
```

Frame simulator:

```text
https://patternscientist.github.io/march-convergence-demo/test/storymap-frame.html
```

## StoryMap

Use the normal root URL in an Embed block. The page detects the StoryMap iframe and activates compact mode automatically; the `?embed=1` URL is only a direct compact-preview option. Select interactive/live presentation and Large size. In Embed options, allow direct interaction and include the open-in-new-tab button. Select Live for small screens after checking phone and tablet previews.
