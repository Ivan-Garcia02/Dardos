import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import './App.css';
import { Button, TextField, ToggleButton, Typography } from '@mui/material';

interface Jugador {
  nombre: string;
  puntuacion: number;
}

function App() {
  const [numJugadores, setNumJugadores] = useState<number>(0);
  const [jugadoresComplete, setJugadoresComplete] = useState<boolean>(false);
  const [nombresJugadores, setNombresJugadores] = useState<string[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [turno, setTurno] = useState<number>(0);
  const [tirada, setTirada] = useState<number>(1);
  const [puntajeActual, setPuntajeActual] = useState<string>('');
  const [selected, setSelected] = useState(false);
  const [selected3, setSelected3] = useState(false);
  const [ganador, setGanador] = useState<string | null>(null);
  const puntajeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (puntajeRef.current) {
      puntajeRef.current.focus();
    }
  }, [turno, tirada]);

  function handleSubmitJugadores() {
    setNombresJugadores(Array(numJugadores).fill(''));
    setJugadoresComplete(true);
  }

  function handleSubmitNombres() {
    const initialJugadores = nombresJugadores.map(nombre => ({
      nombre,
      puntuacion: 301,
    }));
    setJugadores(initialJugadores);
  }

  function handlePuntajeChange(event: ChangeEvent<HTMLInputElement>) {
    setPuntajeActual(event.target.value);
  }

  function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      handlePuntajeSubmit();
    }
  }

  async function handlePuntajeSubmit() {
    let puntaje = selected ? parseInt(puntajeActual) * 2 : selected3 ? parseInt(puntajeActual) * 3 : parseInt(puntajeActual);
    if (isNaN(puntaje)) return;
    let shouldSetNext = false;

    await setJugadores(prevJugadores => {
      return prevJugadores.map((jugador, index) => {
        if (index === turno) {
          const nuevaPuntuacion = jugador.puntuacion - puntaje;
          if (nuevaPuntuacion === 0) {
            setGanador(jugador.nombre);
          }
          if (nuevaPuntuacion < 0) {
            shouldSetNext = true;
          }
          return {
            ...jugador,
            puntuacion: nuevaPuntuacion >= 0 ? nuevaPuntuacion : jugador.puntuacion,
          };
        }
        return jugador;
      });
    });

    if (tirada < 3 && !shouldSetNext) {
      setTirada(tirada + 1);
    } else {
      setTurno((prevTurno) => (prevTurno + 1) % numJugadores);
      setTirada(1);
    }
    setPuntajeActual('');
    setSelected(false);
    setSelected3(false);
  }

  return (
    <>
      <h1>DARDOS</h1>
      {!jugadores.length ? 
        // Introducir número de jugadores y nombres
        <div className="container">
          {!jugadoresComplete ? (
            <div className="input-group">
              <Typography variant="body1" component="p">
                Número de jugadores:
              </Typography>
              <TextField
                id="outlined-basic"
                label="Jugadores"
                variant="outlined"
                onChange={(event) => setNumJugadores(Number(event.target.value))}
                className="text-field"
              />
              <Button onClick={handleSubmitJugadores} variant="contained" sx={{mt: 1, backgroundColor: '#3f41b5'}}>
                Continuar
              </Button>
            </div>
          ) : (
            <div className="input-group">
              <Typography variant="body1" component="p">
                Introducir nombres de los jugadores:
              </Typography>
              {nombresJugadores.map((nombre, index) => (
                <TextField
                  key={index}
                  id={`nombre-${index}`}
                  label={`Jugador ${index + 1}`}
                  variant="outlined"
                  value={nombre}
                  onChange={(event) => {
                    const newNombresJugadores = [...nombresJugadores];
                    newNombresJugadores[index] = event.target.value;
                    setNombresJugadores(newNombresJugadores);
                  }}
                  className="text-field"
                />
              ))}
              <Button onClick={handleSubmitNombres} variant="contained" sx={{mt: 1, backgroundColor: '#3f41b5'}}>
                Continuar
              </Button>
            </div>
          )}
        </div>
      : 
        // Sección de juego
        <div className="game-section">
          {ganador ? (
            <Typography variant="h4" component="h2">
              ¡{ganador} ganó!
            </Typography>
          ) : (
            <>
              <Typography variant="h5" component="h2">
                Turno de {jugadores[turno].nombre}
              </Typography>
              <Typography variant="body1" component="p">
                Puntuación: {jugadores[turno].puntuacion}
              </Typography>

              <Typography variant="body1" component="p">
                Tirada {tirada}
              </Typography>
              <TextField
                id="puntaje"
                label={`Tirada ${tirada}`}
                variant="outlined"
                value={puntajeActual}
                onChange={handlePuntajeChange}
                onKeyPress={handleKeyPress}
                inputRef={puntajeRef}
                className="text-field"
              />
              <div className="toggle-buttons">
                <ToggleButton
                  value="check"
                  selected={selected}
                  onChange={() => {
                    setSelected(!selected);
                    setSelected3(false);
                  }}
                  sx={{mt: 1}}
                >
                  2
                </ToggleButton>
                <ToggleButton
                  value="check"
                  selected={selected3}
                  onChange={() => {
                    setSelected3(!selected3);
                    setSelected(false);
                  }}
                  sx={{mt: 1}}
                >
                  3
                </ToggleButton>
              </div>
              <Button onClick={handlePuntajeSubmit} variant="contained" sx={{backgroundColor: '#3f41b5'}}>
                Registrar Puntaje
              </Button>

              {/** Puntacion de todos jugadores */}
              <div className="scores">
                <Typography variant="h6" component="h3">
                  Puntuaciones de todos los jugadores
                </Typography>
                {jugadores.map((jugador, index) => (
                  <Typography key={index} variant="body1" component="p">
                    {jugador.nombre}: {jugador.puntuacion}
                  </Typography>
                ))}
              </div>
            </>
          )}
        </div>
      } 
    </>
  );
}

export default App;
