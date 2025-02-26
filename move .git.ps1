
$gitpath=Read-Host ".git path"
$repopath=Read-Host "repo path"

$env:GIT_DIR=$gitpath
$env:GIT_WORK_TREE=$repopath

[System.Environment]::SetEnvironmentVariable("GIT_DIR",$gitpath,"User")
[System.Environment]::SetEnvironmentVariable("GIT_WORK_TREE",$repopath,"User")

git status
