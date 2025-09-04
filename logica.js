// Elementos DOM
const factorInput = document.getElementById('factorMultiplicacion');
const generarBtn = document.getElementById('generarBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const loader = document.getElementById('loader');
const resultadosContainer = document.getElementById('resultadosContainer');
const tablaX = document.getElementById('tablaX');
const tablaY = document.getElementById('tablaY');
const tablaNormalizada = document.getElementById('tablaNormalizada');
const xMinElement = document.getElementById('xMin');
const xMaxElement = document.getElementById('xMax');
const yMinElement = document.getElementById('yMin');
const yMaxElement = document.getElementById('yMax');

// Variables para almacenar los gráficos
let graficoNormalizado;
let graficoPromedio01;
let graficoPromedio005;
let graficoCombinado;

// Cargar el último factor utilizado desde LocalStorage
document.addEventListener('DOMContentLoaded', () => {
  const ultimoFactor = localStorage.getItem('factorMultiplicacion');
  if (ultimoFactor) {
    factorInput.value = ultimoFactor;
  }
});

// Event Listeners
generarBtn.addEventListener('click', generarDatos);
reiniciarBtn.addEventListener('click', reiniciar);

function generarDatos() {
  // Validar entrada
  const factor = parseFloat(factorInput.value);
  if (isNaN(factor)) {
    alert('Por favor, ingrese un número válido para el factor de multiplicación.');
    return;
  }

  // Guardar factor en LocalStorage
  localStorage.setItem('factorMultiplicacion', factor);

  // Mostrar loader y ocultar resultados
  loader.style.display = 'block';
  resultadosContainer.classList.add('hidden');

  // Simular proceso de cálculo
  setTimeout(() => {
    try {
      // Generar datos X aleatorios
      const datosX = generarDatosX(factor);
      mostrarTablaX(datosX);

      // Generar datos Y calculados
      const datosY = generarDatosY(datosX);
      mostrarTablaY(datosY);

      // Procesar y normalizar datos
      const {valoresXY, xMin, xMax, yMin, yMax} = procesarDatos(datosX, datosY);
      mostrarResumen(xMin, xMax, yMin, yMax);
      mostrarTablaNormalizada(valoresXY);

      // Generar promedios por rangos
      const promedios01 = generarPromediosPorRango(valoresXY, 0.1);
      const promedios005 = generarPromediosPorRango(valoresXY, 0.05);

      // Crear gráficos
      crearGraficos(valoresXY, promedios01, promedios005);

      // Ocultar loader y mostrar resultados
      loader.style.display = 'none';
      resultadosContainer.classList.remove('hidden');
    } catch (error) {
      console.error('Error al generar datos:', error);
      alert('Ocurrió un error al generar los datos. Por favor, intente de nuevo.');
      loader.style.display = 'none';
    }
  }, 1000);
}

function generarDatosX(factor) {
  // Generar matriz 3x7 de valores X aleatorios
  const datos = [];
  for (let i = 0; i < 3; i++) {
    const fila = [];
    for (let j = 0; j < 7; j++) {
      // (ALEATORIO()-ALEATORIO())*factor
      const valor = (Math.random() - Math.random()) * factor;
      fila.push(valor);
    }
    datos.push(fila);
  }
  return datos;
}

function mostrarTablaX(datos) {
  const tbody = tablaX.querySelector('tbody');
  tbody.innerHTML = '';

  datos.forEach(fila => {
    const tr = document.createElement('tr');
    fila.forEach(valor => {
      const td = document.createElement('td');
      td.textContent = valor.toFixed(4);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function generarDatosY(datosX) {
  // B5*SENO(RADIANES(B6*X+B7))
  const datosY = [];

  for (let col = 0; col < 7; col++) {
    const b5 = datosX[0][col]; // Valor en la fila 1 (índice 0)
    const b6 = datosX[1][col]; // Valor en la fila 2 (índice 1)
    const b7 = datosX[2][col]; // Valor en la fila 3 (índice 2)

    // Ahora calculamos Y para cada fila usando los valores de la columna
    const filaY = [];
    for (let fila = 0; fila < 3; fila++) {
      const x = datosX[fila][col];
      // B5*SENO(RADIANES(B6*X+B7))
      const y = b5 * Math.sin((b6 * x + b7) * Math.PI / 180);
      filaY.push(y);
    }
    datosY.push(filaY);
  }

  // Transponer los datos para que sean 3x7 (filas x columnas)
  const datosTranspuestos = [[], [], []];
  for (let col = 0; col < 7; col++) {
    for (let fila = 0; fila < 3; fila++) {
      datosTranspuestos[fila][col] = datosY[col][fila];
    }
  }

  return datosTranspuestos;
}

function mostrarTablaY(datos) {
  const tbody = tablaY.querySelector('tbody');
  tbody.innerHTML = '';

  datos.forEach(fila => {
    const tr = document.createElement('tr');
    fila.forEach(valor => {
      const td = document.createElement('td');
      td.textContent = valor.toFixed(4);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function procesarDatos(datosX, datosY) {
  // Aplanar los datos a una lista de pares (x,y)
  const valoresXY = [];
  let allX = [];
  let allY = [];

  for (let i = 0; i < datosX.length; i++) {
    for (let j = 0; j < datosX[i].length; j++) {
      const x = datosX[i][j];
      const y = datosY[i][j];
      allX.push(x);
      allY.push(y);
      valoresXY.push({ x, y });
    }
  }

  // Encontrar mínimos y máximos
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);

  // Normalizar X e Y
  valoresXY.forEach(punto => {
    punto.xNorm = (punto.x - xMin) / (xMax - xMin);
    punto.yNorm = (punto.y - yMin) / (yMax - yMin);
  });

  return {
    valoresXY,
    xMin,
    xMax,
    yMin,
    yMax
  };
}

function mostrarResumen(xMin, xMax, yMin, yMax) {
  xMinElement.textContent = xMin.toFixed(4);
  xMaxElement.textContent = xMax.toFixed(4);
  yMinElement.textContent = yMin.toFixed(4);
  yMaxElement.textContent = yMax.toFixed(4);
}

function mostrarTablaNormalizada(valoresXY) {
  const tbody = tablaNormalizada.querySelector('tbody');
  tbody.innerHTML = '';

  valoresXY.forEach(punto => {
    const tr = document.createElement('tr');
    
    const tdX = document.createElement('td');
    tdX.textContent = punto.xNorm.toFixed(4);
    tr.appendChild(tdX);
    
    const tdY = document.createElement('td');
    tdY.textContent = punto.yNorm.toFixed(4);
    tr.appendChild(tdY);
    
    tbody.appendChild(tr);
  });
}

function generarPromediosPorRango(valoresXY, anchoRango) {
  // Ordenar los puntos por xNorm
  const puntos = [...valoresXY].sort((a, b) => a.xNorm - b.xNorm);
  
  const promedios = [];
  let inicio = 0;
  
  while (inicio < 1) {
    const fin = inicio + anchoRango;
    const puntosEnRango = puntos.filter(p => p.xNorm >= inicio && p.xNorm < fin);
    
    if (puntosEnRango.length > 0) {
      const sumY = puntosEnRango.reduce((sum, p) => sum + p.yNorm, 0);
      const promY = sumY / puntosEnRango.length;
      const puntoMedio = inicio + anchoRango/2;
      
      promedios.push({
        x: puntoMedio,
        y: promY
      });
    } else {
      promedios.push({
        x: inicio + anchoRango/2,
        y: 0
      });
    }
    
    inicio = fin;
  }
  
  return promedios;
}

function crearGraficos(valoresXY, promedios01, promedios005) {
  // Destruir gráficos anteriores si existen
  if (graficoNormalizado) graficoNormalizado.destroy();
  if (graficoPromedio01) graficoPromedio01.destroy();
  if (graficoPromedio005) graficoPromedio005.destroy();
  if (graficoCombinado) graficoCombinado.destroy();
  
  // 1. Gráfico de valores normalizados
  const ctxNorm = document.getElementById('graficoNormalizado').getContext('2d');
  // Es crucial ordenar los datos por X antes de graficar la línea.
  const datosOrdenados = [...valoresXY].sort((a, b) => a.xNorm - b.xNorm);
  graficoNormalizado = new Chart(ctxNorm, {
    type: 'line', // Cambia el tipo a 'line'
    data: {
      datasets: [{
        label: 'Y normalizado vs X normalizado',
        data: datosOrdenados.map(p => ({ x: p.xNorm, y: p.yNorm })),
        borderColor: 'rgba(54, 162, 235, 1)', // Color de la línea
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        fill: false, // No rellena el área bajo la línea
        tension: 0.1, // Suaviza la línea
        pointRadius: 3 // Define el radio de los puntos
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear', // Es importante usar un tipo 'linear' para datos no categóricos
          position: 'bottom',
          title: {
            display: true,
            text: 'X Normalizado'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Y Normalizado'
          }
        }
      }
    }
  });
    
  // 2. Gráfico de promedios por rangos de 0.1
  const ctx01 = document.getElementById('graficoPromedio01').getContext('2d');
  graficoPromedio01 = new Chart(ctx01, {
    type: 'line',
    data: {
      labels: promedios01.map(p => p.x.toFixed(2)),
      datasets: [{
        label: 'Promedio Y (rangos de 0.1)',
        data: promedios01.map(p => p.y),
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // 3. Gráfico de promedios por rangos de 0.05
  const ctx005 = document.getElementById('graficoPromedio005').getContext('2d');
  graficoPromedio005 = new Chart(ctx005, {
    type: 'line',
    data: {
      labels: promedios005.map(p => p.x.toFixed(2)),
      datasets: [{
        label: 'Promedio Y (rangos de 0.05)',
        data: promedios005.map(p => p.y),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // 4. Gráfico combinado
  const ctxCombinado = document.getElementById('graficoCombinado').getContext('2d');
  const datosOrdenadosCombinado = [...valoresXY].sort((a, b) => a.xNorm - b.xNorm);
  graficoCombinado = new Chart(ctxCombinado, {
    type: 'line', // La línea que debes cambiar
    data: {
      datasets: [
        {
          label: 'Valores normalizados',
          data: datosOrdenadosCombinado.map(p => ({ x: p.xNorm, y: p.yNorm })),
          borderColor: 'rgba(54, 162, 235, 0.6)',
          backgroundColor: 'rgba(54, 162, 235, 0.3)',
          pointRadius: 3,
          fill: false,
          tension: 0.1,
          type: 'line' // Asegúrate de que este también sea 'line'
        },
        {
          label: 'Promedio (rango 0.1)',
          data: promedios01,
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.1,
          pointRadius: 5,
          type: 'line'
        },
        {
          label: 'Promedio (rango 0.05)',
          data: promedios005,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
          pointRadius: 5,
          type: 'line'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom'
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function reiniciar() {
  // Limpiar tablas
  tablaX.querySelector('tbody').innerHTML = '';
  tablaY.querySelector('tbody').innerHTML = '';
  tablaNormalizada.querySelector('tbody').innerHTML = '';
  
  // Limpiar resumen
  xMinElement.textContent = '-';
  xMaxElement.textContent = '-';
  yMinElement.textContent = '-';
  yMaxElement.textContent = '-';
  
  // Destruir gráficos
  if (graficoNormalizado) graficoNormalizado.destroy();
  if (graficoPromedio01) graficoPromedio01.destroy();
  if (graficoPromedio005) graficoPromedio005.destroy();
  if (graficoCombinado) graficoCombinado.destroy();
  
  // Ocultar resultados
  resultadosContainer.classList.add('hidden');
}