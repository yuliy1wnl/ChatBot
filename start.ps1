#!/usr/bin/env pwsh
# Script to start both backend and frontend services

# Stop script on first error
$ErrorActionPreference = "Stop"

# Start the backend server
$backendFolder = Join-Path $PSScriptRoot "Backend"
$backendVenv = Join-Path $backendFolder "venv"
$backendScript = Join-Path $backendFolder "main.py"

Write-Host "Starting Backend Server..." -ForegroundColor Cyan

# Check if virtual environment exists, create if not
if (-not (Test-Path $backendVenv)) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    Push-Location $backendFolder
    python -m venv venv
    Pop-Location
    
    # Activate virtual environment
    & "$backendVenv\Scripts\Activate.ps1"
} else {
    # Activate existing virtual environment
    & "$backendVenv\Scripts\Activate.ps1"
}

# Upgrade pip for better package handling
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Clean install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r "$backendFolder\requirements.txt" --no-cache-dir --ignore-installed

# Start backend in a new PowerShell window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$backendFolder'; & '$backendVenv\Scripts\Activate.ps1'; & python '$backendScript'"

# Wait a moment for backend to initialize
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Open the frontend in the default browser
$frontendPath = Join-Path $PSScriptRoot "FrontEnd\index.html"
Write-Host "Opening frontend in default browser..." -ForegroundColor Green
Start-Process $frontendPath

Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host "- Backend API is available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Frontend is now open in your browser" -ForegroundColor Cyan
Write-Host "- Close the PowerShell windows to stop the servers" -ForegroundColor Yellow
