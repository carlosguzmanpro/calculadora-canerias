# Resultado técnico y materiales de GAS

Base b75f168. Rama prueba/gas-resultado-pdf-unificado.

El botón CALCULAR CAÑERÍA conserva su función y los cálculos existentes. El
resultado manual contiene la planilla técnica de seis columnas y los materiales.
En móvil la misma planilla se muestra en tarjetas para no ocultar columnas.

Pantalla y PDF comparten el modelo derivado del plan vigente. No se vuelve a
planificar una lista de compra durante la impresión. La caché se invalida por
proyecto, plan, red, perfil y asignaciones técnicas; no se guarda un formato nuevo
ni se modifica el JSON de los proyectos.

REAL es el tramo físico. EQUIVALENTE solo tiene un valor completo cuando los
aportes del tramo están respaldados y completos; los parciales se identifican como
conocidos con resto pendiente. DEFINITIVO de esta presentación es REAL + ese
EQUIVALENTE completo, y queda pendiente cuando falta. No reemplaza la longitud de
recorrido del motor usada para seleccionar candidatos. Recorridos, capacidades,
iteraciones y controles SIGAS/FUSIOGAS permanecen en los detalles desplegables.

La clasificación de cantidades ya existente se aplica al resumen, sin añadir
piezas: ejercicio 58 m, 16 codos comunes + 3 terminales fusión–rosca, 2 tees y 3
llaves. Se conservan las medidas pendientes y los ceros efectivamente declarados.
Cuplas sin datos suficientes quedan pendientes; reducciones por dimensionamiento
y pieza exacta del medidor no se inventan. No se asignan los candidatos a la compra
como diámetros definitivos.

Si ajustes manuales o varios diámetros impiden distribuir con certeza los codos,
se conservan las filas y cantidades originales, sin forzar el desglose.

GENERAR PDF COMPLETO imprime ambos apartados y conserva artefactos, aclaraciones
y foto original disponible. Se retiraron las acciones de impresión duplicadas;
sus funciones internas siguen disponibles. CSV permanece en opciones secundarias.
El informe A4 deja continuar tablas en otra página y repite sus encabezados; no
fuerza una sola hoja para proyectos mayores o con fotografías.

Verificación: regresiones de cálculos, datos, PDF, CSV, fotografías y respaldos;
prueba de caché por proyecto y de ausencia de planificación duplicada al imprimir.
El ejercicio sin foto se verificó visualmente en PDF A4 de una página. La nueva
prueba móvil/desktop comprueba ambas secciones, pendientes, ausencia de controles
en el PDF y las cantidades 58/16+3/2/3.

## Un solo PDF (base 88a58ab)

Rama prueba/gas-pdf-unico. Se retira de la interfaz el apartado inferior Documento
PDF de entrega, su revisión y su casilla. El acceso secundario PDF lleva al botón
GENERAR PDF COMPLETO existente. No se agregan botones ni apartados.

La fotografía sigue siendo opcional y se incluye sin exigir confirmación. Se
conservan fotos y metadatos históricos de respaldos, sin recrear los controles
retirados. Los errores de imagen utilizan los avisos existentes. Las pruebas de
confirmaciones anteriores ahora verifican compatibilidad de datos legados; no
simulan que esa casilla siga disponible en la interfaz actual.

Verificación: 718 pruebas automáticas y cuatro comprobaciones de navegador,
incluido PDF sin foto y con foto. Sin cambios en motor, datos técnicos, accesorios,
materiales, tratamiento de tees ni cabecera principal compacta.
