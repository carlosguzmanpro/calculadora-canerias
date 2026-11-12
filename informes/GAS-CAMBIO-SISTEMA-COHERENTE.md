# GAS: cambio coherente de sistema

Base: `1454b29`. Reproducción: instalación SIGAS de cinco tramos, 20,60 m y 21.800 kcal/h; cambiar a EPOXI.

## Causa

`seleccionarCatalogoSistemaGas` modificaba `catalogoTecnicoGas`, pero solo asignaba material y unión si ambos estaban vacíos. El proyecto conservaba «Acero-polietileno SIGAS Thermofusión / Thermofusión» al seleccionar EPOXI o FUSIOGAS. El plan de materiales se regeneraba con esas etiquetas anteriores. El perfil incoherente añadía incompatibilidades al diagnóstico técnico. No era únicamente una pantalla sin refrescar.

## Corrección

- Una selección explícita actualiza la familia y la unión, incluidos los campos del editor avanzado. No modifica longitudes, consumos, nodos, accesorios, orientaciones, roscas, imagen ni cortes.
- Las descripciones previas quedan en `historialSistemasGas`. No se transfieren productos ni equivalencias SIGAS a otro fabricante.
- Al recuperar un respaldo, solo se repara la contradicción conocida entre las tres familias canónicas; las descripciones personalizadas no se reinterpretan por suposición.
- Se conserva el largo comercial configurado, incluso si antes era implícito. Debe comprobarse su disponibilidad para el nuevo producto; no equivale a una compra definitiva.
- La invalidación y regeneración existentes vuelven a producir materiales y diagnósticos para el sistema activo. No se agrega otro motor ni otra fórmula.

## Resultados y límites

El ciclo SIGAS → FUSIOGAS → EPOXI → SIGAS conserva 20,60 m, 21.800 kcal/h, 15 codos, dos tees y tres llaves. Al volver a SIGAS se recuperan los candidatos 25/25/20/25/20 mm bajo las mismas condiciones del ensayo.

- **SIGAS:** se mantiene el motor tabular y su separación entre escenario, datos identificados, suministro y aprobación normativa.
- **FUSIOGAS:** tiene datos documentales propios de GN (p.19), GLP (p.20), equivalencias (p.18) y productos (pp.28–30). Su adaptador sigue sin validación técnica habilitada, sin regla de longitud/redondeo verificada y sin vinculación completa de piezas al motor general. El cambio de etiquetas no completa ese trabajo. No se usan tablas SIGAS para obtener diámetros FUSIOGAS.
- **EPOXI:** las Tablas 3 y 18 se conservan separadas; siguen pendientes edición, aplicabilidad, condiciones e interiores reales, además de discrepancias documentales y criterio de cuplas. No hay catálogo de dimensionamiento definitivo aprobado en el registro existente. No se inventa un diámetro para eliminar el pendiente.

Pruebas: ciclo en ambos modos, materiales y PDF de cada sistema, reapertura, corrección del respaldo con el error conocido, preservación de datos físicos y configuración manual, foto y selectores de Cámara/Galería existentes, impresión y cortes.

No se modifican tablas originales, fórmulas, main ni producción. Los diámetros definitivos siguen sujetos a las verificaciones técnicas correspondientes.
