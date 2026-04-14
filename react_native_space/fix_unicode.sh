#!/bin/bash

# Función para reemplazar códigos Unicode por caracteres reales
fix_unicode() {
  local file="$1"
  # Hacer respaldo
  cp "$file" "$file.bak"
  
  # Reemplazar códigos Unicode comunes en español
  sed -i 's/\\u00f3/ó/g' "$file"  # ó
  sed -i 's/\\u00f1/ñ/g' "$file"  # ñ
  sed -i 's/\\u00bf/¿/g' "$file"  # ¿
  sed -i 's/\\u00ed/í/g' "$file"  # í
  sed -i 's/\\u00e1/á/g' "$file"  # á
  sed -i 's/\\u00e9/é/g' "$file"  # é
  sed -i 's/\\u00fa/ú/g' "$file"  # ú
  sed -i 's/\\u00a1/¡/g' "$file"  # ¡
  sed -i 's/\\u00c1/Á/g' "$file"  # Á
  sed -i 's/\\u00c9/É/g' "$file"  # É
  sed -i 's/\\u00cd/Í/g' "$file"  # Í
  sed -i 's/\\u00d3/Ó/g' "$file"  # Ó
  sed -i 's/\\u00da/Ú/g' "$file"  # Ú
  sed -i 's/\\u00d1/Ñ/g' "$file"  # Ñ
}

# Buscar todos los archivos .tsx y .ts
find app/ src/ -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Verificar si el archivo contiene códigos Unicode
  if grep -q '\\u00' "$file"; then
    echo "Corrigiendo: $file"
    fix_unicode "$file"
  fi
done

echo "✅ Corrección completada"
