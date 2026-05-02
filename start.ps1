# FoodHub - Start both servers
Write-Host "Starting FoodHub..." -ForegroundColor Cyan

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers starting..." -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Cyan
Write-Host "  Customer: customer@demo.com / password123"
Write-Host "  Owner:    owner@demo.com / password123"
Write-Host "  Courier:  courier@demo.com / password123"
