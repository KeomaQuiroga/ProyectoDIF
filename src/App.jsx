import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ParkingDashboard() {
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [tiemposTranscurridos, setTiemposTranscurridos] = useState({});

  // URL y clave de Supabase (reemplaza con tus valores)
  const SUPABASE_URL = 'https://dfadektrfptrqpywitws.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYWRla3RyZnB0cnFweXdpdHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDY3NTcsImV4cCI6MjA5MzgyMjc1N30.j-Cjm-lWwApMkiK-VbKFgFx5fkLNBmdml9_stYNT6DU';

  // Función para obtener espacios de Supabase
  const obtenerEspacios = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/parqueadero?order=numero_espacio.asc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const datos = await response.json();
        setEspacios(datos);
        setUltimaActualizacion(new Date());
        setCargando(false);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  // Función auxiliar para compensar el desfase de 5 horas
  const ajustarHoraEcuador = (horaSupabase) => {
    const fecha = new Date(horaSupabase);
    // Le sumamos las 5 horas que JavaScript restó por la zona horaria
    fecha.setHours(fecha.getHours() + 5);
    return fecha;
  };

  // Calcular tiempo transcurrido
  const calcularTiempoTranscurrido = (horaEntrada) => {
    if (!horaEntrada) return null;
    
    // Usamos nuestra función de ajuste en lugar de new Date() directo
    const entrada = ajustarHoraEcuador(horaEntrada);
    const ahora = new Date(); // Hora actual local
    
    const diferencia = Math.floor((ahora - entrada) / 1000);

    // Evitamos números negativos si hay un ligero desfase de milisegundos
    if (diferencia < 0) return '0s';

    if (diferencia < 60) {
      return `${diferencia}s`;
    } else if (diferencia < 3600) {
      return `${Math.floor(diferencia / 60)}m`;
    } else {
      const horas = Math.floor(diferencia / 3600);
      const minutos = Math.floor((diferencia % 3600) / 60);
      return `${horas}h ${minutos}m`;
    }
  };

  // Actualizar tiempos transcurridos cada segundo
  useEffect(() => {
    const intervalo = setInterval(() => {
      const nuevosTiempos = {};
      espacios.forEach(espacio => {
        if (espacio.estado === true && espacio.hora_entrada) {
          nuevosTiempos[espacio.id] = calcularTiempoTranscurrido(espacio.hora_entrada);
        }
      });
      setTiemposTranscurridos(nuevosTiempos);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [espacios]);

  // Polling cada 3 segundos
  useEffect(() => {
    obtenerEspacios();
    const intervaloPolling = setInterval(obtenerEspacios, 3000);
    return () => clearInterval(intervaloPolling);
  }, []);

  const obtenerFormatoHora = (horaEntrada) => {
    if (!horaEntrada) return '--:--';
    
    // Usamos la misma función de ajuste
    const fecha = ajustarHoraEcuador(horaEntrada);
    
    const formatter = new Intl.DateTimeFormat('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return formatter.format(fecha);
  };

  const estilos = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #333;
    }

    .contenedor-principal {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .encabezado {
      max-width: 1400px;
      margin: 0 auto 50px;
    }

    .titulo-seccion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .titulo-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    h1 {
      font-size: 36px;
      font-weight: 900;
      color: white;
      letter-spacing: -1px;
      line-height: 1;
    }

    .subtitulo {
      font-size: 14px;
      color: #9ca3af;
      margin-top: 8px;
    }

    .btn-actualizar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .btn-actualizar:hover {
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
      transform: translateY(-2px);
    }

    .btn-actualizar svg {
      width: 20px;
      height: 20px;
    }

    .info-actualizacion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      background: rgba(71, 85, 105, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      margin-bottom: 30px;
    }

    .info-actualizacion span {
      font-size: 13px;
      color: #cbd5e1;
    }

    .info-actualizacion strong {
      color: #22d3ee;
      font-weight: 600;
    }

    .indicador-vivo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .punto-vivo {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .grid-espacios {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .espacio-card {
      border-radius: 16px;
      padding: 30px 25px;
      transition: all 0.3s ease;
      border: 2px solid;
      position: relative;
      overflow: hidden;
      min-height: 320px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .espacio-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
      opacity: 0.5;
      pointer-events: none;
    }

    .espacio-card.libre {
      border-color: rgba(16, 185, 129, 0.5);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
    }

    .espacio-card.libre:hover {
      border-color: rgba(16, 185, 129, 0.8);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
      transform: translateY(-4px);
    }

    .espacio-card.ocupado {
      border-color: rgba(239, 68, 68, 0.5);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
    }

    .espacio-card.ocupado:hover {
      border-color: rgba(239, 68, 68, 0.8);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
      transform: translateY(-4px);
    }

    .numero-espacio {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .numero-grande {
      font-size: 56px;
      font-weight: 900;
      color: #e2e8f0;
      line-height: 1;
      margin-bottom: 20px;
    }

    .estado-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 25px;
    }

    .punto-estado {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .espacio-card.libre .punto-estado {
      background: #10b981;
    }

    .espacio-card.ocupado .punto-estado {
      background: #ef4444;
    }

    .texto-estado {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .espacio-card.libre .texto-estado {
      color: #10b981;
    }

    .espacio-card.ocupado .texto-estado {
      color: #ef4444;
    }

    .info-tiempo {
      padding-top: 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      position: relative;
      z-index: 1;
    }

    .etiqueta-tiempo {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .hora-entrada {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      color: #cbd5e1;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .tiempo-transcurrido-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(71, 85, 105, 0.4);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .tiempo-transcurrido-box span:first-child {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
    }

    .tiempo-transcurrido-box span:last-child {
      font-size: 13px;
      font-weight: 700;
      color: #22d3ee;
    }

    .sin-vehiculo {
      color: #94a3b8;
      font-size: 13px;
    }

    .cargando {
      display: flex;
      align-items: center;
      justify-content: center;
      grid-column: 1 / -1;
      padding: 60px 20px;
    }

    .spinner {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #94a3b8;
      font-size: 14px;
    }

    .spinner svg {
      width: 24px;
      height: 24px;
      color: #3b82f6;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .footer {
      text-align: center;
      margin-top: 50px;
      color: #64748b;
      font-size: 12px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .grid-espacios {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .grid-espacios {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 28px;
      }

      .titulo-seccion {
        flex-direction: column;
        gap: 20px;
      }

      .btn-actualizar {
        width: 100%;
        justify-content: center;
      }
    }
  `;

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', minHeight: '100vh' }}>
      <style>{estilos}</style>

      <div className="contenedor-principal">
        {/* Encabezado */}
        <div className="encabezado">
          <div className="titulo-seccion">
            <div className="titulo-info">
              <div>
                <h1>PARQUEADERO</h1>
                <p className="subtitulo">Sistema de Monitoreo en Tiempo Real</p>
              </div>
            </div>
            
            <button className="btn-actualizar" onClick={obtenerEspacios}>
              <RefreshCw size={20} />
              Actualizar
            </button>
          </div>

          {/* Info de actualización */}
          <div className="info-actualizacion">
            <span>
              {ultimaActualizacion ? (
                <>Última actualización: <strong>{ultimaActualizacion.toLocaleTimeString()}</strong></>
              ) : (
                'Cargando datos...'
              )}
            </span>
            <div className="indicador-vivo">
              <div className="punto-vivo"></div>
              <span>En vivo</span>
            </div>
          </div>
        </div>

        {/* Grid de espacios */}
        <div className="grid-espacios">
          {cargando ? (
            <div className="cargando">
              <div className="spinner">
                <RefreshCw size={24} />
                <span>Cargando espacios...</span>
              </div>
            </div>
          ) : (
            espacios.map((espacio) => {
              // estado: true = ocupado, false = libre
              const esLibre = espacio.estado === false;
              const tiempoTranscurrido = tiemposTranscurridos[espacio.id];
              const horaFormato = obtenerFormatoHora(espacio.hora_entrada);

              return (
                <div
                  key={espacio.id}
                  className={`espacio-card ${esLibre ? 'libre' : 'ocupado'}`}
                >
                  {/* Número de espacio */}
                  <div>
                    <div className="numero-espacio">Espacio</div>
                    <div className="numero-grande">{espacio.numero_espacio}</div>

                    {/* Estado */}
                    <div className="estado-badge">
                      <div className="punto-estado"></div>
                      <span className="texto-estado">
                        {esLibre ? 'LIBRE' : 'OCUPADO'}
                      </span>
                    </div>
                  </div>

                  {/* Información de tiempo */}
                  <div className="info-tiempo">
                    {esLibre ? (
                      <p className="sin-vehiculo">Sin vehículo</p>
                    ) : (
                      <div>
                        <div className="etiqueta-tiempo">Entrada</div>
                        <div className="hora-entrada">{horaFormato}</div>
                        {tiempoTranscurrido && (
                          <div className="tiempo-transcurrido-box">
                            <span>Transcurrido:</span>
                            <span>{tiempoTranscurrido}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Sistema de Monitoreo • Arduino + Supabase • Actualización automática cada 3 segundos</p>
        </div>
      </div>
    </div>
  );
}