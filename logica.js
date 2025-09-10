// Elementos DOM
const factorInput = document.getElementById('factorMultiplicacion');
const generarBtn = document.getElementById('generarBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const loader = document.getElementById('loader');
const resultadosContainer = document.getElementById('resultadosContainer');
const tablaCoeficientes = document.getElementById('tablaCoeficientes');
const tablaY = document.getElementById('tablaY');
const tablaNormalizada = document.getElementById('tablaNormalizada');
const tablaPromedio01 = document.getElementById('tablaPromedio01');
const tablaPromedio005 = document.getElementById('tablaPromedio005');
const xMinElement = document.getElementById('xMin');
const xMaxElement = document.getElementById('xMax');
const yMinElement = document.getElementById('yMin');
const yMaxElement = document.getElementById('yMax');

let graficoNormalizado;
let graficoPromedio01;
let graficoPromedio005;
let graficoCombinado;

generarBtn.addEventListener('click', generarDatos);
reiniciarBtn.addEventListener('click', reiniciar);

function generarDatos() {

  const factor = parseFloat(factorInput.value);
  if (isNaN(factor)) {
    alert('Por favor, ingrese un número válido para el factor de multiplicación.');
    return;
  }

  loader.style.display = 'block';
  resultadosContainer.classList.add('hidden');

  setTimeout(() => {
    try {
      const coeficientes = generarCoeficientes(factor);
      mostrarTablaCoeficientes(coeficientes);

      const datosY = generarDatosY360(coeficientes);
      mostrarTablaY(datosY);

      const {valoresXY, xMin, xMax, yMin, yMax} = procesarDatos(datosY);
      mostrarResumen(xMin, xMax, yMin, yMax);
      mostrarTablaNormalizada(valoresXY);

      const promedios01 = generarPromediosPorRango(valoresXY, 0.1);
      const promedios005 = generarPromediosPorRango(valoresXY, 0.05);
   
      mostrarTablaPromedios(promedios01, tablaPromedio01);
      mostrarTablaPromedios(promedios005, tablaPromedio005);

      crearGraficos(valoresXY, promedios01, promedios005);

      loader.style.display = 'none';
      resultadosContainer.classList.remove('hidden');
    } catch (error) {
      console.error('Error al generar datos:', error);
      alert('Ocurrió un error al generar los datos. Por favor, intente de nuevo.');
      loader.style.display = 'none';
    }
  }, 1000);
}

function generarCoeficientes(factor) {
  const coeficientes = [];
  for (let i = 0; i < 3; i++) {
    const fila = [];
    for (let j = 0; j < 7; j++) {
      const valor = (Math.random() - Math.random()) * factor;
      fila.push(valor);
    }
    coeficientes.push(fila);
  }
  return coeficientes;
}

function mostrarTablaCoeficientes(coeficientes) {
  const tbody = tablaCoeficientes.querySelector('tbody');
  tbody.innerHTML = '';

  coeficientes.forEach(fila => {
    const tr = document.createElement('tr');
    fila.forEach(valor => {
      const td = document.createElement('td');
      td.textContent = valor.toFixed(6);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function generarDatosY360(coeficientes) {
  const datosY = [];
  
  for (let i = 0; i < 360; i++) {
    const fila = [];
    let sumatoria = 0;
    
    for (let j = 0; j < 7; j++) {
      const b5 = coeficientes[0][j]; // Primera fila de coeficientes
      const b6 = coeficientes[1][j]; // Segunda fila de coeficientes  
      const b7 = coeficientes[2][j]; // Tercera fila de coeficientes
    
      const x = i;
      
      const y = b5 * Math.sin((b6 * x + b7) * Math.PI / 180);
      
      fila.push(y);
      sumatoria += y;
    }
    
    fila.push(sumatoria); // Agregar sumatoria como columna final
    datosY.push(fila);
  }
  
  return datosY;
}

function mostrarTablaY(datosY) {
  const tbody = tablaY.querySelector('tbody');
  tbody.innerHTML = '';

  datosY.forEach(fila => {
    const tr = document.createElement('tr');
    fila.forEach((valor, index) => {
      const td = document.createElement('td');
      if (index === fila.length - 1) {
        // Última columna es la sumatoria
        td.textContent = valor.toFixed(8);
        td.className = 'font-semibold bg-yellow-50';
      } else {
        td.textContent = valor.toFixed(6);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function procesarDatos(datosY) {
  const valoresXY = [];
  const allX = [];
  const allY = [];

  for (let i = 0; i < datosY.length; i++) {
    const x = i; 
    const y = datosY[i][datosY[i].length - 1]; 
    allX.push(x);
    allY.push(y);
    valoresXY.push({ x, y });
  }

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
  xMinElement.textContent = xMin.toFixed(0);
  xMaxElement.textContent = xMax.toFixed(0);
  yMinElement.textContent = yMin.toFixed(4);
  yMaxElement.textContent = yMax.toFixed(4);
}

function mostrarTablaNormalizada(valoresXY) {
  const tbody = tablaNormalizada.querySelector('tbody');
  tbody.innerHTML = '';

  valoresXY.forEach(punto => {
    const tr = document.createElement('tr');
    
    const tdX = document.createElement('td');
    tdX.textContent = punto.xNorm.toFixed(8);
    tr.appendChild(tdX);
    
    const tdY = document.createElement('td');
    tdY.textContent = punto.yNorm.toFixed(8);
    tr.appendChild(tdY);
    
    tbody.appendChild(tr);
  });
}

function generarPromediosPorRango(valoresXY, anchoRango) {
  const promedios = [];
  let inicio = 0;
  
  while (inicio < 1) {
    const fin = Math.min(inicio + anchoRango, 1);
    const puntosEnRango = valoresXY.filter(p => p.xNorm >= inicio && p.xNorm < fin);
    
    let promY = 0;
    if (puntosEnRango.length > 0) {
      const sumY = puntosEnRango.reduce((sum, p) => sum + p.yNorm, 0);
      promY = sumY / puntosEnRango.length;
    }
    
    const puntoMedio = inicio + anchoRango/2;
    
    promedios.push({
      xa: inicio,
      xb: fin,
      xCentro: puntoMedio,
      yPromedio: promY
    });
    
    inicio = fin;
  }
  
  return promedios;
}

function mostrarTablaPromedios(promedios, tabla) {
  const tbody = tabla.querySelector('tbody');
  tbody.innerHTML = '';

  promedios.forEach(promedio => {
    const tr = document.createElement('tr');
    
    const tdXa = document.createElement('td');
    tdXa.textContent = promedio.xa.toFixed(2);
    tr.appendChild(tdXa);
    
    const tdXb = document.createElement('td');
    tdXb.textContent = promedio.xb.toFixed(2);
    tr.appendChild(tdXb);
    
    const tdXCentro = document.createElement('td');
    tdXCentro.textContent = promedio.xCentro.toFixed(3);
    tr.appendChild(tdXCentro);
    
    const tdYPromedio = document.createElement('td');
    tdYPromedio.textContent = promedio.yPromedio.toFixed(8);
    tr.appendChild(tdYPromedio);
    
    tbody.appendChild(tr);
  });
}

function crearGraficos(valoresXY, promedios01, promedios005) {
  if (graficoNormalizado) graficoNormalizado.destroy();
  if (graficoPromedio01) graficoPromedio01.destroy();
  if (graficoPromedio005) graficoPromedio005.destroy();
  if (graficoCombinado) graficoCombinado.destroy();
  
  // 1. Gráfico de valores normalizados
  const ctxNorm = document.getElementById('graficoNormalizado').getContext('2d');
  const datosOrdenados = [...valoresXY].sort((a, b) => a.xNorm - b.xNorm);
  graficoNormalizado = new Chart(ctxNorm, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Y normalizado vs X normalizado',
        data: datosOrdenados.map(p => ({ x: p.xNorm, y: p.yNorm })),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: false,
        tension: 1,
        pointRadius: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
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
      labels: promedios01.map(p => p.xCentro.toFixed(2)),
      datasets: [{
        label: 'Promedio Y (rangos de 0.1)',
        data: promedios01.map(p => p.yPromedio),
        fill: false,
        tension: 1,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
  
  // 3. Gráfico de promedios por rangos de 0.05
  const ctx005 = document.getElementById('graficoPromedio005').getContext('2d');
  graficoPromedio005 = new Chart(ctx005, {
    type: 'line',
    data: {
      labels: promedios005.map(p => p.xCentro.toFixed(2)),
      datasets: [{
        label: 'Promedio Y (rangos de 0.05)',
        data: promedios005.map(p => p.yPromedio),
        fill: false,
        tension: 1,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
  
  // 4. Gráfico combinado
  const ctxCombinado = document.getElementById('graficoCombinado').getContext('2d');
  const datosOrdenadosCombinado = [...valoresXY].sort((a, b) => a.xNorm - b.xNorm);
  graficoCombinado = new Chart(ctxCombinado, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Valores normalizados',
          data: datosOrdenadosCombinado.map(p => ({ x: p.xNorm, y: p.yNorm })),
          borderColor: 'rgba(54, 162, 235, 0.6)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          pointRadius: 1,
          fill: false,
          tension: 1,
          type: 'line' 
        },
        {
          label: 'Promedio (rango 0.1)',
          data: promedios01.map(p => ({ x: p.xCentro, y: p.yPromedio })),
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 1,
          pointRadius: 3,
          type: 'line'
        },
        {
          label: 'Promedio (rango 0.05)',
          data: promedios005.map(p => ({ x: p.xCentro, y: p.yPromedio })),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 1,
          pointRadius: 2,
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
          position: 'bottom',
          title: {
            display: true,
            text: 'X Normalizado'
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Y Normalizado'
          }
        }
      }
    }
  });
}

function reiniciar() {
  // Limpiar tablas
  tablaCoeficientes.querySelector('tbody').innerHTML = '';
  tablaY.querySelector('tbody').innerHTML = '';
  tablaNormalizada.querySelector('tbody').innerHTML = '';
  tablaPromedio01.querySelector('tbody').innerHTML = '';
  tablaPromedio005.querySelector('tbody').innerHTML = '';
  
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