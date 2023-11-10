@echo off

echo Enter the UID of the user you want: 

set /p uid=""

node getUserInfo.cjs %uid%

PAUSE