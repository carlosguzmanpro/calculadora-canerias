# Tees por recorrido · croquis nuevo

Base revisada: `prueba/gas-decimales-destinos`, `c6faef8`.

La configuración y el motor existentes permiten este caso. No se modificaron la aplicación, las tablas ni los proyectos de ejemplo. Se agrega cobertura de regresión para las conexiones descritas por el usuario.

## Circulación a registrar cuando se cargue la instalación

| Tee | Entrada desde el medidor | Salida | Vía |
|---|---|---|---|
| A | M–A | A–B | Giro de 90° |
| A | M–A | A–Calefactor | Paso directo |
| B | A–B | B–Cocina | Giro de 90° |
| B | A–B | B–Termotanque | Giro de 90° |

Cocina–Termotanque no es un recorrido de alimentación desde M. Que esas dos bocas puedan estar alineadas no cambia las dos vías de giro desde A.

Cada tee es una pieza física única, aunque aporte a varios recorridos. El codo posterior a A hacia el calefactor es otra pieza, a contabilizar una sola vez entre los codos declarados. El giro dentro de una tee no crea un codo adicional. Los aproximadamente 40 cm no se guardan ni se suman como longitud nueva.

## Controles existentes

1. Seleccionar el proyecto y SIGAS.
2. Cargar los tramos con sus longitudes reales cuando estén disponibles; registrar cada tee física una sola vez.
3. Abrir **Revisar tramos cargados**. Junto a la tee aparece **Circulación de tee…**, con un selector **Desde… hacia…** para cada salida.
4. Elegir **A través (paso directo)** o **A 90° (giro)**. Se reutiliza el registro por proyecto `calculoSigas.tees[identidad].viasPorTramo` y el guardado/recalculo existentes.
5. Revisar el modelo físico y las medidas cuando se conozcan. Indicar circulación no confirma una tee reductora, bujes ni equivalencias desconocidas.

Si no se identifican las tres conexiones y una entrada inequívoca, el control conserva un aviso pendiente. No hace falta conocer la posición exacta de cada codo en un tramo de diámetro uniforme para sumar equivalencias.

## Pruebas nuevas

`tests/tees-croquis-nuevo.test.cjs` representa únicamente la topología y los accesorios expresamente descritos. No contiene longitudes, consumos ni diámetros asignados a la instalación nueva.

Los ensayos parametrizados recorren diámetros y equivalencias del catálogo original para verificar el resolvedor, sin seleccionar un diámetro para este proyecto. Comprueban cuatro vías, inventario físico sin duplicaciones, codo independiente, ausencia de recorrido cocina–termo, incógnitas sin pérdida cero, propuestas reductoras sin confirmación y separación entre fabricantes/proyectos.

No se creó un proyecto real ni se alteraron el ejercicio de 58 m, Casa 1 o el caso de 25,40 m. No se añadieron orientaciones automáticas globales ni se publicó una versión.

Los productos utilizados por los ensayos de catálogo tampoco representan una selección de piezas para la instalación nueva: su variante real permanece por identificar cuando corresponda.

Validación de esta rama: 82 pruebas relacionadas con tees (75 anteriores + 7 nuevas), 18 regresiones de decimales y conservación de ejemplos, y 4 comprobaciones móviles emuladas. Todas aprobadas. No equivale a dimensionamiento ni aprobación de una instalación real.
