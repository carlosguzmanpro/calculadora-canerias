/* Transcripción visual de fotografía adjunta; ver procedencia y pendientes. Sin lógica de cálculo. */
(function(root){
 const datos={
  "tabla": 18,
  "titulo": "Longitudes equivalentes de accesorios roscados",
  "unidadDiametro": "m",
  "unidadEquivalente": "m",
  "procedencia": {
    "tipo": "fotografia-del-usuario",
    "documentoDeclarado": "NAG-200, Tabla N.º 18 (atribución del usuario; edición no visible)",
    "edicion": null,
    "fotografiaDisponible": true,
    "cotejoFotografico": true,
    "vigenciaVerificada": false,
    "aplicabilidadVerificada": false,
    "archivo": "fuentes/tabla-18-347525.jpg",
    "sha256": "d9f541eb091f705c0dead916066da755f9cf2cb9a5f449be025f7dae2bad41a0",
    "alcanceCotejo": "Lectura visual de la fotografía; pendiente revisión técnica e independiente"
  },
  "transcripcionCompleta": false,
  "diametros": [
    {
      "nominal": "1/2\"",
      "diametroTabuladoM": 0.013,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "3/4\"",
      "diametroTabuladoM": 0.019,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "1\"",
      "diametroTabuladoM": 0.025,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "1 1/4\"",
      "diametroTabuladoM": 0.032,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "1 1/2\"",
      "diametroTabuladoM": 0.038,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "2\"",
      "diametroTabuladoM": 0.051,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "2 1/2\"",
      "diametroTabuladoM": 0.063,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "3\"",
      "diametroTabuladoM": 0.076,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    },
    {
      "nominal": "4\"",
      "diametroTabuladoM": 0.101,
      "interiorM": null,
      "estado": "interior-real-no-verificado",
      "estadoEncabezado": "cotejado",
      "nota": "d del encabezado fotografiado y del ejemplo; la foto no demuestra el diámetro interior real de un producto comercial"
    }
  ],
  "accesorios": [
    {
      "tipo": "codo45",
      "factorD": 14,
      "base": "diametro-del-accesorio",
      "estado": "cotejado"
    },
    {
      "tipo": "codo90",
      "factorD": 30,
      "base": "diametro-del-accesorio",
      "estado": "cotejado"
    },
    {
      "tipo": "curva",
      "factorD": 20,
      "base": "diametro-del-accesorio",
      "estado": "cotejado"
    },
    {
      "tipo": "tee-directo",
      "factorD": 20,
      "base": "diametro-de-la-via",
      "estado": "cotejado"
    },
    {
      "tipo": "tee-giro90",
      "factorD": 60,
      "base": "diametro-de-la-via",
      "estado": "cotejado"
    },
    {
      "tipo": "reduccion",
      "factorD": 10,
      "base": "diametro-menor",
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-globo",
      "factorD": 333,
      "base": "diametro-del-accesorio",
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-esclusa",
      "factorD": 7,
      "base": "diametro-del-accesorio",
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-macho",
      "factorD": 100,
      "base": "diametro-del-accesorio",
      "estado": "cotejado"
    }
  ],
  "redondeo": {
    "decimales": 2,
    "regla": null,
    "verificado": false,
    "nota": "Se conservan los valores impresos. Hay diferencias respecto a redondear cantidad × factor × d al centésimo más cercano; no se corrige la fuente automáticamente."
  },
  "metodoClase": {
    "reduccionesEnMateriales": true,
    "reduccionesEnEquivalentes": false,
    "politicaCuplas": null,
    "fuentePoliticaCuplas": null
  },
  "pendientes": [
    "Dos celdas dudosas del complemento: codo90/cantidad5/2 pulgadas y tee-directo/cantidad5/3 pulgadas",
    "Fuente, edición, vigencia y aplicabilidad no demostradas por la fotografía",
    "Los nueve d del encabezado están cotejados; no se identifican como interiores reales de un producto comercial",
    "Discrepancias de redondeo: conservar fuente y verificar criterio antes de calcular",
    "Tratamiento documentado de cuplas",
    "Aplicación de equivalencias a tees reductoras",
    "Tipo real de cada llave y compatibilidad comercial de accesorios",
    "Revisión independiente de transcripción y ejercicio completo"
  ],
  "complemento": [
    {
      "tipo": "codo90",
      "cantidad": 1,
      "equivalentesM": [
        0.39,
        0.57,
        0.75,
        0.96,
        1.14,
        1.53,
        1.89,
        2.28,
        3.03
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo90",
      "cantidad": 2,
      "equivalentesM": [
        0.78,
        1.14,
        1.5,
        1.92,
        2.28,
        3.06,
        3.78,
        4.56,
        6.06
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo90",
      "cantidad": 3,
      "equivalentesM": [
        1.17,
        1.71,
        2.25,
        2.88,
        3.42,
        4.59,
        5.67,
        6.84,
        9.09
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo90",
      "cantidad": 4,
      "equivalentesM": [
        1.56,
        2.28,
        3.0,
        3.84,
        4.56,
        6.12,
        7.56,
        9.12,
        12.12
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo90",
      "cantidad": 5,
      "equivalentesM": [
        1.95,
        2.85,
        3.75,
        4.8,
        5.7,
        null,
        9.45,
        11.4,
        15.15
      ],
      "estado": "lectura-dudosa"
    },
    {
      "tipo": "codo45",
      "cantidad": 1,
      "equivalentesM": [
        0.18,
        0.26,
        0.35,
        0.45,
        0.53,
        0.71,
        0.88,
        1.06,
        1.41
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo45",
      "cantidad": 2,
      "equivalentesM": [
        0.36,
        0.53,
        0.7,
        0.9,
        1.06,
        1.42,
        1.77,
        2.13,
        2.83
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo45",
      "cantidad": 3,
      "equivalentesM": [
        0.54,
        0.79,
        1.05,
        1.34,
        1.59,
        2.14,
        2.65,
        3.19,
        4.24
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo45",
      "cantidad": 4,
      "equivalentesM": [
        0.72,
        1.06,
        1.4,
        1.79,
        2.12,
        2.85,
        3.53,
        4.26,
        5.66
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "codo45",
      "cantidad": 5,
      "equivalentesM": [
        0.91,
        1.33,
        1.75,
        2.24,
        2.66,
        3.57,
        4.41,
        5.32,
        7.07
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-directo",
      "cantidad": 1,
      "equivalentesM": [
        0.26,
        0.38,
        0.5,
        0.64,
        0.76,
        1.02,
        1.26,
        1.52,
        2.02
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-directo",
      "cantidad": 2,
      "equivalentesM": [
        0.52,
        0.76,
        1.0,
        1.28,
        1.52,
        2.04,
        2.52,
        3.04,
        4.04
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-directo",
      "cantidad": 3,
      "equivalentesM": [
        0.78,
        1.14,
        1.5,
        1.92,
        2.28,
        3.06,
        3.78,
        4.56,
        6.06
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-directo",
      "cantidad": 4,
      "equivalentesM": [
        1.04,
        1.52,
        2.0,
        2.56,
        3.04,
        4.08,
        5.04,
        6.08,
        8.08
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-directo",
      "cantidad": 5,
      "equivalentesM": [
        1.3,
        1.9,
        2.5,
        3.2,
        3.8,
        5.1,
        6.3,
        null,
        10.1
      ],
      "estado": "lectura-dudosa"
    },
    {
      "tipo": "tee-giro90",
      "cantidad": 1,
      "equivalentesM": [
        0.78,
        1.14,
        1.5,
        1.92,
        2.28,
        3.06,
        3.78,
        4.56,
        6.06
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-giro90",
      "cantidad": 2,
      "equivalentesM": [
        1.56,
        2.28,
        3.0,
        3.84,
        4.56,
        6.12,
        7.56,
        9.12,
        12.12
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-giro90",
      "cantidad": 3,
      "equivalentesM": [
        2.34,
        3.42,
        4.5,
        5.76,
        6.84,
        9.18,
        11.34,
        13.68,
        18.18
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-giro90",
      "cantidad": 4,
      "equivalentesM": [
        3.12,
        4.56,
        6.0,
        7.68,
        9.12,
        12.24,
        15.12,
        18.24,
        24.24
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "tee-giro90",
      "cantidad": 5,
      "equivalentesM": [
        3.9,
        5.7,
        7.5,
        9.6,
        11.4,
        15.3,
        18.9,
        22.8,
        30.3
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-macho",
      "cantidad": 1,
      "equivalentesM": [
        1.3,
        1.9,
        2.5,
        3.2,
        3.8,
        5.1,
        6.3,
        7.6,
        10.1
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-macho",
      "cantidad": 2,
      "equivalentesM": [
        2.6,
        3.8,
        5.0,
        6.4,
        7.6,
        10.2,
        12.6,
        15.2,
        20.2
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-macho",
      "cantidad": 3,
      "equivalentesM": [
        3.9,
        5.7,
        7.5,
        9.6,
        11.4,
        15.3,
        18.9,
        22.8,
        30.3
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-macho",
      "cantidad": 4,
      "equivalentesM": [
        5.2,
        7.6,
        10.0,
        12.8,
        15.2,
        20.4,
        25.2,
        30.4,
        40.4
      ],
      "estado": "cotejado"
    },
    {
      "tipo": "valvula-macho",
      "cantidad": 5,
      "equivalentesM": [
        6.5,
        9.5,
        12.5,
        16.0,
        19.0,
        25.5,
        31.5,
        38.0,
        50.5
      ],
      "estado": "cotejado"
    }
  ],
  "celdasDudosas": [
    {
      "tipo": "codo90",
      "cantidad": 5,
      "columna": "2\"",
      "valor": null,
      "lecturaParcial": "7,6?",
      "motivo": "Último dígito y discrepancia con 5 × 30 × 0,051. Solicitar ampliación; no completar por fórmula."
    },
    {
      "tipo": "tee-directo",
      "cantidad": 5,
      "columna": "3\"",
      "valor": null,
      "lecturaParcial": "7,6?",
      "motivo": "Último dígito y discrepancia con 5 × 20 × 0,076. Solicitar ampliación; no completar por fórmula."
    }
  ],
  "ejemploFotografiado": {
    "tipo": "codo90",
    "cantidad": 2,
    "nominal": "3/4\"",
    "diametroTabuladoM": 0.019,
    "factorD": 30,
    "equivalenteM": 1.14,
    "estado": "cotejado"
  },
  "segundaRevisionIndependiente": false
};
 if(typeof module==='object'&&module.exports)module.exports=datos;else root.TABLA_NAG200_18=datos;
})(globalThis);
