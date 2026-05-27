param (
    [string]$BaseUrl = "http://localhost:54321/functions/v1/correct-ee",
    [string]$Token,
    [string]$Email = "test_candidat@ayeprep.com",
    [string]$Password = "password123",
    [string]$AnonKey,
    [string]$AnswerId = "a0a80101-0000-0000-0000-000000000001",
    [string]$SessionId = "s0a80101-0000-0000-0000-000000000001",
    [string]$Text = "Le télétravail obligatoire est un sujet qui suscite de nombreux débats au sein de la société moderne. À mon avis, imposer le télétravail à tous les employés n’est pas une solution viable à long terme, même si cela présente des avantages indéniables. D’une part, le télétravail permet de réduire considérablement les temps de trajet, ce qui offre aux salariés une meilleure qualité de vie et diminue leur fatigue quotidienne. De surcroît, sur le plan écologique, la baisse des déplacements contribue à réduire l’empreinte carbone globale des entreprises. D’autre part, l’obligation rigide pose problème. L’isolement social est un risque majeur pour la santé mentale des travailleurs, qui perdent le contact humain et la cohésion d’équipe. De plus, tout le monde ne dispose pas d’un espace de travail adapté à domicile, ce qui peut nuire à la productivité et accentuer les inégalités. En définitive, il convient de privilégier un modèle hybride et flexible plutôt qu’une obligation stricte.",
    [string]$TaskType = "texte_argumentatif",
    [string]$TestType = "TEF_CANADA",
    [string]$TaskDescription = "Sujet : Pour ou contre le télétravail obligatoire ? Rédigez un texte argumentatif d'au moins 150 mots.",
    [int]$MinWords = 150,
    [int]$MaxWords = 250
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST DE LA FONCTION EDGE : correct-ee (Expression Écrite)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Résolution du Token d'authentification
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
    # Si aucun token n'est fourni, on utilise une valeur fictive pour tester le retour Unauthorized (401)
    Write-Host "ATTENTION : Aucun token fourni. L'appel risque de retourner une erreur 401." -ForegroundColor Yellow
    $AuthHeaderValue = "Bearer mock-invalid-token"
} else {
    $AuthHeaderValue = "Bearer $AuthToken"
}

# 2. Construction du payload de requête
$Payload = @{
    answer_id = $AnswerId
    session_id = $SessionId
    text = $Text
    task_type = $TaskType
    test_type = $TestType
    task_description = $TaskDescription
    target_words = @{
        min = $MinWords
        max = $MaxWords
    }
} | ConvertTo-Json -Depth 5 -Compress

Write-Host "Données envoyées :" -ForegroundColor Yellow
Write-Host $Payload

# 3. Exécution de l'appel
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
