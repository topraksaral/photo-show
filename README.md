# photo-show

I developed this project for my lenovo microsoft windows 10 tablet with atom processor, which is sitting in the corner and useless, and this project is my first electron project. (Actually, it consists of a single page on the electron side, but okay :) ) It was developed on macOS and it works fine on macOS, except for operating system-specific operations such as returning to tablet mode. (Possibly it can also run on the linux kernel.)

With this app you can turn your old useless tablet into a capable digital picture frame.

![im1](https://serhatsaral.com/photoshow/im1.png)
![im2](https://serhatsaral.com/photoshow/im2.png)
![im3](https://serhatsaral.com/photoshow/im3.png)

By examining the sample clock module, you can develop your own modules and add them to the screen. Example clock module: https://github.com/topraksaral/photo-show-clock-module

# Installation (For Microsoft Windows 10):
- Compile the library with electron
- Move the assembly into the c:\ps\ folder (Make sure the executable name is photoShow.exe)
- In Regedit, set the EnableLUA variable in HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System to "0". (This operation is required for switching to tablet mode, switching to PhotoShow mode.)
- In Regedit, set the shell variable in the HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WinLogon folder to "C:\ps\photoShow.exe" (For the application to run in kiosk mode on the tablet)
- You need ffmpeg

- if you want you can download the release and you can run install.bat.

# Helps

When you need it, you can switch to tablet mode with the "Go Tablet Mode" button by touching the main screen of the system. (You can set the shell variable in HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WinLogon folder as "explorer.exe" in regedit from the task manager application to be opened with CTRL+ALT+DEL to switch to tablet mode in case of application inaccessibility and crashes.)

To switch back to Photo View mode, you can run the TabletToPhotoView.bat file in the project or set the shell variable in the HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WinLogon folder to "C:\ps\photoShow.exe" in regedit.

You can get the control panel access address and check the wifi connections from the window that opens by touching the main screen. (the wifi controls are not adequately tested.)

Default control panel password: 123456
