if ($Env:FUNCTIONS_SLOT_NAME -eq "Production")
{    
    exit(0)
}
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
    Remove-Item -Recurse -Force "$basePath\*"
}

cd $basePath

foreach($tag in $response)
{    
    $path = $basePath + "\" + $tag.name    
    if (!(Test-Path -Path $path -PathType Container))
    {   
        Start-Process git -ArgumentList "clone $repoUrl $path" -NoNewWindow -Wait 
    }
        
    cd $path 
    Start-Process git -ArgumentList "fetch origin" -NoNewWindow -Wait        
    $sha = $tag.commit.sha
    Start-Process git -ArgumentList "reset --hard $sha" -NoNewWindow -Wait
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
    Start-Process git -ArgumentList "clone -b $branch $repoUrl $branchPath"  -NoNewWindow -Wait    
}
        
cd $branchPath
Start-Process git -ArgumentList "fetch origin" -NoNewWindow -Wait        
Start-Process git -ArgumentList "reset --hard origin/$branch" -NoNewWindow -Wait