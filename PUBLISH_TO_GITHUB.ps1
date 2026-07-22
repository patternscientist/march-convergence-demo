param(
  [string]$RepositoryUrl = "https://github.com/patternscientist/march-convergence-demo.git"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed or is not on PATH."
}

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
  git config user.name "D. D. Poindexter, Jr"
  git config user.email "noitcartsba@proton.me"
  git add .
  git commit -m "Extract March convergence animation as standalone StoryMap embed"
}

$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  git remote set-url origin $RepositoryUrl
} else {
  git remote add origin $RepositoryUrl
}

git branch -M main
git push -u origin main

Write-Host "Pushed to $RepositoryUrl"
Write-Host "Next: open the repository's Settings > Pages and deploy from main / (root)."
