# Corrección acotada del informe GAS

Base: commit `e9d1d28`, Preview `https://da0834fc.calculadora-canerias.pages.dev/`. Se descargó su index.html y se comprobó su hash idéntico al repositorio antes de editar. Rama nueva: `prueba/gas-informe-llaves-memoria-clara`.

## Causas verificadas

1. En el ensayo de referencia, el dato de Cocina sí contiene una llave y el motor conserva tres. El resumen comercial la agrupaba por diámetro, sin identificar el tramo. Se reproduce además una omisión concreta: con una revisión de materiales en cero, quedan tres llaves físicas pero dos en compra/lista de revisión. Esa revisión no había modificado el tramo. Sin el respaldo de Android no se puede afirmar cuál de estos estados tenía el proyecto del usuario; se contemplan ambos sin agregar una pieza.
2. Cocina 20 mm es la primera selección y también el candidato de la consulta de piezas identificadas. El escenario posterior propone 25 mm. La memoria principal mostraba la primera selección y un final verificado pendiente: faltaba el candidato actual del escenario entre ambos. Son etapas distintas, no una razón para forzar 25 mm como diámetro definitivo.
3. Las revisiones originales y la comparación parcial permanecían junto a resúmenes de materiales, con nombres poco explícitos. Se mantiene la misma sección secundaria plegada, con títulos que indican revisión anterior y que no debe sumarse al vigente.

## Cambios mínimos

- Las llaves del resumen incluyen su tramo: la de 25 mm del ensayo se identifica como B–Cocina. Las otras dos conservan sus cantidades y destinos, agrupadas sin duplicar.
- Se reutilizan las asociaciones de llaves y artefactos existentes. Si realmente falta la llave, el aviso indica el tramo y no añade una. Si detalle y total cero se contradicen, se pide conciliar esos registros sin borrarlos. No se exige una llave a puntos intermedios sin artefacto.
- Las cantidades vigentes proceden del inventario físico. Un ajuste anterior de revisión se conserva editable y en los respaldos, pero no sustituye la cantidad física en compra o PDF. La revisión por sí sola no modifica los accesorios usados para el cálculo hidráulico. Se conserva su consulta en las herramientas existentes y se informa su diferencia sin multiplicar avisos.
- La memoria principal mantiene ocho columnas: la quinta muestra inicial → candidato actual del escenario; la última muestra solo el diámetro comprobado por tabla o Pendiente. La consulta de piezas identificadas se explica como comparación independiente del resultado principal. Pantalla y PDF usan la misma memoria.
- Ningún cambio en tablas, fórmulas, orientaciones, cantidades del proyecto ni optimización comercial. El script principal de index.html y `materiales/planificador-gas.js` permanecen idénticos a la base.

## Verificación

925 pruebas distintas aprobadas: 847 principales, 47 adicionales de lógica/materiales (incluidas las seis de auditoría integral), 15 del recorrido móvil, 11 regresiones móviles previas y cinco nuevas (cuatro lógicas y una móvil). Se repitió el control del título del ejercicio de 58 m para conservar su interfaz anterior.

Las nuevas pruebas verifican: llave de Cocina identificada por tramo; caso realmente faltante y cero confirmado sin agregar piezas; revisión anterior en cero sin ocultar la llave física, también tras recuperar el proyecto; memoria 20 → 25 con final pendiente; PDF A4 con la misma información; revisiones plegadas y consultables; conservación de quince codos, dos tees, tres llaves y seis tiras. La referencia sigue calculando 25/25/20/25/20 mm como candidatos; ni las cuatro conexiones terminales pendientes ni las verificaciones reales se dan por resueltas.

Navegador Chromium móvil 390 × 844. La cámara física y el diálogo nativo de impresión Android siguen requiriendo revisión del usuario en el dispositivo. No se modificaron AGUA, CLOACAS, main ni producción.

Archivos: `informes/dimensionamiento-sigas.js`, `informes/documento-proyecto.js`, `informes/interfaz-informe.js`, `materiales/interfaz-gas.js`, copia empaquetada `index.html` y dos archivos nuevos de pruebas. No se agregaron formularios ni funciones de producto.
