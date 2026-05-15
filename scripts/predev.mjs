/**
 * predev.mjs
 * Prepara el entorno WSL antes de arrancar next dev:
 * 1. Mata cualquier proceso Windows que tenga el puerto 3000
 * 2. Limpia el lock de Next.js si existe
 * 3. Crea el directorio .next/dev/ si no existe
 */

import { execSync } from "child_process"
import { existsSync, readFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const lockPath = join(root, ".next", "dev", "lock")
const devDir = join(root, ".next", "dev")

// 1. Matar proceso Windows en puerto 3000
try {
  const result = execSync(
    `powershell.exe -Command "(netstat -ano | Select-String ':3000 ') | ForEach-Object { ($_ -split '\\\\s+')[-1] } | Select-Object -First 1"`,
    { stdio: "pipe" }
  ).toString().trim()

  if (result && !isNaN(result)) {
    execSync(`powershell.exe -Command "Stop-Process -Id ${result} -Force -ErrorAction SilentlyContinue"`, { stdio: "pipe" })
    console.log(`✓ Proceso Windows en :3000 (PID ${result}) detenido`)
  }
} catch { /* sin proceso en ese puerto */ }

// 2. Limpiar lock si existe
if (existsSync(lockPath)) {
  try {
    const { pid } = JSON.parse(readFileSync(lockPath, "utf8"))
    if (pid) {
      execSync(`powershell.exe -Command "Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue"`, { stdio: "pipe" })
    }
  } catch { }
  try {
    execSync(`rm -f "${lockPath}"`, { stdio: "pipe" })
  } catch { }
  console.log("✓ Lock eliminado")
}

// 3. Asegurar que .next/dev/ existe
if (!existsSync(devDir)) {
  mkdirSync(devDir, { recursive: true })
}
