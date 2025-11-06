let playerResponses = {};
let playerDialogs = {};
let timer;

// Function to prompt players
function promptPlayersForReadyCheck() {
  timer = setTimeout(() => {
    // Send a socket message to close all dialogs
    game.socket.emit('Macro.3on2qg838ltmNQyw', {
      action: 'closeElevatorDialog',
    });

    playerResponses = {};
    playerDialogs = {};
  }, 30000);

  // Send a message to all clients to open the dialog
  game.socket.emit('Macro.3on2qg838ltmNQyw', {
    action: 'openElevatorDialog',
  });
}

// Function to check if all players have responded
function checkAllPlayersReady() {
  if (Object.keys(playerResponses).length === game.users.players.length) {
    let allReady = Object.values(playerResponses).every(
      (response) => response === true
    );
    if (allReady) {
      ui.notifications.info('Descendiendo ...');
      game.scenes.get('4qRqSS1VlSSRSrzD').activate();

      // Send a socket message to close all dialogs
      game.socket.emit('Macro.3on2qg838ltmNQyw', {
        action: 'closeElevatorDialog',
      });
    } else {
      ui.notifications.warn('No todos los jugadores están listos.');
    }
    clearTimeout(timer);
  }
}

Hooks.on('ready', () => {
  // Socket listener to open the dialog
  game.socket.on('Macro.3on2qg838ltmNQyw', (data) => {
    if (data.action === 'openElevatorDialog') {
      let dialogContent = `
      <p>Estas listo para activar el ascensor?</p>
    `;

      let dialog = new Dialog({
        title: 'Ready Check',
        content: dialogContent,
        buttons: {
          ready: {
            label: 'Listo',
            callback: () => {
              playerResponses[game.user.id] = true;
              checkAllPlayersReady();
              game.socket.emit('Macro.3on2qg838ltmNQyw', {
                action: 'playerResponse',
                playerId: game.user.id,
                response: true,
              });
            },
          },
          notReady: {
            label: 'Todavía no',
            callback: () => {
              playerResponses[game.user.id] = false;
              checkAllPlayersReady();
              game.socket.emit('Macro.3on2qg838ltmNQyw', {
                action: 'playerResponse',
                playerId: game.user.id,
                response: false,
              });
            },
          },
        },
        default: 'ready',
      });
      dialog.render(true);
      playerDialogs[game.user.id] = dialog;
    }

    if (data.action === 'closeElevatorDialog') {
      if (playerDialogs[game.user.id]) {
        playerDialogs[game.user.id].close();
      }
    }
  });

  // Socket listener to receive player responses
  game.socket.on('Macro.3on2qg838ltmNQyw', (data) => {
    if (data.action === 'playerResponse') {
      playerResponses[data.playerId] = data.response;
      checkAllPlayersReady();
    }
  });
  console.log('functions defined');
});

