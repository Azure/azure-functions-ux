if ($Env:FUNCTIONS_SLOT_NAME -eq "Production") {
    exit(0)
}

function ExecuteTemplatesBuild($buildRoot, $outPath) {        
    $templatesFolder = Join-Path $buildRoot -ChildPath "Functions.Templates"                
    $projectFile = Join-Path $buildRoot -ChildPath  "Functions.Templates\Functions.Templates.csproj"
    $toolsScript = Join-Path $buildRoot -ChildPath "\getTools.ps1"    

    # Execute build if the project file is present, otherwise leave things as is
    if ((Test-Path -Path $templatesFolder) -and (Test-Path -Path $projectFile -PathType Leaf)) {             
        try {
            Invoke-Expression $toolsScript
            Set-Location $templatesFolder
            Start-Process msbuild -ArgumentList $projectFile -NoNewWindow -Wait
        }
        catch {
            Write-Output "Error executing build"
            Write-Output  $_.Exception|format-list -force
            Exit
        }

        # Copy over the contents from build output to App_data
        $portalOutputFolder = Join-Path $buildRoot -ChildPath "Functions.Templates\bin\Portal\release\Azure.Functions.Templates.Portal\*"
        Remove-Item $outPath -Recurse -Force
        New-Item $outPath -Type Directory
        Copy-Item $portalOutputFolder $outPath -Recurse -Force 
    }
    else {
        Write-Output "No build file present at $projectFile"
    }
}

try {
    $ProgressPreference = "SilentlyContinue"
    $siteTemplates = "$Env:Home\site\wwwroot\App_Data\Templates"
    $apiUrl = "https://api.github.com/repos/Azure/azure-webjobs-sdk-templates/tags"
    $repoUrl = "https://github.com/Azure/azure-webjobs-sdk-templates/"
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