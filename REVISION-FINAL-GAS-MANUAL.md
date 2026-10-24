# GAS manual: versión local para revisión

Base: `prueba/cierre-gas-manual`, commit `4251607`. Sin publicación, despliegue, fusión ni cambios en main/producción.

## Funciones verificadas

Una carga manual, un botón habitual **Calcular materiales**, una lista consolidada y detalle por tramo opcional. EPOXI, SIGAS y FUSIOGAS conservan catálogos independientes. La carga manual, fotografías/croquis, proyectos, edición, guardado, JSON, PDF con seis columnas, CSV, AGUA y CLOACAS continúan disponibles. No hay servicios nuevos ni dependencias de internet.

Ejemplo reproducible en `diagnosticos/cierre-gas-cinco-tramos.json`, ahora para los tres sistemas y con el perfil utilizado registrado:

| Tramo | Real m | Codos 90° declarados | Tees | Llaves | Consumo acumulado kcal/h |
|---|---:|---:|---:|---:|---:|
| M–A | 15 | 7 | 1 | 0 | 29200 |
| A–B | 5 | 1 | 1 | 0 | 13200 |
| A–Termo | 9 | 1 | 0 | 1 | 16000 |
| B–Calefactor | 16 | 4 | 0 | 1 | 3000 |
| B–Cocina | 13 | 5 | 0 | 1 | 10200 |
| Total físico / demanda total | **58** | **18** | **2** | **3** | **29200** |

La demanda total no es la suma de consumos de tramos compartidos. Recorridos: Termo 24 m, Calefactor 36 m y Cocina 33 m. Son longitudes físicas, no equivalentes ni longitudes definitivas de dimensionamiento. Con 9300 kcal/m³ aportados para el ejercicio, cada caudal es consumo/9300, sin imponer ese valor como dato del suministro real.

Se mantiene íntegra la regla del casillero: con entrada lateral/posterior confirmada y codo declarado no incluido, el total pasa a 19. Con entrada superior, desconocida o codo ya incluido, no se añade otra pieza. No se crean nuevas reglas para cuplas, uniones dobles, entrerroscas u otras conexiones del medidor. El conteo sigue separado del dimensionamiento.

## Correcciones acotadas

1. La fixture del ejemplo asignaba por defecto material epoxi/roscado a FUSIOGAS. Se corrigió únicamente la fixture para usar FUSIOGAS/Thermofusión; el diagnóstico de referencia se amplió a tres sistemas. No se migraron ni reescribieron proyectos de usuarios.
2. El aviso de estado negaba que se hubieran agregado accesorios incluso al contar el codo autorizado del casillero. Ahora informa ese caso correctamente, sin cambiar la regla ni cantidades.
3. El detalle secundario mostraba «ubicación pendiente» para piezas sin tramo asignado aunque tenían una ubicación conocida, como el interior del casillero M. Ahora conserva y muestra la ubicación disponible.
4. Las comprobaciones técnicas largas quedan en un desplegable adicional dentro de «Datos técnicos pendientes». La lista principal sigue única; se conservan los accesos avanzados y todas las advertencias.
5. Se aclaró que los consumos acumulados no aplican reducción por simultaneidad. No se añadió un factor técnico ni se cambió el cálculo.

## Fuentes y límites técnicos

- EPOXI: fotografías originales de Tablas 3/18 conservadas; capacidades en L/h. Edición/aplicabilidad/interiores comerciales y discrepancias de equivalentes siguen pendientes. No hay tabla GLP propia incorporada.
- SIGAS ed.15/2025: GN Tabla 4 p.22, propano Tabla 5 p.23, equivalentes Tabla 3 pp.24–25. Los ejemplos pp.26–27 son de prolongaciones. No se los adopta automáticamente como procedimiento completo de una red interior. Persisten 24 diferencias de N°Ø, reductor 75–32 duplicado y tres capacidades propano a 75 m pendientes de aclaración técnica.
- FUSIOGAS V.1.2026: condiciones generales p.17, equivalentes p.18, GN p.19, GLP p.20 y productos pp.28–30. Persisten cuatro diferencias de N° de diámetros y correspondencias de productos que requieren aclaración. Se conservan los valores impresos propios.
- La referencia del propietario a NAG-200, capítulo V, 5.2.8, 5.3 y 5.10, se registra como pendiente de cotejo con texto original y edición aplicable: el documento completo no está incorporado entre las fuentes disponibles. Las fotografías del apéndice y menciones en manuales no sustituyen ese cotejo. No se inventaron prescripciones de esos apartados.
- Ninguna tabla se modificó. No se aplicaron +15 m ni exclusión de reducciones de la clase EPOXI a SIGAS/FUSIOGAS. No se convirtieron longitudes físicas en longitudes normativas verificadas.

Diámetros definitivos bloqueados. Para habilitarlos faltan método y regla de longitud validados por sistema/combustible, condiciones reales de suministro y presupuesto de presión, poder calorífico/densidad y fuentes, tipos y vías de accesorios, tratamiento técnico de cuplas/reducciones y validación independiente con ejercicios resueltos. La caída tabulada no es presión de suministro. Las pruebas de software no certifican una instalación.

## Pruebas

- **640 casos automatizados aprobados**: se conservan los 637 anteriores y se agregan tres regresiones. El caso completo se amplía a FUSIOGAS con perfil propio. Incluyen redes desordenadas/invertidas, consumos, materiales, regla 18/19, fotos, PDF/CSV, respaldos, proyectos y AGUA/CLOACAS.
- **Una prueba adicional Chromium móvil 390×844 aprobada**, tres sistemas, edición, un botón habitual, lista única, comprobaciones plegadas, cambio de combustible y casillero. Es emulación táctil, no Android físico. El navegador del entorno carga el HTML autónomo en memoria, sin peticiones HTTP: persistencia real HTTPS requiere prueba manual posterior.
- Extracciones de SIGAS y FUSIOGAS cotejadas con sus PDF originales; auditorías y diagnóstico de los tres sistemas reproducibles. Esto comprueba integridad documental y aritmética, no validación normativa.
- Comandos: `npm test`; ejecución detallada con `node --test --test-isolation=none` y los mismos archivos de npm test; `npm run verificar:sigas:fuente`; `npm run verificar:fusiogas:fuente`; `npm run verificar:cierre:gas`; `npm run test:browser:cierre`.

## Puerta de publicación

La versión manual queda preparada localmente para revisión. Antes de publicar: comprobar en Android mediante una vista de prueba autorizada, guardar/reabrir dos proyectos con foto, editar/cambiar tramos, recuperar un JSON y revisar PDF/CSV. La vista de prueba y la publicación requieren autorización; no se configuraron ni actualizaron en esta etapa.

Puede revisarse/publicarse posteriormente la función manual con sus límites explícitos, sin presentar diámetros pendientes como resueltos. No hace falta retirar funciones ni desbloquear cálculos técnicos para utilizar los materiales manuales válidos.
