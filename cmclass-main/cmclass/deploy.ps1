# Ask for a commit message
$commitMessage = Read-Host "Enter commit message"

# Stage all changes (new, modified, deleted files)
git add .

# Commit changes
git commit -m "$commitMessage"

# Push to main branch
git push origin main

Write-Host "✅ Changes pushed to GitHub!"
