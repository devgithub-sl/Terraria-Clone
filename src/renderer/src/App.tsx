import { onMount, onCleanup, createSignal, Show } from 'solid-js';
import { Game } from './game/Game';
import { PLAYER_MAX_HP } from './game/constants';

type AppState = 'MENU' | 'GAME' | 'PAUSE';

const App = () => {
  let gameDiv: HTMLDivElement | undefined;
  let game: Game | null = null;
  
  const [state, setState] = createSignal<AppState>('MENU');
  const [seedInput, setSeedInput] = createSignal(Math.floor(Math.random() * 1000).toString());
  const [hp, setHp] = createSignal(PLAYER_MAX_HP);

  onMount(() => {
    if (!gameDiv) return;
    
    game = new Game();
    game.init(gameDiv);
    game.isPaused = true;

    // Update HP UI every second (simple polling)
    setInterval(() => {
        if (game && game.player) setHp(game.player.hp);
    }, 100);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state() === 'GAME') {
            setState('PAUSE');
            if (game) game.isPaused = true;
        } else if (state() === 'PAUSE') {
            setState('GAME');
            if (game) game.isPaused = false;
        }
      }
    });
  });

  onCleanup(() => game?.destroy());

  const startGame = () => {
    const s = parseInt(seedInput()) || Math.random();
    game?.restart(s);
    game!.isPaused = false;
    setState('GAME');
  };

  const resumeGame = () => {
    game!.isPaused = false;
    setState('GAME');
  };

  const quitToMenu = () => {
    game!.isPaused = true;
    setState('MENU');
  };

  const menuStyle = {
    position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', "flex-direction": 'column', "justify-content": 'center', "align-items": 'center',
    background: 'rgba(0,0,0,0.8)', color: 'white', "z-index": 10
  };
  
  const btnStyle = {
    padding: '15px 30px', "font-size": '20px', margin: '10px',
    cursor: 'pointer', background: '#4CAF50', border: 'none', color: 'white', "border-radius": '5px'
  };

  return (
    <>
      <div ref={gameDiv} style={{ width: '100vw', height: '100vh' }} />

      <Show when={state() === 'MENU'}>
        <div style={menuStyle}>
          <h1 style={{ "font-size": '60px', "margin-bottom": '20px' }}>TERRARIA v0.5</h1>
          <div style={{ margin: '20px' }}>
            <label>Seed: </label>
            <input type="text" value={seedInput()} onInput={(e) => setSeedInput(e.currentTarget.value)} style={{ padding: '10px' }}/>
          </div>
          <button onClick={startGame} style={btnStyle}>New Game</button>
        </div>
      </Show>

      <Show when={state() === 'PAUSE'}>
        <div style={menuStyle}>
          <h1>PAUSED</h1>
          <button onClick={resumeGame} style={btnStyle}>Resume</button>
          <button onClick={quitToMenu} style={{ ...btnStyle, background: '#f44336' }}>Quit to Menu</button>
        </div>
      </Show>

      <Show when={state() === 'GAME'}>
        <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', "font-size": '20px', "font-weight": 'bold' }}>
          <span style={{ color: 'red' }}>❤ {hp()} / {PLAYER_MAX_HP}</span>
        </div>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white' }}>
            <p>Left Click Enemy to Attack (Range: Short)</p>
        </div>
      </Show>
    </>
  );
};

export default App;