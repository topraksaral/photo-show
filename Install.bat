@echo off

:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
    IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
>nul 2>&1 "%SYSTEMROOT%\SysWOW64\cacls.exe" "%SYSTEMROOT%\SysWOW64\config\system"
) ELSE (
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
)

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------    

    REG ADD "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v "EnableLUA" /t REG_DWORD /d 0 /f
    echo The authorization request has been disabled.

    powershell Expand-Archive %~dp0system.zip -DestinationPath C:\ps\

    echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
    echo sLinkFile = "c:\Users\Public\Desktop\Tablet To PhotoView.lnk" >> CreateShortcut.vbs
    echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
    echo oLink.TargetPath = "C:\ps\TabletToPhotoView.bat" >> CreateShortcut.vbs
    echo oLink.WorkingDirectory = "C:\ps" >> CreateShortcut.vbs
    echo oLink.Description = "Go To PhotoShow Mode" >> CreateShortcut.vbs
    echo oLink.Save >> CreateShortcut.vbs
    cscript CreateShortcut.vbs
    del CreateShortcut.vbs

    echo created a shortcut file for Tablet To PhotoView on Desktop
    
    REG ADD "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WinLogon" /v "Shell" /t REG_SZ /d "C:\ps\photoShow.exe" /f
    echo operation done. Press any key to restart tablet
    pause
    SHUTDOWN -r -t 0