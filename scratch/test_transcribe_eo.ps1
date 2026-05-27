param (
    [string]$BaseUrl = "http://localhost:54321/functions/v1/transcribe-eo",
    [string]$Token,
    [string]$Email = "test_candidat@francophonie.academia",
    [string]$Password = "password123",
    [string]$AnonKey,
    [string]$ServiceRoleKey,
    [string]$StorageUrl = "http://localhost:54321/storage/v1",
    [string]$AudioPath = "test-recording.webm",
    [string]$AnswerId = "a0a80101-0000-0000-0000-000000000001",
    [string]$TaskDescription = "Sujet EO Section B : Convaincre un ami de s'inscrire à une association de bénévolat.",
    [string]$TestType = "TEF_CANADA"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST DE LA FONCTION EDGE : transcribe-eo (Expression Orale)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Résolution du Token d'authentification (User JWT)
$AuthToken = $Token
if ([string]::IsNullOrEmpty($AuthToken) -and ![string]::IsNullOrEmpty($AnonKey)) {
    Write-Host "Tentative de connexion automatique pour récupérer un token JWT..." -ForegroundColor Yellow
    $LoginUrl = "http://localhost:54321/auth/v1/token?grant_type=password"
    $Headers = @{
        "apikey" = $AnonKey
    }
    $Body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    try {
        $Response = Invoke-RestMethod -Uri $LoginUrl -Method Post -Headers $Headers -Body $Body -ContentType "application/json"
        $AuthToken = $Response.access_token
        Write-Host "Connexion réussie ! Token récupéré." -ForegroundColor Green
    } catch {
        Write-Host "Échec de la connexion automatique : $_" -ForegroundColor Red
        Write-Host "Veuillez fournir un jeton valide via le paramètre -Token." -ForegroundColor Red
    }
}

if ([string]::IsNullOrEmpty($AuthToken)) {
    Write-Host "ATTENTION : Aucun token fourni. L'appel risque de retourner une erreur 401." -ForegroundColor Yellow
    $AuthHeaderValue = "Bearer mock-invalid-token"
} else {
    $AuthHeaderValue = "Bearer $AuthToken"
}

# 2. Upload automatique du fichier audio si Service Role Key fournie
if (![string]::IsNullOrEmpty($ServiceRoleKey)) {
    $AudioLocalPath = Join-Path $PSScriptRoot "test-audio-sample.webm"
    
    # Création d'un fichier audio minimaliste si absent
    if (!(Test-Path $AudioLocalPath)) {
        Write-Host "Création d'un fichier audio factice..." -ForegroundColor Yellow
        # Quelques octets factices pour simuler un entête webm / mkv minimal
        [byte[]]$FakeAudioBytes = 0x1A, 0x45, 0xDF, 0xA3, 0x93, 0x42, 0x82, 0x88, 0x6D, 0x61, 0x74, 0x72, 0x6F, 0x73, 0x6B, 0x61
        [System.IO.File]::WriteAllBytes($AudioLocalPath, $FakeAudioBytes)
    }

    Write-Host "Téléchargement automatique du fichier audio dans le bucket local Supabase Storage..." -ForegroundColor Yellow
    $UploadUrl = "$StorageUrl/object/audio-responses/$AudioPath"
    $UploadHeaders = @{
        "Authorization" = "Bearer $ServiceRoleKey"
        "apikey"        = $ServiceRoleKey
        "x-upsert"      = "true"
    }

    try {
        $UploadResult = Invoke-RestMethod -Uri $UploadUrl -Method Post -Headers $UploadHeaders -InFile $AudioLocalPath -ContentType "audio/webm"
        Write-Host "Upload réussi dans le bucket 'audio-responses' sous la clé '$AudioPath'." -ForegroundColor Green
    } catch {
        Write-Host "Échec de l'upload de l'audio : $_" -ForegroundColor Red
        Write-Host "Assurez-vous que le bucket 'audio-responses' existe localement." -ForegroundColor Red
    }
} else {
    Write-Host "Aucune ServiceRoleKey spécifiée. Le script assume que le fichier '$AudioPath' est déjà présent dans le bucket." -ForegroundColor Yellow
}

# 3. Construction du payload de requête
$Payload = @{
    answer_id = $AnswerId
    audio_storage_path = $AudioPath
    task_description = $TaskDescription
    test_type = $TestType
} | ConvertTo-Json -Depth 5 -Compress

Write-Host "Données envoyées :" -ForegroundColor Yellow
Write-Host $Payload

# 4. Exécution de l'appel
$Headers = @{
    "Authorization" = $AuthHeaderValue
    "Content-Type"  = "application/json"
}

Write-Host "Appel de l'endpoint : $BaseUrl..." -ForegroundColor Yellow
$Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $Result = Invoke-WebRequest -Uri $BaseUrl -Method Post -Headers $Headers -Body $Payload -UseBasicParsing
    $Stopwatch.Stop()
    
    Write-Host "Statut de la réponse : $($Result.StatusCode)" -ForegroundColor Green
    Write-Host "Temps de réponse : $($Stopwatch.Elapsed.TotalSeconds) secondes" -ForegroundColor Green
    Write-Host "Corps de la réponse :" -ForegroundColor Yellow
    Write-Host $Result.Content -ForegroundColor Gray
} catch {
    $Stopwatch.Stop()
    Write-Host "Erreur lors de l'appel à la fonction Edge !" -ForegroundColor Red
    if ($_.Exception.Response) {
        $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $ResponseContent = $Reader.ReadToEnd()
        Write-Host "Statut : $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Détails : $ResponseContent" -ForegroundColor Red
    } else {
        Write-Host "Détails : $_" -ForegroundColor Red
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
