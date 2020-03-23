@echo off

set added=0
set removed=0

for /f "tokens=1-3 delims= " %%A in ('git log --pretty^=tformat: --numstat --no-merges --author^=%1 9aa863b2ed37b3c0e6c6b1021174c864a13868bd..2d8bcd7a92bef53f31890e21dafbffa393cdd518') do call :Count %%A %%B %%C

@echo added=%added%
@echo removed=%removed%
goto :eof

:Count
  if NOT "%1" == "-" set /a added=%added% + %1
  if NOT "%2" == "-" set /a removed=%removed% + %2
goto :eof