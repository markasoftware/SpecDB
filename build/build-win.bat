@echo off
echo WARNING: You are using Windows, you scrub! The Windows version of the SpecDB build script is not well-tested.
echo If you encounter errors building a branch which you know should work, try using Linux, WSL, or a VM instead!
echo.
echo Combining specs...
node gen-specs.js ..\specs %TEMP%\specs.js ..\public\generated\sitemap.txt
echo Bundling scripts...
call ..\node_modules\.bin\browserify -r %TEMP%\specs.js:spec-data --noparse mithril --debug ..\src\js\entry.js > ..\public\generated\bundle.js
echo Bundling styles...
copy /y ..\src\css\*.css ..\public\generated\all.css >nul 2>&1
echo Build complete
