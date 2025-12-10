import { onMount, onCleanup, createSignal, JSX } from 'solid-js';
import { Game } from './game/Game';
import { BLOCK_DIRT, BLOCK_STONE, BLOCK_LAVA } from './game/constants';

const App = (): JSX.Element => {
  let gameContainer: HTMLDivElement | undefined;
  let gameInstance: Game | null = null;
  const [selected, setSelected] = createSignal("Dirt");

  onMount(() => {
    if (!gameContainer) return;
    
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') setSelected("Dirt");
      if (e.key === '2') setSelected("Stone");
      if (e.key === '3') setSelected("Lava");
    });

    gameInstance = new Game();
    gameInstance.init(gameContainer);
  });

  onCleanup(() => {
    gameInstance?.destroy();
  });

  return (
    <>
      <div ref={gameContainer} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
      
      {/* HUD / UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '10px',
        background: 'rgba(0,0,0,0.5)',
        "border-radius": '8px',
        color: 'white',
        "font-family": 'monospace',
        "pointer-events": 'none',
        "user-select": 'none'
      }}>
        <h2 style={{margin: '0 0 5px 0'}}>Terraria Clone v0.3</h2>
        <div style={{ "margin-bottom": '10px' }}>
          <strong>Current Tool: </strong> 
          <span style={{ color: '#FFFF00' }}>{selected()}</span>
        </div>
        <div style={{ "font-size": '12px', opacity: 0.8 }}>
          [1] Dirt <br/>
          [2] Stone <br/>
          [3] Lava <br/>
          [Click] Mine <br/>
          [R-Click] Place
        </div>
      </div>
    </>
  );
};

export default App;