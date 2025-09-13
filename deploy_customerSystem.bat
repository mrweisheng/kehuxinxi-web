chcp 65001
@echo off
setlocal enabledelayedexpansion

echo ================================
echo 客户信息系统 - 构建与部署脚本
echo ================================

:: 构建项目
echo 开始构建项目...
call npm run build

:: 检查构建结果
if not exist ".\dist" (
  echo 构建失败，未生成dist目录！
  pause
  exit /b 1
)

:: 清理服务器旧文件
echo 正在清理服务器旧文件...
ssh root@47.113.177.228 "rm -rf /var/www/customer-system-web/*"

:: 上传新文件
echo 正在上传新文件...
scp -r .\dist\* root@47.113.177.228:/var/www/customer-system-web/

:: 自动修正权限，确保nginx可访问
echo 正在修正服务器文件权限...
ssh root@47.113.177.228 "chown -R www-data:www-data /var/www/customer-system-web && find /var/www/customer-system-web -type d -exec chmod 755 {} \; && find /var/www/customer-system-web -type f -exec chmod 644 {} \;"

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ================================
  echo        部署成功完成!
  echo ================================
  echo.
  echo 可以访问: http://47.113.177.228/customerSystem/
) else (
  echo.
  echo ================================
  echo        部署过程出现错误!
  echo ================================
)

pause 