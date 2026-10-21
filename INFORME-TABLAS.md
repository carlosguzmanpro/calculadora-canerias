# Revisión de tablas N.º 3 y N.º 18

Base: `prueba/metodo-clase-acero-epoxi`, commit `ad082dc`.
Rama de esta entrega: `prueba/tablas-nag200-revision`.

## Disponibilidad y procedencia

No llegaron fotografías adjuntas en este turno y no se encontraron imágenes/PDF de las tablas en el proyecto. Se registraron exclusivamente los números escritos por el usuario. Documento declarado: NAG-200, Tablas 3 y 18. **Edición, vigencia y aplicabilidad pendientes de cotejo**. No se atribuyen a una edición concreta ni se declara que sean normativa vigente.

## Inventario de valores

- Tabla 3: **12 capacidades** (4 longitudes × 3 diámetros), almacenadas en **L/h**. Los doce controles coinciden exactamente con el mensaje. Las longitudes transcritas son 40, 50, 65 y 100 m; columnas 1/2, 3/4 y 1 pulgada.
- Tabla 18: **9 coeficientes d**: 14, 30, 20, 20, 60, 10, 333, 7 y 100 para los tipos indicados por el usuario. Los nueve coinciden exactamente con el mensaje.
- Total: **21 números técnicos declarados**, comprobados automáticamente contra los controles escritos. **0 valores cotejados contra fotografías**. No se cuentan como capacidades/coeficientes los encabezados, longitudes ni condiciones.
- Pendientes: todas las demás filas/columnas presentes en las imágenes (cantidad todavía desconocida), los **3 diámetros interiores** correspondientes a las columnas registradas, las equivalencias tabuladas redondeadas y el criterio de redondeo, títulos/notas/edición, aplicabilidad de tees reductoras y criterio para cuplas. Si las fotos muestran más diámetros, se agregarán sin suponer sus interiores.

Los campos desconocidos quedan nulos o pendientes. Una celda dudosa debe marcarse `null`, con estado pendiente; no se reemplaza por cero, interpolación o una fila más lejana. Los datos no forman un catálogo habilitado para el motor.

## Validación y consultas

Las comprobaciones detectan filas incompletas, longitudes duplicadas/desordenadas, unidades equivocadas, capacidades no positivas o no numéricas, capacidad que aumenta con la longitud o disminuye al aumentar el diámetro, accesorios duplicados, interiores incompatibles y revisión incompleta. Una prueba de monotonicidad no demuestra que una cifra coincida con la fuente.

La consulta provisional de los datos declarados selecciona la primera longitud superior disponible, sin interpolar ni extrapolar. **Las cuatro filas parciales no permiten determinar cuál es la fila inmediata superior de la tabla original completa**. Por eso esta consulta se usa para pruebas de datos, nunca para dimensionar automáticamente la red. El registro de catálogos habilitados sigue vacío.

Conversión explícita: kcal/h ÷ 9300 → m³/h; × 1000 → L/h. Para capacidades: L/h ÷ 1000 → m³/h. No hay redondeo intermedio. Se muestra L/h por tramo en el informe de clase. No se generan longitudes equivalentes numéricas sin los interiores y el redondeo de la fotografía. Tampoco se asimila una llave genérica a una válvula macho/globo/esclusa.

Las reducciones se mantienen en materiales, excluidas de equivalentes **solo por particularidad expresa del método de clase**. El coeficiente físico declarado 10 d del diámetro menor queda registrado; la exclusión no significa pérdida nula. No se duplica una reducción ya resuelta mediante una tee reductora.

## Resultados comprobados y pendientes

Pasan **124 pruebas**: las 107 anteriores, conservadas, y 17 nuevas (100 de aplicación, 14 de datos y 10 del intermediario desactivado). Incluyen la revisión local sin red, bloqueo del motor y continuidad de carga manual si falta un archivo de datos.

Con los datos del ejercicio y suponiendo longitudes individuales: recorridos reales de 24, 29 y 36 m; iniciales de 39, 44 y 51 m. Consumos por tramo:

|Tramo|kcal/h|m³/h, aproximado para mostrar|L/h, aproximado para mostrar|
|---|---:|---:|---:|
|M–A|29200|3,139785|3139,784946|
|A–Termotanque|16000|1,720430|1720,430108|
|A–B|13200|1,419355|1419,354839|
|B–Calefactor|3000|0,322581|322,580645|
|B–Cocina|10200|1,096774|1096,774194|

Estas conversiones y recorridos están comprobados. Los diámetros esperados del ejercicio permanecen como referencias, **sin comparación numérica definitiva superada**: faltan equivalencias reales, identificación de accesorios/vías, catálogo compatible y tablas completas cotejadas. Las pruebas de iteración del motor siguen usando datos ficticios claramente aislados; no certifican estos diámetros ni una instalación real. La comprobación visual de esta entrega en Android queda pendiente.

## Archivos

Nuevos: `datos/tabla-3.js`, `datos/tabla-18.js`, `datos/validacion-tablas.js`, `tests/tablas.test.cjs` y este informe. Datos separados de la lógica: los dos primeros archivos contienen únicamente declaraciones de datos y su envoltorio de carga local, sin cálculos.

Modificados: `index.html` (carga local y pantalla de revisión, L/h), `tests/basic.test.cjs` (carga de archivos y tres pruebas nuevas), `package.json` (incluye pruebas de tablas), `README.md`, `PRUEBA-ANDROID.txt` y `FUENTES-DIMENSIONAMIENTO.md`.

## Siguiente paso

Adjuntar las dos fotografías legibles y completas con encabezados/notas y fuente/edición; aportar el croquis con accesorios y vías de tees identificados. Completar/cotejar las tablas, verificar redondeos e interiores y comparar el motor con el ejercicio resuelto antes de construir y habilitar un catálogo. La vigencia normativa y las condiciones de suministro requieren verificación independiente para una instalación real. No se conectó Gemini ni se desplegaron servicios.
