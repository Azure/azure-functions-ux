if ($Env:FUNCTIONS_SLOT_NAME -eq "Production") {
    exit(0)
}

function ExecuteTemplatesBuild($buildRoot, $outPath) {      
    $scriptPath = $buildRoot + "\build.ps1"
    New-Item $outPath -Type Directory
    if (Test-Path -Path $scriptPath -PathType Leaf) {                
        try {
            Invoke-Expression "$scriptPath -target Portal"   
        }
        catch {
            Write-Output "Error executing build Script"
            Write-Output  $_.Exception|format-list -force
            Exit
        }                    
        # Move over the contents from build output to App_data
        $portalOutputFolder = $buildRoot + "\bin\portal\release\Azure.Functions.Templates.Portal\contents"                
        Move-Item $portalOutputFolder "$outPath\Templates"  
    }
    else {        
        # move the relevant items as is if there is not build        
        Move-Item "$buildRoot\Templates" $outPath
    }
    Move-Item "$buildRoot\Resources" "$outPath\Resources\" 
}

try {
    $ProgressPreference = "SilentlyContinue"
    $siteTemplates = "$Env:Home\site\wwwroot\App_Data\Templates"
    $apiUrl = "https://api.github.com/repos/azure/azure-webjobs-sdk-templates/tags"
    $repoUrl = "https://github.com/azure/azure-webjobs-sdk-templates/"
    $response = Invoke-RestMethod -Uri $apiUrl -Method GET

    if ($Env:FUNCTIONS_SLOT_NAME -eq "next") {
        $branch = "dev"
    }
    else {
        $branch = "master"
    }

    if (!(Test-Path -Path $siteTemplates -PathType Container)) {
        New-Item -Path $siteTemplates -ItemType Directory
    }

    $binDirectory = "$Env:Home\site\TemplatesBuildArtifacts\"

    # clone respective branch at the build location, if it is not already present
    $defaultTemplatesBinDirectory = $binDirectory + "default"
    if (!(Test-Path -Path $defaultTemplatesBinDirectory -PathType Container)) {
        New-Item $defaultTemplatesBinDirectory -ItemType Directory
        Start-Process git -ArgumentList "clone -b $branch $repoUrl $defaultTemplatesBinDirectory" -NoNewWindow -Wait
    }

    # if the branch is already cloned, make sure the latest code is fetched
    Set-Location $defaultTemplatesBinDirectory
    Start-Process git -ArgumentList "fetch origin" -NoNewWindow -Wait
    $hardResetBranchParameters = "reset --hard origin/$branch"
    Start-Process git -ArgumentList $hardResetBranchParameters -NoNewWindow -Wait

    # Check if the branch has build files to run
    $siteDefaultTemplates = "$siteTemplates\default"

    # delete everything in app-data template folder if running in next environment
    if ($Env:FUNCTIONS_SLOT_NAME -eq "next") {
        Remove-Item $siteTemplates -Recurse -Force
    }
    # remove templates in default folder
    else {
        Remove-Item $siteDefaultTemplates -Recurse -Force
    }
    
    # Run the templates build for dev/master branch
    Set-Location $defaultTemplatesBinDirectory
    ExecuteTemplatesBuild $defaultTemplatesBinDirectory $siteDefaultTemplates

    # Only get tags for staging environment
    if ($Env:FUNCTIONS_SLOT_NAME -eq "staging") {
        foreach ($tag in $response) {                        
            $siteTemplatesTagDirectory = $siteTemplates + "\" + $tag.name

            $tagNumber = 0;
            # For tags 1 and above run the template build if present
            if ([decimal]::TryParse($tag.name, [ref] $tagNumber) -and $tagNumber -ge 1) {
                $tagBuildDirectory = $binDirectory + $tag.name
                if (!(Test-Path -Path $tagBuildDirectory -PathType Container)) {
                    Start-Process git -ArgumentList "clone $repoUrl $tagBuildDirectory" -NoNewWindow -Wait
                }

                Set-Location $tagBuildDirectory
                Start-Process git -ArgumentList "fetch origin" -NoNewWindow -Wait
                Start-Process git -ArgumentList "fetch origin --tags" -NoNewWindow -Wait
                $sha = $tag.commit.sha
                Start-Process git -ArgumentList "reset --hard $sha" -NoNewWindow -Wait                
                ExecuteTemplatesBuild $tagBuildDirectory $siteTemplatesTagDirectory            
            }
            # For other tags just clone into app_data folder
            else {
                if (!(Test-Path -Path $siteTemplatesTagDirectory -PathType Container)) {
                    Start-Process git -ArgumentList "clone $repoUrl $siteTemplatesTagDirectory" -NoNewWindow -Wait
                }

                cd $siteTemplatesTagDirectory
                Start-Process git -ArgumentList "fetch origin" -NoNewWindow -Wait
                Start-Process git -ArgumentList "fetch origin --tags" -NoNewWindow -Wait
                $sha = $tag.commit.sha
                Start-Process git -ArgumentList "reset --hard $sha" -NoNewWindow -Wait
                cd $siteTemplates
            }        
        }
    }
}
catch {    
    Write-Output $_.Exception|format-list -force
    throw $_.Exception
}