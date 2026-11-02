'use strict';
const { execFile } = require('node:child_process');
const path = require('node:path');
const script = `
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$warnings = New-Object 'System.Collections.Generic.List[string]'
function Read-Section($label, $class, $props) {
  try { Get-CimInstance -ClassName $class -ErrorAction Stop | Select-Object -Property $props }
  catch { $warnings.Add($label + ': ' + $_.Exception.Message) }
}
$cpu = @(Read-Section 'CPU' 'Win32_Processor' @('Name','Manufacturer','NumberOfCores','NumberOfLogicalProcessors','MaxClockSpeed'))
$gpu = @(Read-Section 'GPU' 'Win32_VideoController' @('Name','DriverVersion','VideoProcessor','ConfigManagerErrorCode'))
$ram = @(Read-Section 'RAM' 'Win32_PhysicalMemory' @('Manufacturer','PartNumber','Capacity','Speed','ConfiguredClockSpeed'))
$board = @(Read-Section 'Carte mere' 'Win32_BaseBoard' @('Manufacturer','Product','Version'))
$bios = @(Read-Section 'BIOS' 'Win32_BIOS' @('Manufacturer','SMBIOSBIOSVersion'))
$disks = @(Read-Section 'Disques' 'Win32_DiskDrive' @('Model','Size','InterfaceType','MediaType'))
$system = @(Read-Section 'Systeme' 'Win32_ComputerSystem' @('Manufacturer','Model','TotalPhysicalMemory'))
$os = @(Read-Section 'Windows' 'Win32_OperatingSystem' @('Caption','Version','BuildNumber','OSArchitecture'))
$driverProps = @('DeviceName','DeviceClass','DriverProviderName','DriverVersion','IsSigned',@{Name='DriverDate';Expression={if ($_.DriverDate) {$_.DriverDate.ToString('yyyy-MM-dd')} else {$null}}})
$drivers = @(Read-Section 'Pilotes' 'Win32_PnPSignedDriver' $driverProps)
[ordered]@{schemaVersion=1;scannedAt=[DateTime]::UtcNow.ToString('o');cpu=$cpu;gpu=$gpu;ram=$ram;board=$board;bios=$bios;disks=$disks;system=$system;os=$os;drivers=$drivers;warnings=@($warnings.ToArray());updateStatus='not_checked'} | ConvertTo-Json -Depth 7 -Compress
`;
function scanHardware() {
  if (process.platform !== 'win32') return Promise.reject(new Error('Detection disponible uniquement sous Windows.'));
  const powershell = path.join(process.env.SystemRoot || 'C:\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  return new Promise((resolve, reject) => {
    execFile(powershell, ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
      { windowsHide: true, timeout: 90000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' },
      (error, stdout) => {
        if (error) return reject(new Error(error.killed ? 'Scan interrompu apres le delai maximal.' : 'Lecture Windows impossible : ' + error.message));
        try {
          const result = JSON.parse(stdout.replace(/^\uFEFF/, '').trim());
          if (result.schemaVersion !== 1 || !Array.isArray(result.gpu) || !Array.isArray(result.drivers)) throw new Error('Format inattendu');
          resolve(result);
        } catch { reject(new Error('Resultat Windows illisible. Aucun diagnostic ne peut etre conclu.')); }
      });
  });
}
module.exports = { scanHardware };
