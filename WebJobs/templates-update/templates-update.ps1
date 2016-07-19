$ProgressPreference = "SilentlyContinue"
$basePath =  "$Env:Home\site\wwwroot\App_Data\Templates"
$apiUrl = "https://api.github.com/repos/Azure/azure-webjobs-sdk-templates/tags"
$repoUrl = "https://github.com/Azure/azure-webjobs-sdk-templates/"
$response = Invoke-RestMethod -Uri $apiUrl -Method GET

if (!(Test-Path -Path $basePath -PathType Container))
{        
    New-Item -Path $basePath -ItemType Directory 
}

if (Test-Path -Path "$basePath\.git" -PathType Container)
{        
    Remove-Item -Recurse -Force ".\*"
}

cd $basePath

foreach($tag in $response)
{    
    $path = $basePath + "\" + $tag.name    
    if (!(Test-Path -Path $path -PathType Container))
    {        
        git clone $repoUrl $path
    }
        
    cd $path 
    git fetch origin        
    git reset --hard $tag.commit.sha
    cd $basePath         
}

if ($Env:FUNCTIONS_SLOT_NAME -eq "next")
{
    $branch = "dev"
}
else
{
    $branch = "master"
}

$branchPath = "$basePath\default"
if (!(Test-Path -Path $branchPath -PathType Container))
{        
    git clone -b $branch $repoUrl $branchPath    
}
        
cd $branchPath
git fetch origin        
git reset --hard origin/$branch