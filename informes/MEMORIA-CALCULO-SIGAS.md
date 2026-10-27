# Memoria de cálculo SIGAS GN

Base: 9f03966, descendiente de 7c722f4. Se conservan las correcciones posteriores de suministro separado, comprobación por tramo, transición del medidor y vías visuales de tees.

## Revisión

El motor ya reconstruye recorridos, acumula consumos, consulta la fila superior y menor columna suficiente e itera equivalencias con el diámetro local de cada pieza. La ruta de control se selecciona por longitud real más equivalentes conocidos, no por equivalentes aislados. No requiere posición de codos dentro de un tramo uniforme. No se reemplazó ese motor.

Fuentes: manual SIGAS edición 15/2025, Tabla 4 p.22 (GN, densidad 0,65, caída de referencia 10 mmca), Tabla 3 pp.24–25 (metros impresos por producto y diámetro), ejemplos pp.26–27; extracto NAG-200 5.2.8, 5.3 y 5.10 disponible en fuentes/nag200-metodo. No se recibió enlace ni transcripción del video de Juan el Gasista para un cotejo audiovisual; no se usó como fuente numérica ni normativa.

## Cambio acotado

Nueva proyección pura `memoriaCalculo(resultado)` y desplegable «Ver memoria de cálculo» en los detalles existentes. Ocho columnas en computadora, presentación vertical por tramo en móvil. La longitud base es el máximo recorrido real alimentado; la ruta final se elige por máximo total real más equivalentes, que puede ser otra. Las equivalencias mostradas son del recorrido final de control; las locales siguen en el detalle existente. No sumar esos equivalentes otra vez a la longitud base si pertenece a otra ruta.

El diámetro provisorio es el de la primera consulta sin pérdidas (semilla); el verificado es el de la última iteración convergente solo con todas las rutas alimentadas completas. «Final» significa comprobado por tabla de referencia, nunca aprobación de instalación. Los parciales se rotulan y las pérdidas desconocidas nunca se convierten en cero. Precisión interna intacta y longitudes mostradas a dos decimales.

## Ejercicio conservado y pendientes

58 m, 19 codos de90°, 2 tees, 3 llaves, 29.200 kcal/h; candidatos32/25/25/20/25 mm. M–A consulta parcial47,404 m, fila48 m; no es longitud definitiva mientras haya pérdidas sin identificar. No se cambian tablas, materiales, estimación de12 cuplas, proyectos, PDF o respaldos.

Pendientes reales del ejercicio: tee A con candidatas32/25/25 sin conjunto documentado identificado; familia/vías de tee B; variantes terminales de artefactos, tipos de llaves y codo19; inventario real de uniones/cuplas. El medidor32×¾ ya reutiliza su codo y equivalente impreso0,543 m. Datos de suministro y aprobación normativa se revisan independientemente, no bloquean una comprobación tabular completa. No se copiaron variantes del ensayo completo al proyecto de referencia.

Pruebas nuevas: proyección sin mutaciones, datos faltantes, ruta con mayor equivalente que no gobierna por total, semilla25→32 mm con100 codos documentados de ensayo y actualización de equivalentes/fila140; comprobación móvil de5 filas×8 datos, apertura, persistencia, cantidades, PDF y ausencia de desbordamiento. Los demás casos de tees, recorridos y sistemas permanecen en la suite existente.
